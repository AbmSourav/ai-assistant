<?php

namespace AssistantInterface\App;

use AssistantInterface\App\Lib\SingleTon;

if (! defined('ABSPATH')) exit;

class AdminInterface
{
    use SingleTon;

    public function register()
    {
        if (! is_admin()) {
            return;
        }

        add_action('admin_menu', [$this, 'add_admin_menu']);
    }

    public function add_admin_menu()
    {
        add_menu_page(
            __('AI Assistant', 'assistant-interface'),
            __('AI Assistant', 'assistant-interface'),
            'manage_options',
            'ai-assistant-interface',
            [$this, 'render_admin_page'],
            'dashicons-admin-comments',
            30
        );
    }

    public function render_admin_page()
    {
        require_once AIAI_DIR_PATH . 'app/Views/admin.php';
    }
}
