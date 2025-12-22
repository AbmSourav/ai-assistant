<?php

namespace AssistantInterface\App;

use AssistantInterface\App\Lib\SingleTon;

if (! defined('ABSPATH')) exit;

class Assets
{
    use SingleTon;

    public function register()
    {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }

    public function enqueue_admin_assets($hook)
    {
        // Only load on our AI Assistant admin page
        if ($hook !== 'toplevel_page_ai-assistant-interface') {
            return;
        }

        $asset_file = AIAI_DIR_PATH . 'build/app.asset.php';

        if (file_exists($asset_file)) {
            $asset_data = require $asset_file;

            wp_enqueue_script(
                'ai-assistant-app',
                AIAI_DIR_URL . 'build/app.js',
                $asset_data['dependencies'],
                $asset_data['version'],
                true
            );

            if (file_exists(AIAI_DIR_PATH . 'build/app.css')) {
                wp_enqueue_style(
                    'ai-assistant-app',
                    AIAI_DIR_URL . 'build/app.css',
                    [],
                    $asset_data['version']
                );
            }
        }
    }
}
