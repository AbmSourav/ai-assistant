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
    }

    public function handleIndexData()
    {
        $validator = Validator::validate(
            [
                'nonce'     => 'required|string',
                'action'    => 'required|stringOnly',
                'title'     => 'required|string',
                'details'   => 'required|string'
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

        $res = Http::get('/test');

        $demo_data = [
            'res' => $res->getBody()
        ];

        // Send success response
        wp_send_json_success([
            'message' => 'Data received successfully! Title: "' . esc_html($data['title']) . '" with ' . $demo_data['word_count'] . ' words.',
            'data' => $demo_data
        ]);
    }
}
