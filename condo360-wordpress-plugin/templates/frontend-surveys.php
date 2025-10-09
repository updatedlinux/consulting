<?php
/**
 * Frontend surveys template
 */
?>

<div class="condo360-surveys-container">
    <!-- Tabs para residentes -->
    <div class="resident-tabs">
        <button class="resident-tab-btn active" data-tab="surveys-list">Cartas Consulta Disponibles</button>
        <button class="resident-tab-btn" data-tab="survey-results">Ver Resultados</button>
    </div>
    
    <!-- Surveys List Tab -->
    <div class="resident-tab-content active" id="surveys-list-tab">
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
    
    <!-- Survey Results Tab -->
    <div class="resident-tab-content" id="survey-results-tab">
        <div class="resident-section">
            <h3>Resultados de Cartas Consulta</h3>
            <div class="form-group">
                <label for="select-survey-results-resident">Seleccionar Carta Consulta:</label>
                <select id="select-survey-results-resident" name="survey_id">
                    <option value="">Cargando Cartas Consulta...</option>
                </select>
            </div>
            
            <div class="resident-results-container" style="display: none;">
                <div class="resident-survey-results">
                    <!-- Results will be loaded here dynamically -->
                </div>
            </div>
            
            <div class="resident-message" id="resident-results-message" style="display: none;"></div>
        </div>
    </div>
</div>