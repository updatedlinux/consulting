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