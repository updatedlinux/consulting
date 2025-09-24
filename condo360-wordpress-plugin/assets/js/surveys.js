jQuery(document).ready(function($) {
    var surveysContainer = $('.condo360-surveys-container');
    var surveysList = $('#surveys-list');
    var surveyDetail = $('#survey-detail');
    
    // Handle survey selection
    surveysContainer.on('click', '.survey-select-btn', function(e) {
        e.preventDefault();
        
        var surveyId = $(this).data('survey-id');
        var button = $(this);
        var originalText = button.text();
        
        // Show loading state
        button.prop('disabled', true).text('Cargando...');
        
        // Get survey detail via AJAX
        $.ajax({
            url: condo360_surveys_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'condo360_get_survey_detail',
                survey_id: surveyId,
                nonce: condo360_surveys_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    // Hide survey list and show survey detail
                    surveysList.hide();
                    surveyDetail.html(response.data.html).show();
                } else {
                    alert(response.data.message || 'Error al cargar la encuesta.');
                }
            },
            error: function() {
                alert('Error de conexión. Por favor intente de nuevo.');
            },
            complete: function() {
                button.prop('disabled', false).text(originalText);
            }
        });
    });
    
    // Handle back to surveys list
    surveysContainer.on('click', '.survey-back-btn', function(e) {
        e.preventDefault();
        
        // Hide survey detail and show survey list
        surveyDetail.hide();
        surveysList.show();
    });
    
    // Handle survey form submission
    surveysContainer.on('submit', '.condo360-survey-form', function(e) {
        e.preventDefault();
        
        var form = $(this);
        var surveyId = form.data('survey-id');
        var submitBtn = form.find('.survey-submit-btn');
        var backBtn = form.find('.survey-back-btn');
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
            messageDiv.removeClass('success').addClass('error').text('Por favor responda todas las preguntas.').show();
            return;
        }
        
        // Disable buttons
        submitBtn.prop('disabled', true).text('Enviando...');
        backBtn.prop('disabled', true);
        
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
                    messageDiv.removeClass('error').addClass('success').text(response.data.message || 'Voto registrado exitosamente').show();
                    form.hide();
                } else {
                    messageDiv.removeClass('success').addClass('error').text(response.data.message || 'Error al enviar la encuesta. Por favor intente de nuevo.').show();
                }
            },
            error: function() {
                messageDiv.removeClass('success').addClass('error').text('Error al enviar la encuesta. Por favor intente de nuevo.').show();
            },
            complete: function() {
                submitBtn.prop('disabled', false).text('Enviar Encuesta');
                backBtn.prop('disabled', false);
            }
        });
    });
});