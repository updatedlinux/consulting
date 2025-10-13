jQuery(document).ready(function($) {
    console.log('Condo360 Surveys JS loaded');
    console.log('jQuery version:', $.fn.jquery);
    console.log('Button elements found:', $('.view-results-btn').length);
    console.log('Modal element found:', $('#results-modal').length);
    
    // Handle view results button click
    $('.view-results-btn').on('click', function() {
        console.log('View results button clicked');
        var modal = $('#results-modal');
        
        // Try both approaches
        modal.addClass('show');
        modal.show();
        
        console.log('Modal classes after adding show:', modal.attr('class'));
        console.log('Modal computed display:', modal.css('display'));
        console.log('Modal is visible:', modal.is(':visible'));
        loadSurveysForModal();
    });
    
    // Alternative event delegation approach
    $(document).on('click', '.view-results-btn', function() {
        console.log('View results button clicked (delegated)');
        var modal = $('#results-modal');
        console.log('Modal element found:', modal.length);
        
        // Try both approaches
        modal.addClass('show');
        modal.show();
        
        console.log('Modal classes after adding show (delegated):', modal.attr('class'));
        console.log('Modal computed display (delegated):', modal.css('display'));
        console.log('Modal is visible (delegated):', modal.is(':visible'));
        loadSurveysForModal();
    });
    
    // Handle modal close
    $('.close-modal, #results-modal').on('click', function(e) {
        if (e.target === this) {
            var modal = $('#results-modal');
            modal.removeClass('show');
            modal.hide();
        }
    });
    
    // Prevent modal content clicks from closing modal
    $('.modal-content').on('click', function(e) {
        e.stopPropagation();
    });
    
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
    
    // Load surveys for modal results
    function loadSurveysForModal() {
        console.log('loadSurveysForModal called');
        var select = $('#select-survey-results-modal');
        console.log('Select element found:', select.length);
        select.html('<option value="">Cargando Cartas Consulta...</option>');
        
        // Use the /all endpoint to get all surveys including closed ones
        $.ajax({
            url: 'https://api.bonaventurecclub.com/polls/surveys/all',
            type: 'GET',
            success: function(surveys) {
                var options = '<option value="">Seleccione una Carta Consulta</option>';
                // Show only closed surveys for PDF download
                $.each(surveys, function(index, survey) {
                    if (survey.status === 'closed') {
                        options += `<option value="${survey.id}">${survey.title} (Cerrada)</option>`;
                    }
                });
                select.html(options);
            },
            error: function(xhr, status, error) {
                select.html('<option value="">Error de conexión: ' + error + '</option>');
            }
        });
    }
    
    // Handle survey selection in modal
    $('#select-survey-results-modal').on('change', function() {
        var surveyId = $(this).val();
        var downloadBtn = $('#download-pdf-btn');
        var modalActions = $('.modal-actions');
        var messageDiv = $('#modal-message');
        
        if (!surveyId) {
            downloadBtn.prop('disabled', true);
            modalActions.hide();
            messageDiv.hide();
            return;
        }
        
        downloadBtn.prop('disabled', false);
        modalActions.show();
        messageDiv.hide();
    });
    
    // Handle PDF download
    $('#download-pdf-btn').on('click', function() {
        var surveyId = $('#select-survey-results-modal').val();
        var messageDiv = $('#modal-message');
        
        if (!surveyId) {
            messageDiv.removeClass('success').addClass('error').text('Por favor seleccione una Carta Consulta.').show();
            return;
        }
        
        // Show loading message
        messageDiv.removeClass('error').addClass('info').text('Generando PDF...').show();
        
        // Create download link
        var downloadUrl = 'https://api.bonaventurecclub.com/polls/surveys/' + surveyId + '/pdf';
        
        // Create temporary link element for download
        var link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'resultados-carta-consulta-' + surveyId + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        messageDiv.removeClass('info error').addClass('success').text('PDF generado exitosamente. La descarga debería comenzar automáticamente.').show();
    });
});