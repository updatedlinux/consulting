<?php
/**
 * Plugin Name: Condo360 Surveys
 * Description: Survey management system for condominium residents
 * Version: 1.0.0
 * Author: Condo360
 * Text Domain: condo360-surveys
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('CONDO360_SURVEYS_VERSION', '1.0.0');
define('CONDO360_SURVEYS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CONDO360_SURVEYS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once CONDO360_SURVEYS_PLUGIN_DIR . 'includes/class-condo360-surveys.php';

// Initialize the plugin
function condo360_surveys_init() {
    $plugin = new Condo360_Surveys();
}
add_action('plugins_loaded', 'condo360_surveys_init');