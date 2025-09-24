<?php
/**
 * Survey results template
 */
?>

<div class="survey-results-content">
    <h3>Resultados de: <?php echo esc_html($survey['title']); ?></h3>
    
    <?php if (!empty($survey['description'])): ?>
        <p class="survey-description"><?php echo esc_html($survey['description']); ?></p>
    <?php endif; ?>
    
    <div class="survey-dates">
        <?php 
        $start_date = date_i18n(get_option('date_format'), strtotime($survey['start_date']));
        $end_date = date_i18n(get_option('date_format'), strtotime($survey['end_date']));
        printf('Disponible desde %s hasta %s', $start_date, $end_date);
        ?>
    </div>
    
    <div class="results-summary">
        <h4>Resumen</h4>
        <p>Total de votos: <?php echo esc_html($results['total_votes']); ?></p>
    </div>
    
    <div class="questions-results">
        <?php foreach ($results['questions'] as $question): ?>
            <div class="question-result">
                <h4><?php echo esc_html($question['question_text']); ?></h4>
                <div class="options-results">
                    <?php foreach ($question['options'] as $option): ?>
                        <div class="option-result">
                            <span class="option-text"><?php echo esc_html($option['option_text']); ?></span>
                            <span class="vote-count"><?php echo esc_html($option['vote_count']); ?> votos</span>
                            <div class="vote-bar">
                                <div class="vote-bar-fill" style="width: <?php echo esc_attr($option['percentage']); ?>%"></div>
                            </div>
                            <span class="percentage"><?php echo esc_html(number_format($option['percentage'], 1)); ?>%</span>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>