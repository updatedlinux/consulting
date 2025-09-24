jQuery(document).ready(function($) {
    // Handle survey selection
    $('.condo360-surveys-container').on('click', '.select-survey-btn', function() {
        var surveyItem = $(this).closest('.survey-item');
        var surveyId = surveyItem.data('survey-id');
        
        // Hide selection view and show detail view
        $('.survey-selection-view').hide();
        $('.survey-detail-view').show();
        
        // Load survey details
        loadSurveyDetails(surveyId);
    });
    
    // Handle back to surveys list
    $('.condo360-surveys-container').on('click', '.back-to-surveys-btn', function() {
        $('.survey-detail-view').hide();
        $('.survey-selection-view').show();
        $('.selected-survey-content').empty();
    });
    
    // Handle radio button changes to enable/disable submit button
    $('.condo360-surveys-container').on('change', 'input[type="radio"]', function() {
        var form = $(this).closest('.condo360-survey-form');
        checkAllQuestionsAnswered(form);
    });
    
    // Handle survey form submission
    $('.condo360-surveys-container').on('submit', '.condo360-survey-form', function(e) {
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
            messageDiv.removeClass('success').addClass('error').text('Por favor responda todas las preguntas.').show();
            return;
        }
        
        // Disable submit button
        submitBtn.prop('disabled', true).text('Enviando...');
        
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
                    messageDiv.removeClass('success').addClass('error').text(response.data.message || 'Error al enviar la Carta Consulta. Por favor intente de nuevo.').show();
                }
            },
            error: function() {
                messageDiv.removeClass('success').addClass('error').text('Error al enviar la Carta Consulta. Por favor intente de nuevo.').show();
            },
            complete: function() {
                submitBtn.prop('disabled', false).text('Enviar Carta Consulta');
            }
        });
    });
    
    // Function to load survey details
    function loadSurveyDetails(surveyId) {
        // In a real implementation, we would make an AJAX call to get the survey details
        // For now, we'll simulate this by getting the data from the existing surveys array
        // In the PHP code, we'll need to pass the surveys data to JavaScript
        
        // Show loading message
        $('.selected-survey-content').html('<p>Cargando detalles de la Carta Consulta...</p>');
        
        // Make AJAX call to get survey details
        $.ajax({
            url: condo360_surveys_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'condo360_get_survey_details',
                survey_id: surveyId,
                nonce: condo360_surveys_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    $('.selected-survey-content').html(response.data.html);
                } else {
                    $('.selected-survey-content').html('<p>Error al cargar los detalles de la Carta Consulta.</p>');
                }
            },
            error: function() {
                $('.selected-survey-content').html('<p>Error al cargar los detalles de la Carta Consulta.</p>');
            }
        });
    }
    
    // Function to check if all questions are answered
    function checkAllQuestionsAnswered(form) {
        var allAnswered = true;
        var submitBtn = form.find('.survey-submit-btn');
        
        form.find('.survey-question').each(function() {
            var answered = $(this).find('input[type="radio"]:checked').length > 0;
            if (!answered) {
                allAnswered = false;
                return false; // Break the loop
            }
        });
        
        submitBtn.prop('disabled', !allAnswered);
    }
});