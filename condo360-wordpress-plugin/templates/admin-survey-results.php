<?php
/**
 * Admin survey results template
 */
?>

<div class="wrap">
    <h1>
        <?php 
        if ($results): 
            echo sprintf(__('Results: %s', 'condo360-surveys'), esc_html($results['survey']['title']));
        else:
            _e('Survey Results', 'condo360-surveys');
        endif;
        ?>
    </h1>
    
    <?php if (!$results): ?>
        <div class="notice notice-error">
            <p><?php _e('Error loading survey results.', 'condo360-surveys'); ?></p>
        </div>
    <?php else: ?>
        <div class="survey-info">
            <p><strong><?php _e('Status:', 'condo360-surveys'); ?></strong> 
                <span class="survey-status <?php echo esc_attr($results['survey']['status']); ?>">
                    <?php 
                    echo $results['survey']['status'] === 'open' ? 
                        __('Open', 'condo360-surveys') : 
                        __('Closed', 'condo360-surveys'); 
                    ?>
                </span>
            </p>
            <p><strong><?php _e('Dates:', 'condo360-surveys'); ?></strong> 
                <?php 
                $start_date = date_i18n(get_option('date_format'), strtotime($results['survey']['start_date']));
                $end_date = date_i18n(get_option('date_format'), strtotime($results['survey']['end_date']));
                echo sprintf(__('%s to %s', 'condo360-surveys'), $start_date, $end_date);
                ?>
            </p>
        </div>
        
        <?php foreach ($results['questions'] as $question): ?>
            <div class="survey-results-question">
                <h3><?php echo esc_html($question['question_text']); ?></h3>
                
                <div class="survey-results-options">
                    <?php 
                    $total_responses = array_sum(array_column($question['options'], 'response_count'));
                    ?>
                    
                    <?php foreach ($question['options'] as $option): ?>
                        <?php 
                        $percentage = $total_responses > 0 ? round(($option['response_count'] / $total_responses) * 100, 1) : 0;
                        ?>
                        <div class="survey-results-option">
                            <div class="option-text">
                                <?php echo esc_html($option['option_text']); ?>
                            </div>
                            <div class="option-stats">
                                <span class="response-count"><?php echo esc_html($option['response_count']); ?> <?php _e('votes', 'condo360-surveys'); ?></span>
                                <span class="percentage">(<?php echo esc_html($percentage); ?>%)</span>
                            </div>
                            <div class="option-bar-container">
                                <div class="option-bar" style="width: <?php echo esc_attr($percentage); ?>%"></div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        <?php endforeach; ?>
        
        <div style="margin-top: 20px;">
            <a href="<?php echo admin_url('admin.php?page=condo360-survey-results'); ?>" class="button">
                <?php _e('Back to Surveys', 'condo360-surveys'); ?>
            </a>
        </div>
    <?php endif; ?>
</div>