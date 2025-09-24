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
        <?php foreach ($surveys as $survey): ?>
            <div class="condo360-survey-card" id="survey-<?php echo esc_attr($survey['id']); ?>">
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
                
                <form class="condo360-survey-form" data-survey-id="<?php echo esc_attr($survey['id']); ?>">
                    <?php foreach ($survey['questions'] as $question): ?>
                        <div class="survey-question">
                            <h4><?php echo esc_html($question['question_text']); ?></h4>
                            <div class="survey-options">
                                <?php foreach ($question['options'] as $option): ?>
                                    <div class="survey-option">
                                        <label>
                                            <input type="radio" 
                                                   name="question_<?php echo esc_attr($question['id']); ?>" 
                                                   value="<?php echo esc_attr($option['id']); ?>" 
                                                   required>
                                            <?php echo esc_html($option['option_text']); ?>
                                        </label>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                    
                    <div class="survey-actions">
                        <button type="submit" class="survey-submit-btn">
                            <?php _e('Enviar Carta Consulta', 'condo360-surveys'); ?>
                        </button>
                    </div>
                </form>
                
                <div class="survey-message" style="display: none;"></div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>