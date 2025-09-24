jQuery(document).ready(function($) {
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
    
    // Add pagination functionality
    // Hide all surveys except the first one initially
    var surveys = $('.condo360-survey-card');
    if (surveys.length > 1) {
        // Hide all surveys except the first one
        surveys.hide().first().show();
        
        // Add navigation buttons
        surveys.each(function(index) {
            var survey = $(this);
            var navContainer = $('<div class="survey-navigation"></div>');
            
            if (index > 0) {
                var prevBtn = $('<button type="button" class="survey-nav-btn prev-btn">← Anterior Carta Consulta</button>');
                navContainer.append(prevBtn);
            }
            
            if (index < surveys.length - 1) {
                var nextBtn = $('<button type="button" class="survey-nav-btn next-btn">Siguiente Carta Consulta →</button>');
                navContainer.append(nextBtn);
            }
            
            if (navContainer.children().length > 0) {
                survey.find('.survey-actions').append(navContainer);
            }
        });
        
        // Handle navigation
        $('.condo360-surveys-container').on('click', '.survey-nav-btn', function(e) {
            e.preventDefault();
            
            var currentSurvey = $(this).closest('.condo360-survey-card');
            var currentIndex = surveys.index(currentSurvey);
            
            if ($(this).hasClass('next-btn')) {
                currentSurvey.hide();
                surveys.eq(currentIndex + 1).show();
            } else if ($(this).hasClass('prev-btn')) {
                currentSurvey.hide();
                surveys.eq(currentIndex - 1).show();
            }
        });
    }
});