<?php
/**
 * Main plugin file
 */
 
// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

class Condo360_Surveys {
    
    /**
     * The unique identifier of this plugin.
     */
    protected $plugin_name;
    
    /**
     * The current version of the plugin.
     */
    protected $version;
    
    /**
     * Define the core functionality of the plugin.
     */
    public function __construct() {
        $this->plugin_name = 'condo360-surveys';
        $this->version = '1.0.0';
        
        add_action('init', array($this, 'load_textdomain'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('wp_ajax_condo360_submit_survey', array($this, 'handle_survey_submission'));
        add_action('wp_ajax_nopriv_condo360_submit_survey', array($this, 'handle_survey_submission'));
        add_shortcode('condo360_surveys', array($this, 'render_surveys_shortcode'));
    }
    
    /**
     * Load the plugin text domain for translation.
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'condo360-surveys',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages/'
        );
    }
    
    /**
     * Register the stylesheets for the frontend.
     */
    public function enqueue_frontend_scripts() {
        wp_enqueue_style(
            $this->plugin_name,
            plugin_dir_url(__FILE__) . 'assets/css/surveys.css',
            array(),
            $this->version,
            'all'
        );
        
        wp_enqueue_script(
            $this->plugin_name,
            plugin_dir_url(__FILE__) . 'assets/js/surveys.js',
            array('jquery'),
            $this->version,
            true
        );
        
        wp_localize_script(
            $this->plugin_name,
            'condo360_surveys_ajax',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('condo360_surveys_nonce')
            )
        );
    }
    
    /**
     * Handle survey submission via AJAX
     */
    public function handle_survey_submission() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'condo360_surveys_nonce')) {
            wp_die('Security check failed');
        }
        
        // Get current user ID
        $user_id = get_current_user_id();
        if (!$user_id) {
            wp_send_json_error(array('message' => __('Debes iniciar sesión para votar.', 'condo360-surveys')));
        }
        
        // Get survey data
        $survey_id = intval($_POST['survey_id']);
        $responses = $_POST['responses'];
        
        // Prepare data for API call
        $api_url = 'https://api.bonaventurecclub.com/polls/surveys/' . $survey_id . '/vote';
        $data = array(
            'wp_user_id' => $user_id,
            'responses' => $responses
        );
        
        // Make API call
        $response = wp_remote_post($api_url, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($data),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => __('Error de conexión con el servidor.', 'condo360-surveys')));
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($response_code === 200) {
            wp_send_json_success(array('message' => __('Voto registrado exitosamente', 'condo360-surveys')));
        } else {
            $error_message = isset($response_body['error']) ? $response_body['error'] : __('Error al enviar la Carta Consulta.', 'condo360-surveys');
            wp_send_json_error(array('message' => $error_message));
        }
    }
    
    /**
     * Render the surveys shortcode
     */
    public function render_surveys_shortcode($atts) {
        // Enqueue scripts
        wp_enqueue_style($this->plugin_name);
        wp_enqueue_script($this->plugin_name);
        
        // Get active surveys from API
        $api_url = 'https://api.bonaventurecclub.com/polls/surveys';
        $response = wp_remote_get($api_url, array('timeout' => 30));
        
        $surveys = array();
        if (!is_wp_error($response)) {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 200) {
                $surveys = json_decode(wp_remote_retrieve_body($response), true);
            }
        }
        
        // Load template
        ob_start();
        include plugin_dir_path(__FILE__) . 'templates/frontend-surveys.php';
        return ob_get_clean();
    }
}