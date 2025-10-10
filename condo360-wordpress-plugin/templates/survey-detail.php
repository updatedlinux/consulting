<?php
/**
 * Survey detail template
 */
?>

<div class="condo360-survey-card">
    <h3><?php echo esc_html($survey['title']); ?></h3>
    <?php if (!empty($survey['description'])): ?>
        <p class="survey-description"><?php echo esc_html($survey['description']); ?></p>
    <?php endif; ?>
    
    <div class="survey-dates">
        <?php 
        // Convert UTC dates to Caracas timezone for display
        $start_date_utc = new DateTime($survey['start_date'], new DateTimeZone('UTC'));
        $end_date_utc = new DateTime($survey['end_date'], new DateTimeZone('UTC'));
        
        $start_date_utc->setTimezone(new DateTimeZone('America/Caracas'));
        $end_date_utc->setTimezone(new DateTimeZone('America/Caracas'));
        
        $start_date = $start_date_utc->format('d/m/Y');
        $end_date = $end_date_utc->format('d/m/Y');
        
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
                                       value="<?php echo esc_attr($option['id']); ?>">
                                <?php echo esc_html($option['option_text']); ?>
                            </label>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endforeach; ?>
        
        <div class="survey-actions">
            <button type="submit" class="survey-submit-btn" disabled>
                <?php _e('Enviar Carta Consulta', 'condo360-surveys'); ?>
            </button>
        </div>
    </form>
    
    <div class="survey-message" style="display: none;"></div>
</div>