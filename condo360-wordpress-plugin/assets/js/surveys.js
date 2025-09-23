jQuery(document).ready(function($) {
    // Handle survey form submission
    $('.condo360-survey-form').on('submit', function(e) {
        e.preventDefault();
        
        var form = $(this);
        var surveyId = form.data('survey-id');
        var submitBtn = form.find('.survey-submit-btn');
        var messageDiv = form.siblings('.survey-message');
        
        // Collect responses
        var responses = [];
        form.find('.survey-question').each(function() {
            var questionId = $(this).find('input[type="radio"]').attr('name').replace('question_', '');
            var selectedOption = $(this).find('input[type="radio"]:checked').val();
            
            if (selectedOption) {
                responses.push({
                    question_id: parseInt(questionId),
                    option_id: parseInt(selectedOption)
                });
            }
        });
        
        // Validate all questions answered
        var totalQuestions = form.find('.survey-question').length;
        if (responses.length !== totalQuestions) {
            messageDiv.removeClass('success').addClass('error').text('Please answer all questions.').show();
            return;
        }
        
        // Disable submit button
        submitBtn.prop('disabled', true).text('Submitting...');
        
        // Send AJAX request
        $.ajax({
            url: condo360_surveys_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'condo360_submit_survey',
                survey_id: surveyId,
                responses: responses,
                nonce: condo360_surveys_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    messageDiv.removeClass('error').addClass('success').text(response.data.message).show();
                    form.hide();
                } else {
                    messageDiv.removeClass('success').addClass('error').text(response.data.message).show();
                }
            },
            error: function() {
                messageDiv.removeClass('success').addClass('error').text('Error submitting survey. Please try again.').show();
            },
            complete: function() {
                submitBtn.prop('disabled', false).text('Submit Survey');
            }
        });
    });
});