<?php
/**
 * Admin select survey template
 */
?>

<div class="wrap">
    <h1><?php _e('Survey Results', 'condo360-surveys'); ?></h1>
    
    <?php if (empty($surveys)): ?>
        <div class="notice notice-info">
            <p><?php _e('No surveys found.', 'condo360-surveys'); ?></p>
        </div>
    <?php else: ?>
        <table class="wp-list-table widefat fixed striped">
            <thead>
                <tr>
                    <th><?php _e('Title', 'condo360-surveys'); ?></th>
                    <th><?php _e('Status', 'condo360-surveys'); ?></th>
                    <th><?php _e('Dates', 'condo360-surveys'); ?></th>
                    <th><?php _e('Actions', 'condo360-surveys'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($surveys as $survey): ?>
                    <tr>
                        <td><?php echo esc_html($survey['title']); ?></td>
                        <td>
                            <span class="survey-status <?php echo esc_attr($survey['status']); ?>">
                                <?php 
                                echo $survey['status'] === 'open' ? 
                                    __('Open', 'condo360-surveys') : 
                                    __('Closed', 'condo360-surveys'); 
                                ?>
                            </span>
                        </td>
                        <td>
                            <?php 
                            $start_date = date_i18n(get_option('date_format'), strtotime($survey['start_date']));
                            $end_date = date_i18n(get_option('date_format'), strtotime($survey['end_date']));
                            echo sprintf(__('%s to %s', 'condo360-surveys'), $start_date, $end_date);
                            ?>
                        </td>
                        <td>
                            <a href="<?php echo admin_url('admin.php?page=condo360-survey-results&survey_id=' . $survey['id']); ?>" class="button">
                                <?php _e('View Results', 'condo360-surveys'); ?>
                            </a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php endif; ?>
</div>