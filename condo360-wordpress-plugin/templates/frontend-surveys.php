<?php
/**
 * Frontend surveys template
 */
?>

<div class="condo360-surveys-container">
    <?php if (empty($surveys)): ?>
        <div class="condo360-survey-message info">
            <?php _e('No hay Cartas Consulta activas en este momento.', 'condo360-surveys'); ?>
        </div>
    <?php else: ?>
        <!-- Lista de encuestas disponibles -->
        <div class="survey-selection-view">
            <h2><?php _e('Cartas Consulta Disponibles', 'condo360-surveys'); ?></h2>
            <div class="survey-list">
                <?php foreach ($surveys as $survey): ?>
                    <div class="survey-item" data-survey-id="<?php echo esc_attr($survey['id']); ?>">
                        <h3><?php echo esc_html($survey['title']); ?></h3>
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
                        <button class="select-survey-btn" type="button">
                            <?php _e('Ver Carta Consulta', 'condo360-surveys'); ?>
                        </button>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        
        <!-- Vista detallada de la encuesta seleccionada -->
        <div class="survey-detail-view" style="display: none;">
            <div class="survey-back-btn-container">
                <button class="back-to-surveys-btn" type="button">
                    <?php _e('← Volver a la lista', 'condo360-surveys'); ?>
                </button>
            </div>
            <div class="selected-survey-content">
                <!-- El contenido de la encuesta se cargará aquí dinámicamente -->
            </div>
        </div>
    <?php endif; ?>
</div>