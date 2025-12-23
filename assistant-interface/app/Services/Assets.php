<?php

namespace AssistantInterface\App\Services;

use AssistantInterface\App\Lib\SingleTon;

if (! defined('ABSPATH')) exit;

class Assets
{
    use SingleTon;

    public function register()
    {
        add_action('admin_enqueue_scripts', [$this, 'enqueueAdminAssets']);
    }

    private function devServerRunning($dev_server_url)
    {
        $req = curl_init($dev_server_url);
        curl_setopt($req, CURLOPT_NOBODY, true);
        curl_exec($req);
        return curl_getinfo($req, CURLINFO_HTTP_CODE);
    }

    private function productionAssets($asset_data)
    {
        wp_enqueue_script(
            'ai-assistant-app',
            AIAI_DIR_URL . 'build/app.js',
            $asset_data['dependencies'],
            $asset_data['version'],
            true
        );

        $this->localizeScript();

        wp_enqueue_style(
            'ai-assistant-app',
            AIAI_DIR_URL . 'build/app.css',
            [],
            $asset_data['version']
        );
    }

    private function localizeScript()
    {
        wp_localize_script(
            'ai-assistant-app',
            'aiAssistantData',
            [
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('ai_assistant_nonce'),
                'siteUrl' => get_site_url()
            ]
        );
    }

    public function enqueueAdminAssets($hook)
    {
        // Only load on our AI Assistant admin pages
        $allowed_pages = [
            'toplevel_page_ai-assistant-interface',
            'ai-assistant_page_ai-assistant-knowledge-base'
        ];

        if (!in_array($hook, $allowed_pages)) {
            return;
        }

        $asset_file = AIAI_DIR_PATH . 'build/app.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset_data = require $asset_file;
        $dev_server_url = 'http://localhost:8887/';
        $is_dev_mode = defined('WP_DEBUG') && WP_DEBUG;

        // Development mode: load from webpack dev server
        if ($is_dev_mode) {
            // If dev server is not running then load build scripts
            if ($this->devServerRunning($dev_server_url . 'app.js') !== 200) {
                return $this->productionAssets($asset_data);
            } 

            // Enqueue runtime first (contains webpack runtime + HMR)
            wp_enqueue_script(
                'ai-assistant-runtime',
                $dev_server_url . 'runtime.js',
                [],
                time(),
                true
            );

            // Then enqueue app with all WordPress dependencies
            wp_enqueue_script(
                'ai-assistant-app',
                $dev_server_url . 'app.js',
                array_merge(['ai-assistant-runtime'], $asset_data['dependencies']),
                time(),
                true
            );

            $this->localizeScript();

            wp_enqueue_style(
                'ai-assistant-app',
                $dev_server_url . 'app.css',
                [],
                time()
            );

            return;
        }

        // Production mode: load from build directory
        $this->productionAssets($asset_data);
    }
}
