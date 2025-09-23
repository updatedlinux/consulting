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
        add_action('admin_post_condo360_close_poll', array($this, 'handle_close_poll'));
    }
    
    public function enqueue_scripts() {
        wp_enqueue_style('condo360-polls-css', plugin_dir_url(__FILE__) . 'assets/polls.css');
        wp_enqueue_script('condo360-polls-js', plugin_dir_url(__FILE__) . 'assets/polls.js', array('jquery'), '1.0.0', true);
        
        // Pass data to JavaScript
        wp_localize_script('condo360-polls-js', 'condo360_polls_ajax', array(
            'api_url' => $this->api_url,
            'current_user_id' => get_current_user_id(),
            'ajax_url' => admin_url('admin-ajax.php')
        ));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Condo360 Polls',
            'Encuestas',
            'manage_options',
            'condo360-polls',
            array($this, 'admin_page'),
            'dashicons-chart-bar',
            30
        );
    }
    
    public function admin_page() {
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        // Handle messages
        $message = '';
        if (isset($_GET['message'])) {
            switch ($_GET['message']) {
                case 'created':
                    $message = '<div class="notice notice-success"><p>Encuesta creada exitosamente.</p></div>';
                    break;
                case 'closed':
                    $message = '<div class="notice notice-success"><p>Encuesta cerrada exitosamente.</p></div>';
                    break;
                case 'error':
                    $message = '<div class="notice notice-error"><p>Error al procesar la solicitud.</p></div>';
                    break;
            }
        }
        
        // Get existing polls from API
        $current_user_id = get_current_user_id();
        $response = wp_remote_get($this->api_url . '/api/polls/all', array(
            'headers' => array(
                'X-WordPress-User-ID' => $current_user_id
            )
        ));
        
        $polls = array();
        if (is_wp_error($response)) {
            $message .= '<div class="notice notice-error"><p>Error de conexión: ' . $response->get_error_message() . '</p></div>';
        } else {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 200) {
                $polls = json_decode(wp_remote_retrieve_body($response), true);
                if (!is_array($polls)) {
                    $polls = array();
                    $message .= '<div class="notice notice-error"><p>Error al procesar los datos de las encuestas.</p></div>';
                }
            } else {
                $error_body = wp_remote_retrieve_body($response);
                $message .= '<div class="notice notice-error"><p>Error al obtener encuestas: ' . $response_code . ' - ' . $error_body . '</p></div>';
            }
        }
        
        ?>
        <div class="wrap">
            <h1>Condo360 Polls</h1>
            
            <?php echo $message; ?>
            
            <h2>Crear Nueva Encuesta</h2>
            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
                <input type="hidden" name="action" value="condo360_create_poll">
                <?php wp_nonce_field('condo360_create_poll', 'condo360_create_poll_nonce'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="question">Pregunta</label></th>
                        <td><input type="text" id="question" name="question" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="options">Opciones (una por línea)</label></th>
                        <td><textarea id="options" name="options" rows="5" cols="50" required></textarea></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="start_date">Fecha de Inicio (opcional)</label></th>
                        <td><input type="datetime-local" id="start_date" name="start_date"></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="end_date">Fecha de Fin (opcional)</label></th>
                        <td><input type="datetime-local" id="end_date" name="end_date"></td>
                    </tr>
                </table>
                
                <?php submit_button('Crear Encuesta'); ?>
            </form>
            
            <h2>Encuestas Existentes</h2>
            <?php if (!empty($polls)): ?>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pregunta</th>
                            <th>Estado</th>
                            <th>Fecha de Inicio</th>
                            <th>Fecha de Fin</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($polls as $poll): ?>
                            <tr>
                                <td><?php echo esc_html($poll['id']); ?></td>
                                <td><?php echo esc_html($poll['question']); ?></td>
                                <td><?php echo esc_html($poll['status']); ?></td>
                                <td><?php echo esc_html($poll['start_date'] ? date('Y-m-d H:i', strtotime($poll['start_date'])) : 'N/A'); ?></td>
                                <td><?php echo esc_html($poll['end_date'] ? date('Y-m-d H:i', strtotime($poll['end_date'])) : 'N/A'); ?></td>
                                <td>
                                    <?php if ($poll['status'] === 'open'): ?>
                                        <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" style="display: inline;">
                                            <input type="hidden" name="action" value="condo360_close_poll">
                                            <input type="hidden" name="poll_id" value="<?php echo esc_attr($poll['id']); ?>">
                                            <?php wp_nonce_field('condo360_close_poll', 'condo360_close_poll_nonce'); ?>
                                            <input type="submit" class="button" value="Cerrar" onclick="return confirm('¿Estás seguro de que quieres cerrar esta encuesta?')">
                                        </form>
                                    <?php else: ?>
                                        Cerrada
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p>No hay encuestas disponibles.</p>
            <?php endif; ?>
        </div>
        <?php
    }
    
    public function handle_create_poll() {
        // Check nonce
        if (!wp_verify_nonce($_POST['condo360_create_poll_nonce'], 'condo360_create_poll')) {
            wp_die('Nonce verification failed');
        }
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        // Get form data
        $question = sanitize_text_field($_POST['question']);
        $options = sanitize_textarea_field($_POST['options']);
        $start_date = sanitize_text_field($_POST['start_date']);
        $end_date = sanitize_text_field($_POST['end_date']);
        
        // Convert options to array
        $options_array = array_filter(array_map('trim', explode("\n", $options)));
        
        // Validate data
        if (empty($question) || empty($options_array)) {
            wp_redirect(add_query_arg(array('page' => 'condo360-polls', 'message' => 'error'), admin_url('admin.php')));
            exit;
        }
        
        // Prepare data for API
        $data = array(
            'question' => $question,
            'options' => $options_array
        );
        
        // Add dates if provided
        if (!empty($start_date)) {
            $data['start_date'] = $start_date;
        }
        if (!empty($end_date)) {
            $data['end_date'] = $end_date;
        }
        
        // Get current user ID
        $current_user_id = get_current_user_id();
        
        // Send request to API
        $response = wp_remote_post($this->api_url . '/api/polls', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WordPress-User-ID' => $current_user_id
            ),
            'body' => json_encode($data)
        ));
        
        // Check response
        if (is_wp_error($response)) {
            wp_redirect(add_query_arg(array('page' => 'condo360-polls', 'message' => 'error'), admin_url('admin.php')));
            exit;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($response_code !== 201) {
            wp_redirect(add_query_arg(array('page' => 'condo360-polls', 'message' => 'error'), admin_url('admin.php')));
            exit;
        }
        
        // Redirect back to admin page with success message
        wp_redirect(add_query_arg(array('page' => 'condo360-polls', 'message' => 'created'), admin_url('admin.php')));
        exit;
    }
    
    public function handle_close_poll() {
        // Check nonce
        if (!wp_verify_nonce($_POST['condo360_close_poll_nonce'], 'condo360_close_poll')) {
            wp_die('Nonce verification failed');
        }
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        // Get poll ID
        $poll_id = intval($_POST['poll_id']);
        
        if (empty($poll_id)) {
            wp_die('Poll ID is required');
        }
        
        // Get current user ID
        $current_user_id = get_current_user_id();
        
        // Send request to API to close poll
        $response = wp_remote_post($this->api_url . '/api/polls/' . $poll_id . '/close', array(
            'headers' => array(
                'X-WordPress-User-ID' => $current_user_id
            )
        ));
        
        // Check response
        if (is_wp_error($response)) {
            wp_redirect(add_query_arg(array('page' => 'condo360-polls', 'message' => 'error'), admin_url('admin.php')));
            exit;
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($response_code !== 200) {
            wp_redirect(add_query_arg(array('page' => 'condo360-polls', 'message' => 'error'), admin_url('admin.php')));
            exit;
        }
        
        // Redirect back to admin page with success message
        wp_redirect(add_query_arg(array('page' => 'condo360-polls', 'message' => 'closed'), admin_url('admin.php')));
        exit;
    }
    
    public function render_polls() {
        // Enqueue scripts if not already enqueued
        if (!wp_script_is('condo360-polls-js', 'enqueued')) {
            $this->enqueue_scripts();
        }
        
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
        
        if (empty($poll_id)) {
            return '<p>ID de encuesta no especificado.</p>';
        }
        
        // Enqueue scripts if not already enqueued
        if (!wp_script_is('condo360-polls-js', 'enqueued')) {
            $this->enqueue_scripts();
        }
        
        ob_start();
        ?>
        <div class="condo360-poll-results" data-poll-id="<?php echo esc_attr($poll_id); ?>">
            <div class="poll-results-loading">Cargando resultados...</div>
            <div class="poll-results-content" style="display: none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
new Condo360_Polls();