jQuery(document).ready(function($) {
    // Tab switching
    $('.tab-btn').on('click', function() {
        var tab = $(this).data('tab');
        
        // Update active tab button
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        // Show active tab content
        $('.tab-content').removeClass('active');
        $('#' + tab + '-tab').addClass('active');
        
        // Load data based on tab
        if (tab === 'surveys-list') {
            loadSurveysList();
        } else if (tab === 'survey-results') {
            loadSurveysForResults();
        } else if (tab === 'voters-detail') {
            loadSurveysForVoters();
        }
    });
    
    // Add question
    $(document).on('click', '.add-question-btn', function() {
        var questionTemplate = `
            <div class="question-item">
                <input type="text" class="question-text" placeholder="Texto de la pregunta" required>
                <div class="options-container">
                    <input type="text" class="option-text" placeholder="Opción 1" required>
                    <input type="text" class="option-text" placeholder="Opción 2" required>
                </div>
                <button type="button" class="add-option-btn">+ Agregar Opción</button>
                <button type="button" class="remove-question-btn">Eliminar Pregunta</button>
            </div>
        `;
        $('.questions-container').append(questionTemplate);
    });
    
    // Add option
    $(document).on('click', '.add-option-btn', function() {
        var optionInput = '<input type="text" class="option-text" placeholder="Nueva opción" required>';
        $(this).siblings('.options-container').append(optionInput);
    });
    
    // Remove question
    $(document).on('click', '.remove-question-btn', function() {
        if ($('.question-item').length > 1) {
            $(this).closest('.question-item').remove();
        } else {
            alert('Debe haber al menos una pregunta.');
        }
    });
    
    // Create survey form submission
    $('#create-survey-form').on('submit', function(e) {
        e.preventDefault();
        
        var form = $(this);
        var submitBtn = form.find('.submit-btn');
        var messageDiv = $('#create-survey-message');
        
        // Collect form data
        var surveyData = {
            title: $('#survey-title').val(),
            description: $('#survey-description').val(),
            start_date: $('#survey-start-date').val(),
            end_date: $('#survey-end-date').val(),
            questions: []
        };
        
        // Collect questions and options
        $('.question-item').each(function() {
            var questionText = $(this).find('.question-text').val();
            var options = [];
            
            $(this).find('.option-text').each(function() {
                var optionText = $(this).val();
                if (optionText.trim() !== '') {
                    options.push(optionText);
                }
            });
            
            if (questionText.trim() !== '' && options.length >= 2) {
                surveyData.questions.push({
                    question_text: questionText,
                    options: options
                });
            }
        });
        
        // Validate form
        if (surveyData.title.trim() === '' || surveyData.questions.length === 0) {
            showMessage(messageDiv, 'Por favor complete todos los campos requeridos.', 'error');
            return;
        }
        
        // Disable submit button
        submitBtn.prop('disabled', true).text('Creando...');
        
        // Send AJAX request
        $.ajax({
            url: condo360_admin_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'condo360_admin_create_survey',
                nonce: condo360_admin_ajax.nonce,
                title: surveyData.title,
                description: surveyData.description,
                start_date: surveyData.start_date,
                end_date: surveyData.end_date,
                questions: surveyData.questions
            },
            success: function(response) {
                if (response.success) {
                    showMessage(messageDiv, response.data.message, 'success');
                    form[0].reset();
                    $('.questions-container').html(`
                        <div class="question-item">
                            <input type="text" class="question-text" placeholder="Texto de la pregunta" required>
                            <div class="options-container">
                                <input type="text" class="option-text" placeholder="Opción 1" required>
                                <input type="text" class="option-text" placeholder="Opción 2" required>
                            </div>
                            <button type="button" class="add-option-btn">+ Agregar Opción</button>
                        </div>
                    `);
                } else {
                    showMessage(messageDiv, response.data.message, 'error');
                }
            },
            error: function(xhr, status, error) {
                showMessage(messageDiv, 'Error al crear la Carta Consulta. Por favor intente de nuevo. (' + error + ')', 'error');
            },
            complete: function() {
                submitBtn.prop('disabled', false).text('Crear Carta Consulta');
            }
        });
    });
    
    // Load surveys list
    function loadSurveysList() {
        var container = $('.surveys-list-container');
        var loadingMessage = container.find('.loading-message');
        var surveysList = container.find('.surveys-list');
        
        loadingMessage.show().text('Cargando Cartas Consulta...');
        surveysList.hide();
        
        $.ajax({
            url: condo360_admin_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'condo360_admin_get_surveys',
                nonce: condo360_admin_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    // Load template via AJAX
                    $.ajax({
                        url: condo360_admin_ajax.ajax_url,
                        type: 'POST',
                        data: {
                            action: 'condo360_admin_load_template',
                            template: 'admin-surveys-list',
                            nonce: condo360_admin_ajax.nonce,
                            surveys: response.data.surveys
                        },
                        success: function(templateResponse) {
                            if (templateResponse.success) {
                                surveysList.html(templateResponse.data.html);
                                loadingMessage.hide();
                                surveysList.show();
                            } else {
                                loadingMessage.text('Error al cargar la plantilla: ' + templateResponse.data.message);
                            }
                        },
                        error: function(xhr, status, error) {
                            loadingMessage.text('Error al cargar la plantilla: ' + error);
                        }
                    });
                } else {
                    loadingMessage.text('Error al cargar las Cartas Consulta: ' + response.data.message);
                }
            },
            error: function(xhr, status, error) {
                loadingMessage.text('Error de conexión al cargar las Cartas Consulta: ' + error);
            }
        });
    }
    
    // Load ALL surveys for results dropdown (including closed ones)
    function loadSurveysForResults() {
        var select = $('#select-survey-results');
        select.html('<option value="">Cargando Cartas Consulta...</option>');
        
        // Use the /all endpoint to get all surveys including closed ones
        $.ajax({
            url: 'https://api.bonaventurecclub.com/polls/surveys/all',
            type: 'GET',
            success: function(surveys) {
                var options = '<option value="">Seleccione una Carta Consulta</option>';
                // Show all surveys (both open and closed) for results
                $.each(surveys, function(index, survey) {
                    var statusText = survey.status === 'open' ? ' (Activa)' : ' (Cerrada)';
                    options += `<option value="${survey.id}">${survey.title}${statusText}</option>`;
                });
                select.html(options);
            },
            error: function(xhr, status, error) {
                select.html('<option value="">Error de conexión: ' + error + '</option>');
            }
        });
    }
    
    // Load ALL surveys for voters dropdown (including closed ones)
    function loadSurveysForVoters() {
        var select = $('#select-survey-voters');
        select.html('<option value="">Cargando Cartas Consulta...</option>');
        
        // Use the /all endpoint to get all surveys including closed ones
        $.ajax({
            url: 'https://api.bonaventurecclub.com/polls/surveys/all',
            type: 'GET',
            success: function(surveys) {
                var options = '<option value="">Seleccione una Carta Consulta</option>';
                // Show all surveys (both open and closed) for voters
                $.each(surveys, function(index, survey) {
                    var statusText = survey.status === 'open' ? ' (Activa)' : ' (Cerrada)';
                    options += `<option value="${survey.id}">${survey.title}${statusText}</option>`;
                });
                select.html(options);
            },
            error: function(xhr, status, error) {
                select.html('<option value="">Error de conexión: ' + error + '</option>');
            }
        });
    }
    
    // Close survey
    $(document).on('click', '.close-survey-btn', function() {
        var surveyId = $(this).data('survey-id');
        var button = $(this);
        var originalText = button.text();
        
        if (!confirm('¿Está seguro de que desea cerrar esta Carta Consulta?')) {
            return;
        }
        
        button.prop('disabled', true).text('Cerrando...');
        
        $.ajax({
            url: condo360_admin_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'condo360_admin_close_survey',
                nonce: condo360_admin_ajax.nonce,
                survey_id: surveyId
            },
            success: function(response) {
                if (response.success) {
                    alert(response.data.message);
                    // Reload surveys list
                    loadSurveysList();
                } else {
                    alert('Error: ' + response.data.message);
                    button.prop('disabled', false).text(originalText);
                }
            },
            error: function(xhr, status, error) {
                alert('Error al cerrar la Carta Consulta. Por favor intente de nuevo. (' + error + ')');
                button.prop('disabled', false).text(originalText);
            }
        });
    });
    
    // Load survey results
    $('#select-survey-results').on('change', function() {
        var surveyId = $(this).val();
        var resultsContainer = $('.results-container');
        var messageDiv = $('#results-message');
        
        if (!surveyId) {
            resultsContainer.hide();
            return;
        }
        
        resultsContainer.show();
        $('.survey-results').html('<div class="loading-message">Cargando resultados...</div>');
        
        $.ajax({
            url: condo360_admin_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'condo360_admin_get_survey_results',
                nonce: condo360_admin_ajax.nonce,
                survey_id: surveyId
            },
            success: function(response) {
                if (response.success) {
                    // Load template via AJAX
                    $.ajax({
                        url: condo360_admin_ajax.ajax_url,
                        type: 'POST',
                        data: {
                            action: 'condo360_admin_load_template',
                            template: 'admin-survey-results',
                            nonce: condo360_admin_ajax.nonce,
                            results: response.data.results
                        },
                        success: function(templateResponse) {
                            if (templateResponse.success) {
                                $('.survey-results').html(templateResponse.data.html);
                            } else {
                                $('.survey-results').html('<p>Error al cargar la plantilla de resultados: ' + templateResponse.data.message + '</p>');
                            }
                        },
                        error: function(xhr, status, error) {
                            $('.survey-results').html('<p>Error al cargar la plantilla de resultados: ' + error + '</p>');
                        }
                    });
                } else {
                    $('.survey-results').html('<p>Error al cargar los resultados: ' + response.data.message + '</p>');
                }
            },
            error: function(xhr, status, error) {
                $('.survey-results').html('<p>Error de conexión al cargar los resultados: ' + error + '</p>');
            }
        });
    });
    
    // Load survey voters
    $('#select-survey-voters').on('change', function() {
        var surveyId = $(this).val();
        var votersContainer = $('.voters-container');
        var messageDiv = $('#voters-message');
        
        if (!surveyId) {
            votersContainer.hide();
            return;
        }
        
        votersContainer.show();
        $('.voters-summary').html('<div class="loading-message">Cargando detalles de votantes...</div>');
        $('.voters-list').html('');
        
        $.ajax({
            url: condo360_admin_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'condo360_admin_get_survey_voters',
                nonce: condo360_admin_ajax.nonce,
                survey_id: surveyId
            },
            success: function(response) {
                if (response.success) {
                    // Load template via AJAX
                    $.ajax({
                        url: condo360_admin_ajax.ajax_url,
                        type: 'POST',
                        data: {
                            action: 'condo360_admin_load_template',
                            template: 'admin-voters-detail',
                            nonce: condo360_admin_ajax.nonce,
                            votersData: response.data.votersData
                        },
                        success: function(templateResponse) {
                            if (templateResponse.success) {
                                $('.voters-summary').html(templateResponse.data.html);
                            } else {
                                $('.voters-summary').html('<p>Error al cargar la plantilla de votantes: ' + templateResponse.data.message + '</p>');
                            }
                        },
                        error: function(xhr, status, error) {
                            $('.voters-summary').html('<p>Error al cargar la plantilla de votantes: ' + error + '</p>');
                        }
                    });
                } else {
                    $('.voters-summary').html('<p>Error al cargar los votantes: ' + response.data.message + '</p>');
                }
            },
            error: function(xhr, status, error) {
                $('.voters-summary').html('<p>Error de conexión al cargar los votantes: ' + error + '</p>');
            }
        });
    });
    
    // Download PDF
    $(document).on('click', '.download-pdf-btn', function() {
        var surveyId = $(this).data('survey-id');
        var button = $(this);
        var originalText = button.text();
        
        button.prop('disabled', true).text('Generando PDF...');
        
        // Create a temporary link to download the PDF
        var downloadUrl = 'https://api.bonaventurecclub.com/polls/surveys/' + surveyId + '/pdf';
        
        // Create a temporary anchor element to trigger download
        var link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'resultados-encuesta-' + surveyId + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Reset button after a short delay
        setTimeout(function() {
            button.prop('disabled', false).text(originalText);
        }, 2000);
    });
    
    // Show message function
    function showMessage(messageDiv, text, type) {
        messageDiv.removeClass('success error').addClass(type).text(text).show();
        setTimeout(function() {
            messageDiv.fadeOut();
        }, 5000);
    }
    
    // Initialize with surveys list
    if ($('.tab-content.active').attr('id') === 'surveys-list-tab') {
        loadSurveysList();
    }
});