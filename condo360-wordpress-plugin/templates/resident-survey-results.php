<?php
/**
 * Resident survey results template (simplified)
 */
?>

<div class="resident-results-content">
    <h3>Resultados de: <?php echo esc_html($results['survey']['title']); ?></h3>
    
    <?php if (!empty($results['survey']['description'])): ?>
        <p class="survey-description"><?php echo esc_html($results['survey']['description']); ?></p>
    <?php endif; ?>
    
    <div class="survey-dates">
        <?php 
        $start_date = date_i18n(get_option('date_format'), strtotime($results['survey']['start_date']));
        $end_date = date_i18n(get_option('date_format'), strtotime($results['survey']['end_date']));
        printf('Disponible desde %s hasta %s', $start_date, $end_date);
        ?>
    </div>
    
    <div class="resident-results-summary">
        <h4>Resumen</h4>
        <div class="summary-stats">
            <div class="stat-item">
                <span class="stat-number"><?php echo esc_html($results['total_votes']); ?></span>
                <span class="stat-label">Total de Votos</span>
            </div>
            <div class="stat-item">
                <span class="stat-number"><?php echo count($results['questions']); ?></span>
                <span class="stat-label">Preguntas</span>
            </div>
        </div>
    </div>
    
    <div class="resident-questions-results">
        <?php foreach ($results['questions'] as $question): ?>
            <div class="resident-question-result">
                <h4><?php echo esc_html($question['question_text']); ?></h4>
                <div class="resident-options-results">
                    <?php foreach ($question['options'] as $option): ?>
                        <div class="resident-option-result">
                            <div class="option-header">
                                <span class="option-text"><?php echo esc_html($option['option_text']); ?></span>
                                <span class="vote-count"><?php echo esc_html($option['response_count']); ?> votos</span>
                            </div>
                            <div class="resident-vote-bar">
                                <div class="resident-vote-bar-fill" style="width: <?php echo esc_attr($option['percentage']); ?>%"></div>
                            </div>
                            <span class="percentage"><?php echo esc_html(number_format($option['percentage'], 1)); ?>%</span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>
