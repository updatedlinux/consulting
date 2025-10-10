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
        
        // Add shortcode
        add_action('wp_ajax_condo360_admin_get_surveys', array($this, 'get_surveys'));
        add_action('wp_ajax_condo360_admin_create_survey', array($this, 'create_survey'));
        add_action('wp_ajax_condo360_admin_close_survey', array($this, 'close_survey'));
        add_action('wp_ajax_condo360_admin_get_survey_results', array($this, 'get_survey_results'));
        add_action('wp_ajax_condo360_admin_get_survey_voters', array($this, 'get_survey_voters'));
        add_action('wp_ajax_condo360_admin_load_template', array($this, 'load_template'));
        add_shortcode('condo360_admin_surveys', array($this, 'render_admin_shortcode'));
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
        try {
            // Debug logging
            error_log('Condo360 Admin: load_template called with POST data: ' . print_r($_POST, true));
            
            // Verify nonce and permissions
            if (!wp_verify_nonce($_POST['nonce'], 'condo360_admin_nonce') || !current_user_can('manage_options')) {
                error_log('Condo360 Admin: Security check failed in load_template');
                wp_die('Security check failed');
            }
            
            $template = sanitize_text_field($_POST['template']);
            $template_path = plugin_dir_path(__FILE__) . '../templates/' . $template . '.php';
            
            error_log('Condo360 Admin: Loading template: ' . $template . ' from path: ' . $template_path);
            
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
                if (isset($_POST['votersData'])) {
                    $votersData = $_POST['votersData'];
                    error_log('Condo360 Admin: votersData received in load_template: ' . print_r($votersData, true));
                    
                    // Only validate votersData structure for admin-voters-detail template
                    if ($template === 'admin-voters-detail') {
                        if (!is_array($votersData)) {
                            error_log('Condo360 Admin: votersData is not an array');
                            wp_send_json_error(array('message' => 'Datos de votantes no válidos'));
                            return;
                        }
                        
                        if (!isset($votersData['survey'])) {
                            error_log('Condo360 Admin: survey key missing from votersData');
                            wp_send_json_error(array('message' => 'Datos de encuesta faltantes'));
                            return;
                        }
                    }
                }
                
                ob_start();
                include $template_path;
                $html = ob_get_clean();
                
                if (empty($html)) {
                    error_log('Condo360 Admin: Template produced empty HTML');
                    wp_send_json_error(array('message' => 'El template no generó contenido'));
                    return;
                }
                
                wp_send_json_success(array('html' => $html));
            } else {
                wp_send_json_error(array('message' => 'Template not found: ' . $template));
            }
        } catch (Exception $e) {
            error_log('Condo360 Admin Template Error: ' . $e->getMessage());
            wp_send_json_error(array('message' => 'Error interno del servidor: ' . $e->getMessage()));
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
        $api_url = 'https://api.bonaventurecclub.com/polls/surveys/all';
        $response = wp_remote_get($api_url, array('timeout' => 30));
        
        if (!is_wp_error($response)) {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 200) {
                $surveys = json_decode(wp_remote_retrieve_body($response), true);
                wp_send_json_success(array('surveys' => $surveys));
            } else {
                wp_send_json_error(array('message' => 'Error al obtener las Cartas Consulta. Código: ' . $response_code));
            }
        } else {
            wp_send_json_error(array('message' => 'Error de conexión: ' . $response->get_error_message()));
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
        
        if (!is_wp_error($response)) {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 201) {
                $result = json_decode(wp_remote_retrieve_body($response), true);
                wp_send_json_success(array('message' => 'Carta Consulta creada exitosamente.', 'survey' => $result));
            } else {
                $error_message = 'Error al crear la Carta Consulta. Código: ' . $response_code;
                $response_body = json_decode(wp_remote_retrieve_body($response), true);
                if (isset($response_body['error'])) {
                    $error_message = $response_body['error'];
                }
                wp_send_json_error(array('message' => $error_message));
            }
        } else {
            wp_send_json_error(array('message' => 'Error de conexión: ' . $response->get_error_message()));
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
        
        if (!is_wp_error($response)) {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 200) {
                wp_send_json_success(array('message' => 'Carta Consulta cerrada exitosamente.'));
            } else {
                wp_send_json_error(array('message' => 'Error al cerrar la Carta Consulta. Código: ' . $response_code));
            }
        } else {
            wp_send_json_error(array('message' => 'Error de conexión: ' . $response->get_error_message()));
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
        
        // Get results from API
        $api_url = 'https://api.bonaventurecclub.com/polls/surveys/' . $survey_id . '/results?admin=true';
        $response = wp_remote_get($api_url, array('timeout' => 30));
        
        if (!is_wp_error($response)) {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 200) {
                $results_data = json_decode(wp_remote_retrieve_body($response), true);
                
                // Calculate percentages
                if (isset($results_data['questions'])) {
                    $total_votes = 0;
                    
                    // Calculate total votes from first question (assuming all questions have same number of responses)
                    if (!empty($results_data['questions'][0]['options'])) {
                        foreach ($results_data['questions'][0]['options'] as $option) {
                            $total_votes += $option['response_count'];
                        }
                    }
                    
                    // Add percentage to each option
                    foreach ($results_data['questions'] as &$question) {
                        foreach ($question['options'] as &$option) {
                            $option['percentage'] = $total_votes > 0 ? ($option['response_count'] / $total_votes) * 100 : 0;
                        }
                    }
                    
                    $results_data['total_votes'] = $total_votes;
                }
                
                wp_send_json_success(array('results' => $results_data));
            } else {
                $error_body = wp_remote_retrieve_body($response);
                wp_send_json_error(array('message' => 'Error al obtener los resultados de la Carta Consulta. Código: ' . $response_code . ' - ' . $error_body));
            }
        } else {
            wp_send_json_error(array('message' => 'Error de conexión: ' . $response->get_error_message()));
        }
    }
    
    /**
     * Get survey voters via AJAX
     */
    public function get_survey_voters() {
        try {
            // Debug logging
            error_log('Condo360 Admin: get_survey_voters called with POST data: ' . print_r($_POST, true));
            
            // Verify nonce and permissions
            if (!wp_verify_nonce($_POST['nonce'], 'condo360_admin_nonce') || !current_user_can('manage_options')) {
                error_log('Condo360 Admin: Security check failed');
                wp_die('Security check failed');
            }
            
            // Get survey ID and pagination parameters
            $survey_id = intval($_POST['survey_id']);
            $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
            $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 10;
            
            error_log('Condo360 Admin: Parsed parameters - survey_id: ' . $survey_id . ', page: ' . $page . ', limit: ' . $limit);
            
            if (!$survey_id) {
                wp_send_json_error(array('message' => 'ID de encuesta inválido'));
                return;
            }
            
            // Get voters from API with pagination
            $api_url = 'https://api.bonaventurecclub.com/polls/surveys/' . $survey_id . '/voters?page=' . $page . '&limit=' . $limit;
            $response = wp_remote_get($api_url, array('timeout' => 30));
            
            if (!is_wp_error($response)) {
                $response_code = wp_remote_retrieve_response_code($response);
                if ($response_code === 200) {
                    $response_body = wp_remote_retrieve_body($response);
                    error_log('Condo360 Admin: API response body: ' . $response_body);
                    
                    $voters_data = json_decode($response_body, true);
                    
                    if (!$voters_data) {
                        error_log('Condo360 Admin: Failed to decode JSON response');
                        wp_send_json_error(array('message' => 'Error al decodificar los datos de votantes'));
                        return;
                    }
                    
                    error_log('Condo360 Admin: Decoded voters data: ' . print_r($voters_data, true));
                    
                    // Send voters data directly
                    wp_send_json_success(array('votersData' => $voters_data));
                } else {
                    $error_body = wp_remote_retrieve_body($response);
                    wp_send_json_error(array('message' => 'Error al obtener los votantes de la Carta Consulta. Código: ' . $response_code . ' - ' . $error_body));
                }
            } else {
                wp_send_json_error(array('message' => 'Error de conexión: ' . $response->get_error_message()));
            }
        } catch (Exception $e) {
            error_log('Condo360 Admin Voters Error: ' . $e->getMessage());
            wp_send_json_error(array('message' => 'Error interno del servidor: ' . $e->getMessage()));
        }
    }
}