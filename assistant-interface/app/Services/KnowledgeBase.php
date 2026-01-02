<?php

namespace AssistantInterface\App\Services;

use AssistantInterface\App\Lib\Http;
use AssistantInterface\App\Lib\SingleTon;
use Codesvault\Validator\Validator;

if (! defined('ABSPATH')) exit;

class KnowledgeBase
{
    use SingleTon;

    public function register()
    {
        add_action('wp_ajax_handleIndexData', [$this, 'handleIndexData']);
        add_action('wp_ajax_getDocuments', [$this, 'getDocuments']);
        add_action('wp_ajax_getDocumentDetails', [$this, 'getDocumentDetails']);
        add_action('wp_ajax_deleteDocument', [$this, 'deleteDocument']);
        add_action('wp_ajax_retrieveAIResponse', [$this, 'retrieveAIResponse']);
    }

    public function handleIndexData()
    {
        $validator = Validator::validate(
            [
                'nonce'     => 'required|string',
                'action'    => 'required|stringOnly',
                'header'    => 'required|string',
                'detail'    => 'required|string',
                'parentId'  => 'string'
            ],
            $_POST
        );

        $errors = $validator->error();
        if ($errors) {
            wp_send_json_error([
                'message' => 'Validation error',
                'errors' => $errors
            ], 403);
        }

        $data = $validator->getData();

        // Verify nonce
        if (!isset($data['nonce']) || !wp_verify_nonce($data['nonce'], 'ai_assistant_nonce')) {
            wp_send_json_error([
                'message' => 'Invalid security token.'
            ], 403);
        }

        $route = '/index/store';
        $body = [
            'header'    => $data['header'],
            'detail'    => $data['detail']
        ];

        // reindex existing document
        if (!empty($data['parentId'])) {
            $route = '/index/re-store';
            $body['parentId'] = $data['parentId'];
        }

        $res = Http::post($route, [
            'body'  => $body
        ]);

        if ($res->getStatusCode() >= 400) {
            wp_send_json_error([
                'message'   => $res->getMessage(),
                'data'      => $data
            ], $res->getStatusCode());
        }
        
        $res_data = $res->getBody();
        wp_send_json_success([
            'message'   => 'Data stored',
            'data'      => $res_data
        ]);
    }

    public function getDocuments()
    {
        $validator = Validator::validate(
            [
                'nonce'     => 'required|string',
                'action'    => 'required|stringOnly',
                'page'      => 'integer',
                'limit'     => 'integer'
            ],
            $_POST
        );

        $errors = $validator->error();
        if ($errors) {
            wp_send_json_error([
                'message' => 'Validation error',
                'errors' => $errors
            ], 403);
        }

        $data = $validator->getData();

        // Verify nonce
        if (!isset($data['nonce']) || !wp_verify_nonce($data['nonce'], 'ai_assistant_nonce')) {
            wp_send_json_error([
                'message' => 'Invalid security token.'
            ], 403);
        }

        $res = Http::get('/documents');

        if ($res->getStatusCode() >= 400) {
            wp_send_json_error([
                'message'   => $res->getMessage(),
                'data'      => $res
            ], $res->getStatusCode());
        }
        
        $res_data = $res->getBody();

        wp_send_json_success([
            'message'   => 'Data collected',
            'points'    => $res_data['data']
        ]);
    }

    public function getDocumentDetails()
    {
        $validator = Validator::validate(
            [
                'nonce'     => 'required|string',
                'action'    => 'required|stringOnly',
                'id'        => 'string|required'
            ],
            $_POST
        );

        $errors = $validator->error();
        if ($errors) {
            wp_send_json_error([
                'message' => 'Validation error',
                'errors' => $errors
            ], 403);
        }

        $data = $validator->getData();

        // Verify nonce
        if (!isset($data['nonce']) || !wp_verify_nonce($data['nonce'], 'ai_assistant_nonce')) {
            wp_send_json_error([
                'message' => 'Invalid security token.'
            ], 403);
        }

        $res = Http::get('/document', [], [
            'parentId'    => $data['id']
        ]);

        if ($res->getStatusCode() >= 400) {
            wp_send_json_error([
                'message'   => $res->getMessage(),
                'data'      => $res
            ], $res->getStatusCode());
        }
        
        $res_data = $res->getBody();
        $details = $this->mergeDocumentDetails($res_data['data'] ?? []);

        wp_send_json_success([
            'message'   => 'Document details collected',
            'header'    => $res_data['data'][0]['payload']['header'] ?? '',
            'details'   => $details
        ]);
    }

    private function mergeDocumentDetails($points)
    {
        if (empty($points)) {
            return '';
        }

        if (count($points) === 1) {
            return $points[0]['payload']['detail'] ?? $points[0]['payload']['dataChunk'] ?? '';
        }

        // Sort points by childIndex to ensure correct order
        usort($points, function($a, $b) {
            $indexA = $a['payload']['childIndex'] ?? 0;
            $indexB = $b['payload']['childIndex'] ?? 0;
            return $indexA - $indexB;
        });

        $merged = '';
        $previousChunk = '';

        foreach ($points as $point) {
            $payload = $point['payload'] ?? [];
            if (empty($payload['childIndex'])) {
                continue;
            }

            $currentChunk = $payload['dataChunk'] ?? '';
            if (empty($currentChunk)) {
                continue;
            }

            // For the first chunk, just add it
            if (empty($merged)) {
                $merged = $currentChunk;
                $previousChunk = $currentChunk;
                continue;
            }

            // Remove overlap between previous and current chunk
            $deduplicatedChunk = $this->removeOverlap($previousChunk, $currentChunk);

            // Append the deduplicated chunk
            $merged .= $deduplicatedChunk;
            $previousChunk = $currentChunk;
        }

        return $merged;
    }

    /**
     * Remove overlapping text between two chunks
     *
     * @param string $previous Previous chunk text
     * @param string $current Current chunk text
     * @return string Current chunk with overlap removed
     */
    private function removeOverlap($previous, $current)
    {
        if (empty($previous) || empty($current)) {
            return $current;
        }

        // Maximum overlap to check (200 chars based on backend chunk overlap)
        $maxOverlap = min(200, strlen($previous), strlen($current));

        // Check for overlap by comparing end of previous with start of current
        for ($overlapLen = $maxOverlap; $overlapLen > 0; $overlapLen--) {
            $prevEnd = substr($previous, -$overlapLen);
            $currStart = substr($current, 0, $overlapLen);

            if ($prevEnd === $currStart) {
                // Found overlap, return current chunk without the overlapping part
                return substr($current, $overlapLen);
            }
        }

        // No overlap found, return current chunk as is
        return $current;
    }

    public function deleteDocument()
    {
        $validator = Validator::validate(
            [
                'nonce'     => 'required|string',
                'action'    => 'required|stringOnly',
                'parentId'  => 'string|required'
            ],
            $_POST
        );

        $errors = $validator->error();
        if ($errors) {
            wp_send_json_error([
                'message' => 'Validation error',
                'errors' => $errors
            ], 403);
        }

        $data = $validator->getData();

        // Verify nonce
        if (!isset($data['nonce']) || !wp_verify_nonce($data['nonce'], 'ai_assistant_nonce')) {
            wp_send_json_error([
                'message' => 'Invalid security token.'
            ], 403);
        }

        $res = Http::post('/index/delete', [
            'body'  => [
                'parentId'  => $data['parentId']
            ]
        ]);

        if ($res->getStatusCode() >= 400) {
            wp_send_json_error([
                'message'   => $res->getMessage(),
                'data'      => $res
            ], $res->getStatusCode());
        }

        wp_send_json_success([
            'message'   => 'Document deleted successfully',
            'data'      => $res->getBody()
            // 'payload'   => $data
        ]);
    }

    public function retrieveAIResponse()
    {
        $validator = Validator::validate(
            [
                'nonce'     => 'required|string',
                'action'    => 'required|stringOnly',
                'query'     => 'required|string'
            ],
            $_POST
        );

        $errors = $validator->error();
        if ($errors) {
            wp_send_json_error([
                'message' => 'Validation error',
                'errors' => $errors
            ], 403);
        }

        $data = $validator->getData();

        // Verify nonce
        if (!isset($data['nonce']) || !wp_verify_nonce($data['nonce'], 'ai_assistant_nonce')) {
            wp_send_json_error([
                'message' => 'Invalid security token.'
            ], 403);
        }

        $res = Http::post('/retrieval', [
            'body'  => [
                'userQuery'  => $data['query']
            ]
        ]);

        if ($res->getStatusCode() >= 400) {
            wp_send_json_error([
                'message'   => $res->getMessage(),
                'data'      => $res
            ], $res->getStatusCode());
        }

        if (empty($res->getBody()['results'])) {
            wp_send_json_success([
                'message'   => 'No relevant data found',
                'results'   => null
            ]);
        }

        wp_send_json_success([
            'message'   => 'Data retrieved successfully',
            'results'   => $res->getBody()['results'] ?? []
        ]);
    }
}
