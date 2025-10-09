<?php
/**
 * Admin create survey template
 */
?>

<div class="wrap">
    <h1><?php _e('Create New Survey', 'condo360-surveys'); ?></h1>
    
    <form method="post" id="condo360-create-survey-form">
        <?php wp_nonce_field('condo360_create_survey', 'condo360_create_survey_nonce'); ?>
        
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="survey_title"><?php _e('Survey Title', 'condo360-surveys'); ?></label>
                </th>
                <td>
                    <input name="survey_title" type="text" id="survey_title" class="regular-text" required>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="survey_description"><?php _e('Description', 'condo360-surveys'); ?> *</label>
                </th>
                <td>
                    <textarea name="survey_description" id="survey_description" rows="3" class="regular-text" required></textarea>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="start_date"><?php _e('Start Date', 'condo360-surveys'); ?></label>
                </th>
                <td>
                    <input name="start_date" type="datetime-local" id="start_date" required>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="end_date"><?php _e('End Date', 'condo360-surveys'); ?></label>
                </th>
                <td>
                    <input name="end_date" type="datetime-local" id="end_date" required>
                </td>
            </tr>
        </table>
        
        <h2><?php _e('Questions', 'condo360-surveys'); ?></h2>
        
        <div id="questions-container">
            <div class="question-group" data-question="1">
                <h3><?php _e('Question', 'condo360-surveys'); ?> 1</h3>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="question_1"><?php _e('Question Text', 'condo360-surveys'); ?></label>
                        </th>
                        <td>
                            <textarea name="question_1" id="question_1" rows="2" class="regular-text" required></textarea>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <?php _e('Options', 'condo360-surveys'); ?>
                        </th>
                        <td>
                            <div class="options-container" id="options-container-1">
                                <div class="option-group">
                                    <input type="text" name="option_1_1" placeholder="<?php _e('Option 1', 'condo360-surveys'); ?>" required>
                                </div>
                                <div class="option-group">
                                    <input type="text" name="option_1_2" placeholder="<?php _e('Option 2', 'condo360-surveys'); ?>" required>
                                </div>
                            </div>
                            
                            <button type="button" class="button add-option" data-question="1">
                                <?php _e('Add Option', 'condo360-surveys'); ?>
                            </button>
                        </td>
                    </tr>
                </table>
                
                <input type="hidden" name="option_count_1" id="option_count_1" value="2">
            </div>
        </div>
        
        <input type="hidden" name="question_count" id="question_count" value="1">
        
        <p class="submit">
            <button type="button" id="add-question" class="button">
                <?php _e('Add Question', 'condo360-surveys'); ?>
            </button>
            
            <input type="submit" name="submit" id="submit" class="button button-primary" value="<?php _e('Create Survey', 'condo360-surveys'); ?>">
        </p>
    </form>
</div>