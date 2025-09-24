<?php
/**
 * Frontend surveys template
 */
?>

<div class="condo360-surveys-container">
    <div class="condo360-surveys-list" id="surveys-list">
        <?php if (empty($surveys)): ?>
            <div class="condo360-survey-message info">
                <?php _e('No hay encuestas activas en este momento.', 'condo360-surveys'); ?>
            </div>
        <?php else: ?>
            <h3><?php _e('Encuestas Disponibles', 'condo360-surveys'); ?></h3>
            <?php foreach ($surveys as $survey): ?>
                <div class="condo360-survey-card" data-survey-id="<?php echo esc_attr($survey['id']); ?>">
                    <h4><?php echo esc_html($survey['title']); ?></h4>
                    <?php if (!empty($survey['description'])): ?>
                        <p class="survey-description"><?php echo esc_html($survey['description']); ?></p>
                    <?php endif; ?>
                    
                    <div class="survey-dates">
                        <?php 
                        $start_date = date_i18n(get_option('date_format'), strtotime($survey['start_date']));
                        $end_date = date_i18n(get_option('date_format'), strtotime($survey['end_date']));
                        printf(__('Disponible desde %s hasta %s', 'condo360-surveys'), $start_date, $end_date);
                        ?>
                    </div>
                    
                    <button type="button" class="survey-select-btn" data-survey-id="<?php echo esc_attr($survey['id']); ?>">
                        <?php _e('Responder Encuesta', 'condo360-surveys'); ?>
                    </button>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    
    <div class="condo360-survey-detail" id="survey-detail" style="display: none;">
        <!-- Aquí se cargará dinámicamente el contenido de la encuesta seleccionada -->
    </div>
</div>