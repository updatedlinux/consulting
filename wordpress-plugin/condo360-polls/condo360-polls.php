<?php
/**
 * Plugin Name: Condo360 Polls
 * Plugin URI: https://example.com/condo360-polls
 * Description: A polling system for Condo360 that integrates with a Node.js microservice
 * Version: 1.0.0
 * Author: Condo360
 * License: MIT
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class Condo360_Polls {
    
    private $api_url;
    
    public function __construct() {
        $this->api_url = 'https://api.bonaventurecclub.com'; // Production API URL
        add_shortcode('condo360_polls', array($this, 'render_polls'));
        add_shortcode('condo360_poll_results', array($this, 'render_poll_results'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_post_condo360_create_poll', array($this, 'handle_create_poll'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Condo360 Polls',
            'Cartas Consulta',
            'manage_options',
            'condo360-polls',
            array($this, 'admin_page'),
            'dashicons-chart-bar',
            30
        );
    }
    
    public function admin_page() {
        // Check if user is admin
        if (!current_user_can('administrator')) {
            wp_die('No tienes permisos para acceder a esta página.');
        }
        
        // Get current user ID
        $current_user_id = get_current_user_id();
        
        echo '<div class="wrap">';
        echo '<h1>Condo360 Polls</h1>';
        
        // Handle form submission
        if (isset($_GET['message']) && $_GET['message'] === 'success') {
            echo '<div class="notice notice-success"><p>Encuesta creada exitosamente.</p></div>';
        } elseif (isset($_GET['message']) && $_GET['message'] === 'error') {
            echo '<div class="notice notice-error"><p>Error al crear la encuesta: ' . esc_html($_GET['error']) . '</p></div>';
        }
        
        echo '<h2>Crear Nueva Encuesta</h2>';
        echo '<form method="post" action="' . admin_url('admin-post.php') . '">';
        echo '<input type="hidden" name="action" value="condo360_create_poll">';
        echo '<input type="hidden" name="user_id" value="' . $current_user_id . '">';
        echo '<table class="form-table">';
        echo '<tr>';
        echo '<th scope="row"><label for="question">Pregunta</label></th>';
        echo '<td><input name="question" type="text" id="question" class="regular-text" required></td>';
        echo '</tr>';
        echo '<tr>';
        echo '<th scope="row"><label for="options">Opciones (una por línea)</label></th>';
        echo '<td><textarea name="options" id="options" rows="5" cols="50" required></textarea></td>';
        echo '</tr>';
        echo '<tr>';
        echo '<th scope="row"><label for="start_date">Fecha de Inicio (opcional)</label></th>';
        echo '<td><input name="start_date" type="datetime-local" id="start_date"></td>';
        echo '</tr>';
        echo '<tr>';
        echo '<th scope="row"><label for="end_date">Fecha de Fin (opcional)</label></th>';
        echo '<td><input name="end_date" type="datetime-local" id="end_date"></td>';
        echo '</tr>';
        echo '</table>';
        echo '<p class="submit"><input type="submit" name="submit" id="submit" class="button button-primary" value="Crear Encuesta"></p>';
        echo '</form>';
        echo '</div>';
    }
    
    public function handle_create_poll() {
        // Check if user is admin
        if (!current_user_can('administrator')) {
            wp_die('No tienes permisos para crear encuestas.');
        }
        
        // Verify nonce
        // Note: In a production environment, you should add nonce verification
        
        // Get form data
        $user_id = intval($_POST['user_id']);
        $question = sanitize_text_field($_POST['question']);
        $options_text = sanitize_textarea_field($_POST['options']);
        $start_date = sanitize_text_field($_POST['start_date']);
        $end_date = sanitize_text_field($_POST['end_date']);
        
        // Parse options
        $options = array_filter(array_map('trim', explode("\n", $options_text)));
        
        if (empty($question) || empty($options)) {
            wp_redirect(add_query_arg(array(
                'page' => 'condo360-polls',
                'message' => 'error',
                'error' => 'Pregunta y opciones son requeridas'
            ), admin_url('admin.php')));
            exit;
        }
        
        // Prepare data for API call
        $data = array(
            'question' => $question,
            'options' => array_values($options)
        );
        
        // Add dates if provided
        if (!empty($start_date)) {
            $data['start_date'] = $start_date;
        }
        if (!empty($end_date)) {
            $data['end_date'] = $end_date;
        }
        
        // Call Node.js API to create poll
        $api_url = $this->api_url . '/api/polls';
        
        $response = wp_remote_post($api_url, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WordPress-User-ID' => $user_id
            ),
            'body' => json_encode($data)
        ));
        
        if (is_wp_error($response)) {
            wp_redirect(add_query_arg(array(
                'page' => 'condo360-polls',
                'message' => 'error',
                'error' => $response->get_error_message()
            ), admin_url('admin.php')));
            exit;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code === 201) {
            wp_redirect(add_query_arg(array(
                'page' => 'condo360-polls',
                'message' => 'success'
            ), admin_url('admin.php')));
            exit;
        } else {
            $error_data = json_decode($response_body, true);
            $error_message = isset($error_data['error']) ? $error_data['error'] : 'Error desconocido';
            
            wp_redirect(add_query_arg(array(
                'page' => 'condo360-polls',
                'message' => 'error',
                'error' => $error_message
            ), admin_url('admin.php')));
            exit;
        }
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('condo360-polls', plugin_dir_url(__FILE__) . 'assets/polls.js', array('jquery'), '1.0.0', true);
        wp_localize_script('condo360-polls', 'condo360_polls_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'api_url' => $this->api_url,
            'nonce' => wp_create_nonce('condo360_polls_nonce')
        ));
        wp_enqueue_style('condo360-polls', plugin_dir_url(__FILE__) . 'assets/polls.css', array(), '1.0.0');
    }
    
    public function render_polls($atts) {
        // Get current user ID
        $current_user_id = get_current_user_id();
        
        if (!$current_user_id) {
            return '<p>Debes iniciar sesión para ver las encuestas.</p>';
        }
        
        // Pass user ID to JavaScript
        wp_add_inline_script('condo360-polls', 'var condo360_current_user_id = ' . $current_user_id . ';', 'before');
        
        ob_start();
        ?>
        <div id="condo360-polls-container">
            <div class="polls-loading">Cargando encuestas...</div>
            <div class="polls-content" style="display: none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function render_poll_results($atts) {
        $atts = shortcode_atts(array(
            'id' => 0
        ), $atts);
        
        $poll_id = intval($atts['id']);
        
        if (!$poll_id) {
            return '<p>ID de encuesta no válido.</p>';
        }
        
        ob_start();
        ?>
        <div id="condo360-poll-results-<?php echo $poll_id; ?>" class="condo360-poll-results" data-poll-id="<?php echo $poll_id; ?>">
            <div class="results-loading">Cargando resultados...</div>
            <div class="results-content" style="display: none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
new Condo360_Polls();