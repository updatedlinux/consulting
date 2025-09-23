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
            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" id="create-poll-form">
                <input type="hidden" name="action" value="condo360_create_poll">
                <?php wp_nonce_field('condo360_create_poll', 'condo360_create_poll_nonce'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="title">Título</label></th>
                        <td><input type="text" id="title" name="title" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="description">Descripción</label></th>
                        <td><textarea id="description" name="description" rows="3" cols="50"></textarea></td>
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
                
                <h3>Preguntas</h3>
                <div id="questions-container">
                    <div class="question-block">
                        <table class="form-table">
                            <tr>
                                <th scope="row"><label>Pregunta 1</label></th>
                                <td><input type="text" name="questions[0][text]" class="regular-text" placeholder="Texto de la pregunta" required></td>
                            </tr>
                            <tr>
                                <th scope="row"><label>Opciones</label></th>
                                <td>
                                    <textarea name="questions[0][options]" rows="4" cols="50" placeholder="Una opción por línea" required></textarea>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <p>
                    <button type="button" id="add-question" class="button">Agregar Pregunta</button>
                </p>
                
                <?php submit_button('Crear Encuesta'); ?>
            </form>
            
            <h2>Encuestas Existentes</h2>
            <?php if (!empty($polls)): ?>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Descripción</th>
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
                                <td><?php echo esc_html($poll['title']); ?></td>
                                <td><?php echo esc_html($poll['description'] ?? ''); ?></td>
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
        
        <script>
        jQuery(document).ready(function($) {
            let questionCount = 1;
            
            $('#add-question').click(function() {
                const newQuestion = `
                    <div class="question-block">
                        <hr>
                        <table class="form-table">
                            <tr>
                                <th scope="row"><label>Pregunta ${questionCount + 1}</label></th>
                                <td><input type="text" name="questions[${questionCount}][text]" class="regular-text" placeholder="Texto de la pregunta" required></td>
                            </tr>
                            <tr>
                                <th scope="row"><label>Opciones</label></th>
                                <td>
                                    <textarea name="questions[${questionCount}][options]" rows="4" cols="50" placeholder="Una opción por línea" required></textarea>
                                </td>
                            </tr>
                        </table>
                        <p><button type="button" class="button remove-question">Eliminar Pregunta</button></p>
                    </div>
                `;
                
                $('#questions-container').append(newQuestion);
                questionCount++;
            });
            
            $(document).on('click', '.remove-question', function() {
                if ($('.question-block').length > 1) {
                    $(this).closest('.question-block').remove();
                    questionCount--;
                }
            });
        });
        </script>
        <?php
    }
    
    public function handle_create_poll() {
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        // Verify nonce
        if (!isset($_POST['condo360_create_poll_nonce']) || !wp_verify_nonce($_POST['condo360_create_poll_nonce'], 'condo360_create_poll')) {
            wp_die('Security check failed');
        }
        
        // Get form data
        $title = sanitize_text_field($_POST['title']);
        $description = sanitize_textarea_field($_POST['description']);
        $start_date = !empty($_POST['start_date']) ? sanitize_text_field($_POST['start_date']) : null;
        $end_date = !empty($_POST['end_date']) ? sanitize_text_field($_POST['end_date']) : null;
        $questions = isset($_POST['questions']) ? $_POST['questions'] : array();
        
        // Validate data
        if (empty($title) || empty($questions)) {
            wp_redirect(add_query_arg('message', 'error', admin_url('admin.php?page=condo360-polls')));
            exit;
        }
        
        // Process questions
        $processed_questions = array();
        foreach ($questions as $question) {
            if (!empty($question['text']) && !empty($question['options'])) {
                $options = explode("\n", $question['options']);
                $options = array_map('trim', $options);
                $options = array_filter($options, function($option) {
                    return !empty($option);
                });
                
                if (!empty($options)) {
                    $processed_questions[] = array(
                        'text' => sanitize_text_field($question['text']),
                        'options' => array_values($options)
                    );
                }
            }
        }
        
        if (empty($processed_questions)) {
            wp_redirect(add_query_arg('message', 'error', admin_url('admin.php?page=condo360-polls')));
            exit;
        }
        
        // Send data to API
        $current_user_id = get_current_user_id();
        $response = wp_remote_post($this->api_url . '/api/polls', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WordPress-User-ID' => $current_user_id
            ),
            'body' => json_encode(array(
                'title' => $title,
                'description' => $description,
                'questions' => $processed_questions,
                'startDate' => $start_date,
                'endDate' => $end_date
            ))
        ));
        
        if (is_wp_error($response)) {
            wp_redirect(add_query_arg('message', 'error', admin_url('admin.php?page=condo360-polls')));
        } else {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 201) {
                wp_redirect(add_query_arg('message', 'created', admin_url('admin.php?page=condo360-polls')));
            } else {
                wp_redirect(add_query_arg('message', 'error', admin_url('admin.php?page=condo360-polls')));
            }
        }
        
        exit;
    }
    
    public function handle_close_poll() {
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        // Verify nonce
        if (!isset($_POST['condo360_close_poll_nonce']) || !wp_verify_nonce($_POST['condo360_close_poll_nonce'], 'condo360_close_poll')) {
            wp_die('Security check failed');
        }
        
        // Get poll ID
        $poll_id = isset($_POST['poll_id']) ? intval($_POST['poll_id']) : 0;
        
        if ($poll_id <= 0) {
            wp_redirect(add_query_arg('message', 'error', admin_url('admin.php?page=condo360-polls')));
            exit;
        }
        
        // Send request to API
        $current_user_id = get_current_user_id();
        $response = wp_remote_post($this->api_url . '/api/polls/' . $poll_id . '/close', array(
            'headers' => array(
                'X-WordPress-User-ID' => $current_user_id
            ),
            'method' => 'POST'
        ));
        
        if (is_wp_error($response)) {
            wp_redirect(add_query_arg('message', 'error', admin_url('admin.php?page=condo360-polls')));
        } else {
            $response_code = wp_remote_retrieve_response_code($response);
            if ($response_code === 200) {
                wp_redirect(add_query_arg('message', 'closed', admin_url('admin.php?page=condo360-polls')));
            } else {
                wp_redirect(add_query_arg('message', 'error', admin_url('admin.php?page=condo360-polls')));
            }
        }
        
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
            <div id="condo360-poll-list">
                <p>Cargando encuestas...</p>
            </div>
            <div id="condo360-poll-details"></div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function render_poll_results($atts) {
        // Enqueue scripts if not already enqueued
        if (!wp_script_is('condo360-polls-js', 'enqueued')) {
            $this->enqueue_scripts();
        }
        
        $atts = shortcode_atts(array(
            'id' => 0
        ), $atts);
        
        $poll_id = intval($atts['id']);
        
        if ($poll_id <= 0) {
            return '<p>ID de encuesta no válido.</p>';
        }
        
        ob_start();
        ?>
        <div id="condo360-polls-container">
            <div id="condo360-poll-details">
                <p>Cargando resultados de la encuesta...</p>
            </div>
        </div>
        <script>
        jQuery(document).ready(function($) {
            // Load poll results directly
            const condo360 = {
                apiBaseUrl: '<?php echo esc_js($this->api_url); ?>/api',
                
                loadPollResults: function(pollId) {
                    $('#condo360-poll-details').html('<p>Cargando resultados de la encuesta...</p>');
                    
                    $.get(`${this.apiBaseUrl}/polls/${pollId}/results`)
                        .done((data) => {
                            this.renderPollResults(data);
                        })
                        .fail((xhr) => {
                            $('#condo360-poll-details').html('<p>Error al cargar los resultados de la encuesta. Por favor, inténtalo de nuevo más tarde.</p>');
                        });
                },
                
                renderPollResults: function(results) {
                    const $container = $('#condo360-poll-details');
                    $container.empty();
                    
                    // Título de los resultados
                    const header = `<h2>Resultados: ${results.poll.title}</h2>`;
                    
                    // Mostrar resultados por pregunta
                    let resultsHtml = '';
                    Object.entries(results.results).forEach(([questionId, questionData]) => {
                        let optionsHtml = '';
                        Object.entries(questionData.options).forEach(([option, count]) => {
                            const percentage = questionData.total > 0 ? (count / questionData.total * 100).toFixed(1) : 0;
                            optionsHtml += `
                                <div class="condo360-result-option">
                                    <span class="condo360-option-text">${option}</span>
                                    <div class="condo360-progress-bar">
                                        <div class="condo360-progress" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="condo360-vote-count">${count} votos (${percentage}%)</span>
                                </div>
                            `;
                        });
                        
                        resultsHtml += `
                            <div class="condo360-result-question">
                                <h3>${questionData.question}</h3>
                                <div class="condo360-result-options">
                                    ${optionsHtml}
                                </div>
                                <p class="condo360-total-votes">Total de votos: ${questionData.total}</p>
                            </div>
                        `;
                    });
                    
                    $container.html(header + resultsHtml);
                }
            };
            
            // Load results for specified poll
            condo360.loadPollResults(<?php echo intval($poll_id); ?>);
        });
        </script>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
new Condo360_Polls();