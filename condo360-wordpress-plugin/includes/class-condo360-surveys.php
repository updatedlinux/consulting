<?php
/**
 * Main plugin class
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Condo360_Surveys {
    
    /**
     * Initialize the plugin
     */
    public function init() {
        // Register shortcodes
        add_shortcode('condo360_surveys', array($this, 'render_survey_shortcode'));
        
        // Admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        
        // AJAX handlers
        add_action('wp_ajax_condo360_submit_survey', array($this, 'submit_survey'));
        add_action('wp_ajax_nopriv_condo360_submit_survey', array($this, 'submit_survey'));
    }
    
    /**
     * Plugin activation
     */
    public static function activate() {
        // Nothing to do on activation for now
    }
    
    /**
     * Plugin deactivation
     */
    public static function deactivate() {
        // Nothing to do on deactivation for now
    }
    
    /**
     * Render the survey shortcode
     */
    public function render_survey_shortcode($atts) {
        // Check if user is logged in
        if (!is_user_logged_in()) {
            return '<div class="condo360-survey-message error">' . 
                   __('You must be logged in to view surveys.', 'condo360-surveys') . 
                   '</div>';
        }
        
        // Get current user
        $current_user = wp_get_current_user();
        $user_id = $current_user->ID;
        
        // Load surveys from API
        $surveys = $this->get_active_surveys();
        
        if (is_wp_error($surveys)) {
            return '<div class="condo360-survey-message error">' . 
                   __('Error loading surveys. Please try again later.', 'condo360-surveys') . 
                   '</div>';
        }
        
        // Render the surveys
        ob_start();
        include CONDO360_SURVEYS_PLUGIN_DIR . 'templates/frontend-surveys.php';
        return ob_get_clean();
    }
    
    /**
     * Get active surveys from API
     */
    private function get_active_surveys() {
        $api_url = defined('CONDO360_SURVEYS_API_URL') ? CONDO360_SURVEYS_API_URL : 'http://localhost:3000/polls';
        
        $response = wp_remote_get($api_url . '/surveys');
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $body = wp_remote_retrieve_body($response);
        return json_decode($body, true);
    }
    
    /**
     * Submit survey via AJAX
     */
    public function submit_survey() {
        // Check nonce
        if (!wp_verify_nonce($_POST['nonce'], 'condo360_survey_nonce')) {
            wp_die('Security check failed');
        }
        
        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_die('You must be logged in to submit a survey');
        }
        
        $current_user = wp_get_current_user();
        $user_id = $current_user->ID;
        
        // Get survey data
        $survey_id = intval($_POST['survey_id']);
        $responses = $_POST['responses'];
        
        // Prepare data for API
        $api_data = array(
            'wp_user_id' => $user_id,
            'responses' => $responses
        );
        
        $api_url = defined('CONDO360_SURVEYS_API_URL') ? CONDO360_SURVEYS_API_URL : 'http://localhost:3000/polls';
        
        // Send data to API
        $response = wp_remote_post($api_url . '/surveys/' . $survey_id . '/vote', array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($api_data),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => 'Error connecting to survey service'));
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($response_code === 200) {
            wp_send_json_success(array('message' => 'Vote recorded successfully'));
        } else {
            wp_send_json_error(array('message' => $response_body['error'] ?? 'Error submitting survey'));
        }
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('Cartas Consulta', 'condo360-surveys'),
            __('Cartas Consulta', 'condo360-surveys'),
            'manage_options',
            'condo360-surveys',
            array($this, 'admin_page'),
            'dashicons-analytics',
            30
        );
        
        add_submenu_page(
            'condo360-surveys',
            __('Create Survey', 'condo360-surveys'),
            __('Create Survey', 'condo360-surveys'),
            'manage_options',
            'condo360-create-survey',
            array($this, 'create_survey_page')
        );
        
        add_submenu_page(
            'condo360-surveys',
            __('Survey Results', 'condo360-surveys'),
            __('Results', 'condo360-surveys'),
            'manage_options',
            'condo360-survey-results',
            array($this, 'survey_results_page')
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        // Get all surveys
        $api_url = defined('CONDO360_SURVEYS_API_URL') ? CONDO360_SURVEYS_API_URL : 'http://localhost:3000/polls';
        
        $response = wp_remote_get($api_url . '/surveys/all');
        
        if (is_wp_error($response)) {
            $surveys = array();
        } else {
            $body = wp_remote_retrieve_body($response);
            $surveys = json_decode($body, true);
        }
        
        include CONDO360_SURVEYS_PLUGIN_DIR . 'templates/admin-dashboard.php';
    }
    
    /**
     * Create survey page
     */
    public function create_survey_page() {
        if ($_POST && isset($_POST['condo360_create_survey_nonce'])) {
            if (wp_verify_nonce($_POST['condo360_create_survey_nonce'], 'condo360_create_survey')) {
                // Process form submission
                $this->process_create_survey();
            }
        }
        
        include CONDO360_SURVEYS_PLUGIN_DIR . 'templates/admin-create-survey.php';
    }
    
    /**
     * Process create survey form
     */
    private function process_create_survey() {
        // Prepare survey data
        $survey_data = array(
            'title' => sanitize_text_field($_POST['survey_title']),
            'description' => sanitize_textarea_field($_POST['survey_description']),
            'start_date' => $_POST['start_date'],
            'end_date' => $_POST['end_date'],
            'questions' => array()
        );
        
        // Process questions
        $question_count = intval($_POST['question_count']);
        for ($i = 1; $i <= $question_count; $i++) {
            if (!empty($_POST['question_' . $i])) {
                $question = array(
                    'question_text' => sanitize_textarea_field($_POST['question_' . $i]),
                    'question_order' => $i,
                    'options' => array()
                );
                
                // Process options for this question
                $option_count = intval($_POST['option_count_' . $i]);
                for ($j = 1; $j <= $option_count; $j++) {
                    if (!empty($_POST['option_' . $i . '_' . $j])) {
                        $question['options'][] = array(
                            'option_text' => sanitize_text_field($_POST['option_' . $i . '_' . $j])
                        );
                    }
                }
                
                $survey_data['questions'][] = $question;
            }
        }
        
        // Send to API
        $api_url = defined('CONDO360_SURVEYS_API_URL') ? CONDO360_SURVEYS_API_URL : 'http://localhost:3000/polls';
        
        $response = wp_remote_post($api_url . '/surveys', array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($survey_data),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            add_action('admin_notices', function() {
                echo '<div class="notice notice-error"><p>Error creating survey: ' . $response->get_error_message() . '</p></div>';
            });
            return;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        
        if ($response_code === 201) {
            add_action('admin_notices', function() {
                echo '<div class="notice notice-success"><p>Survey created successfully!</p></div>';
            });
        } else {
            $body = json_decode(wp_remote_retrieve_body($response), true);
            add_action('admin_notices', function() use ($body) {
                echo '<div class="notice notice-error"><p>Error creating survey: ' . esc_html($body['error']) . '</p></div>';
            });
        }
    }
    
    /**
     * Survey results page
     */
    public function survey_results_page() {
        $survey_id = isset($_GET['survey_id']) ? intval($_GET['survey_id']) : 0;
        
        if ($survey_id > 0) {
            // Get survey results
            $api_url = defined('CONDO360_SURVEYS_API_URL') ? CONDO360_SURVEYS_API_URL : 'http://localhost:3000/polls';
            
            $response = wp_remote_get($api_url . '/surveys/' . $survey_id . '/results?admin=true');
            
            if (is_wp_error($response)) {
                $results = null;
            } else {
                $body = wp_remote_retrieve_body($response);
                $results = json_decode($body, true);
            }
            
            include CONDO360_SURVEYS_PLUGIN_DIR . 'templates/admin-survey-results.php';
        } else {
            // Show list of surveys to select
            $api_url = defined('CONDO360_SURVEYS_API_URL') ? CONDO360_SURVEYS_API_URL : 'http://localhost:3000/polls';
            
            $response = wp_remote_get($api_url . '/surveys/all');
            
            if (is_wp_error($response)) {
                $surveys = array();
            } else {
                $body = wp_remote_retrieve_body($response);
                $surveys = json_decode($body, true);
            }
            
            include CONDO360_SURVEYS_PLUGIN_DIR . 'templates/admin-select-survey.php';
        }
    }
    
    /**
     * Enqueue frontend assets
     */
    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'condo360-surveys-css',
            CONDO360_SURVEYS_PLUGIN_URL . 'assets/css/surveys.css',
            array(),
            CONDO360_SURVEYS_VERSION
        );
        
        wp_enqueue_script(
            'condo360-surveys-js',
            CONDO360_SURVEYS_PLUGIN_URL . 'assets/js/surveys.js',
            array('jquery'),
            CONDO360_SURVEYS_VERSION,
            true
        );
        
        wp_localize_script('condo360-surveys-js', 'condo360_surveys_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('condo360_survey_nonce')
        ));
    }
    
    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook) {
        // Only load on our plugin pages
        if (strpos($hook, 'condo360-surveys') === false) {
            return;
        }
        
        wp_enqueue_style(
            'condo360-admin-css',
            CONDO360_SURVEYS_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            CONDO360_SURVEYS_VERSION
        );
        
        wp_enqueue_script(
            'condo360-admin-js',
            CONDO360_SURVEYS_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            CONDO360_SURVEYS_VERSION,
            true
        );
    }
}