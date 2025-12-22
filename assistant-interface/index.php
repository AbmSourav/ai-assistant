<?php
/**
 * @package assistant-interface
 * @version 1.0.0
 */
/*
Plugin Name: AI Assistant Interface
Plugin URI: 
Description: 
Author: Keramot UL Islam
Version: 1.0.0
Author URI: https://abmsourav.com
Text Domain: assistant-interface
*/

// Do not load directly.
if ( ! defined( 'ABSPATH' ) ) {
	die();
}

use AssistantInterface\App\Core;

define('AIAI_FILE', __FILE__);
define('AIAI_DIR_PATH', plugin_dir_path(AIAI_FILE));
define('AIAI_DIR_URL', plugins_url('/', AIAI_FILE));

if (file_exists(AIAI_DIR_PATH . '/vendor/autoload.php')) {
	require_once AIAI_DIR_PATH . '/vendor/autoload.php';
}

Core::getInstance();
