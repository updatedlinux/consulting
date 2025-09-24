<?php
/**
 * Admin functionality for Condo360 Surveys
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

class Condo360_Surveys_Admin {
    
    /**
     * The unique identifier of this plugin.
     */
    protected $plugin_name;
    
    /**
     * The current version of the plugin.
     */
    protected $version;
    
    /**
     * Define the core functionality of the admin panel.
     */
    public function __construct() {
        $this->plugin_name = 'condo360-surveys-admin';
        $this->version = '1.0.0';
        
        // Add admin menu and shortcode
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_ajax_condo360_admin_get_surveys', array($this, 'get_surveys'));
        add_action('wp_ajax_condo360_admin_create_survey', array($this, 'create_survey'));
        add_action('wp_ajax_condo360_admin_close_survey', array($this, 'close_survey'));
        add_action('wp_ajax_condo360_admin_get_survey_results', array($this, 'get_survey_results'));
        add_action('wp_ajax_condo360_admin_load_template', array($this, 'load_template'));
        add_shortcode('condo360_admin_surveys', array($this, 'render_admin_shortcode'));
    }
    
    /**
     * Add admin menu page
     */
    public function add_admin_menu() {
        add_menu_page(
            'Gestión de Cartas Consulta',
            'Cartas Consulta',
            'manage_options',
            'condo360-surveys-admin',
            array($this, 'admin_page'),
            'dashicons-chart-bar',
            30
        );
    }
    
    /**
     * Admin page content
     */
    public function admin_page() {
        // Check if user has permission
        if (!current_user_can('manage_options')) {
            return;
        }
        
        echo '<div class="wrap">';
        echo '<h1>Gestión de Cartas Consulta</h1>';
        echo do_shortcode('[condo360_admin_surveys]');
        echo '</div>';
    }
    
    /**
     * Render the admin surveys shortcode
     */
    public function render_admin_shortcode($atts) {
        // Check if user has permission
        if (!current_user_can('manage_options')) {
            return '<p>No tienes permisos para acceder a esta sección.</p>';
        }
        
        // Enqueue admin scripts and styles
        wp_enqueue_style(
            'condo360-surveys-admin',
            plugin_dir_url(__FILE__) . '../assets/css/admin.css',
            array(),
            $this->version,
            'all'
        );
        
        wp_enqueue_script(
            'condo360-surveys-admin-js',
            plugin_dir_url(__FILE__) . '../assets/js/admin.js',
            array('jquery'),
            $this->version,
            true
        );
        
        wp_localize_script(
            'condo360-surveys-admin-js',
            'condo360_admin_ajax',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('condo360_admin_nonce')
            )
        );
        
        // Load admin template
        ob_start();
        include plugin_dir_path(__FILE__) . '../templates/admin-dashboard.php';
        return ob_get_clean();
    }
    
    /**
     * Load template via AJAX
     */
    public function load_template() {
        // Verify nonce and permissions
        if (!wp_verify_nonce($_POST['nonce'], 'condo360_admin_nonce') || !current_user_can('manage_options')) {
            wp_die('Security check failed');
        }
        
        $template = sanitize_text_field($_POST['template']);
        $template_path = plugin_dir_path(__FILE__) . '../templates/' . $template . '.php';
        
        if (file_exists($template_path)) {
            // Extract variables if provided
            if (isset($_POST['surveys'])) {
                $surveys = $_POST['surveys'];
            }
            if (isset($_POST['survey'])) {
                $survey = $_POST['survey'];
            }
            if (isset($_POST['results'])) {
                $results = $_POST['results'];
            }
            
            ob_start();
            include $template_path;
            $html = ob_get_clean();
            wp_send_json_success(array('html' => $html));
        } else {
            wp_send_json_error(array('message' => 'Template not found.'));
        }
    }
    
    /**
     * Get all surveys via AJAX
     */
    public function get_surveys() {
        // Verify nonce and permissions
        if (!wp_verify_nonce($_POST['nonce'], 'condo360_admin_nonce') || !current_user_can('manage_options')) {
            wp_die('Security check failed');
        }
        
        // Get surveys from API
        $api_url = 'https://api.bonaventurecclub.com/polls/surveys';
        $response = wp_remote_get($api_url, array('timeout' => 30));
        
        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            $surveys = json_decode(wp_remote_retrieve_body($response), true);
            wp_send_json_success(array('surveys' => $surveys));
        } else {
            wp_send_json_error(array('message' => 'Error al obtener las Cartas Consulta.'));
        }
    }
    
    /**
     * Create a new survey via AJAX
     */
    public function create_survey() {
        // Verify nonce and permissions
        if (!wp_verify_nonce($_POST['nonce'], 'condo360_admin_nonce') || !current_user_can('manage_options')) {
            wp_die('Security check failed');
        }
        
        // Get survey data
        $survey_data = array(
            'title' => sanitize_text_field($_POST['title']),
            'description' => sanitize_textarea_field($_POST['description']),
            'start_date' => sanitize_text_field($_POST['start_date']),
            'end_date' => sanitize_text_field($_POST['end_date']),
            'questions' => array()
        );
        
        // Process questions
        if (isset($_POST['questions']) && is_array($_POST['questions'])) {
            foreach ($_POST['questions'] as $question_data) {
                $question = array(
                    'question_text' => sanitize_text_field($question_data['question_text']),
                    'options' => array()
                );
                
                // Process options
                if (isset($question_data['options']) && is_array($question_data['options'])) {
                    foreach ($question_data['options'] as $option_text) {
                        $question['options'][] = array('option_text' => sanitize_text_field($option_text));
                    }
                }
                
                $survey_data['questions'][] = $question;
            }
        }
        
        // Send to API
        $api_url = 'https://api.bonaventurecclub.com/polls/surveys';
        $response = wp_remote_post($api_url, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($survey_data),
            'timeout' => 30
        ));
        
        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 201) {
            $result = json_decode(wp_remote_retrieve_body($response), true);
            wp_send_json_success(array('message' => 'Carta Consulta creada exitosamente.', 'survey' => $result));
        } else {
            $error_message = 'Error al crear la Carta Consulta.';
            if (is_wp_error($response)) {
                $error_message = $response->get_error_message();
            } else {
                $response_body = json_decode(wp_remote_retrieve_body($response), true);
                if (isset($response_body['error'])) {
                    $error_message = $response_body['error'];
                }
            }
            wp_send_json_error(array('message' => $error_message));
        }
    }
    
    /**
     * Close a survey via AJAX
     */
    public function close_survey() {
        // Verify nonce and permissions
        if (!wp_verify_nonce($_POST['nonce'], 'condo360_admin_nonce') || !current_user_can('manage_options')) {
            wp_die('Security check failed');
        }
        
        // Get survey ID
        $survey_id = intval($_POST['survey_id']);
        
        // Send to API
        $api_url = 'https://api.bonaventurecclub.com/polls/surveys/' . $survey_id . '/close';
        $response = wp_remote_post($api_url, array(
            'headers' => array('Content-Type' => 'application/json'),
            'timeout' => 30
        ));
        
        if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
            wp_send_json_success(array('message' => 'Carta Consulta cerrada exitosamente.'));
        } else {
            wp_send_json_error(array('message' => 'Error al cerrar la Carta Consulta.'));
        }
    }
    
    /**
     * Get survey results via AJAX
     */
    public function get_survey_results() {
        // Verify nonce and permissions
        if (!wp_verify_nonce($_POST['nonce'], 'condo360_admin_nonce') || !current_user_can('manage_options')) {
            wp_die('Security check failed');
        }
        
        // Get survey ID
        $survey_id = intval($_POST['survey_id']);
        
        // Get survey details from API
        $survey_api_url = 'https://api.bonaventurecclub.com/polls/surveys/' . $survey_id;
        $survey_response = wp_remote_get($survey_api_url, array('timeout' => 30));
        
        if (!is_wp_error($survey_response) && wp_remote_retrieve_response_code($survey_response) === 200) {
            $survey = json_decode(wp_remote_retrieve_body($survey_response), true);
            
            // Get results from API
            $results_api_url = 'https://api.bonaventurecclub.com/polls/surveys/' . $survey_id . '/results';
            $results_response = wp_remote_get($results_api_url, array('timeout' => 30));
            
            if (!is_wp_error($results_response) && wp_remote_retrieve_response_code($results_response) === 200) {
                $results = json_decode(wp_remote_retrieve_body($results_response), true);
                wp_send_json_success(array('results' => array('survey' => $survey, 'results' => $results)));
            } else {
                wp_send_json_error(array('message' => 'Error al obtener los resultados de la Carta Consulta.'));
            }
        } else {
            wp_send_json_error(array('message' => 'Error al obtener los detalles de la Carta Consulta.'));
        }
    }
}