<?php

namespace AssistantInterface\App\Services;

use AssistantInterface\App\Lib\SingleTon;

if (! defined('ABSPATH')) exit;

class Block
{
    use SingleTon;

    public function register()
    {
        add_action('init', [$this, 'registerBlocks']);
        add_action('wp_enqueue_scripts', [$this, 'localizeBlockScript']);
    }

    public function registerBlocks()
    {
        if (function_exists('register_block_type')) {
            register_block_type(AIAI_DIR_PATH . 'resources/block', [
                'attributes'    => [
                    'pluginUrl' => [
                        'type' => 'string',
                        'default' => plugins_url('', AIAI_FILE),
                    ],
                ]
            ]);
        }
    }

    public function localizeBlockScript()
    {
        if (! has_block('assistant-interface/chat-block')) {
            return;
        }

        wp_localize_script(
            'assistant-interface-chat-block-view-script',
            'aiAssistantData',
            [
                'ajaxUrl'   => admin_url('admin-ajax.php'),
                'nonce'     => wp_create_nonce('ai_assistant_nonce'),
                'siteUrl'   => get_site_url(),
                'pluginUrl' => plugins_url('', AIAI_FILE),
            ]
        );
    }
}
