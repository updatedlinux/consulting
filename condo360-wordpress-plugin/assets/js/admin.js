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
        
        // Center active tab in mobile carousel
        centerActiveTab();
        
        // Load data based on tab
        if (tab === 'surveys-list') {
            loadSurveysList();
        } else if (tab === 'survey-results') {
            loadSurveysForResults();
        } else if (tab === 'voters-detail') {
            loadSurveysForVoters();
        }
    });
    
    // Function to center active tab in mobile carousel
    function centerActiveTab() {
        if ($(window).width() <= 768) {
            var $activeTab = $('.tab-btn.active');
            var $tabsContainer = $('.admin-tabs');
            
            if ($activeTab.length && $tabsContainer.length) {
                var containerWidth = $tabsContainer.width();
                var tabOffset = $activeTab.position().left;
                var tabWidth = $activeTab.outerWidth();
                var scrollLeft = tabOffset - (containerWidth / 2) + (tabWidth / 2);
                
                $tabsContainer.animate({
                    scrollLeft: scrollLeft
                }, 300);
            }
        }
    }
    
    // Center active tab on window resize
    $(window).on('resize', function() {
        centerActiveTab();
    });
    
    // Center active tab on page load
    $(window).on('load', function() {
        setTimeout(centerActiveTab, 100);
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
    
    // Add option in edit form
    $(document).on('click', '.add-option-btn', function() {
        var optionItem = `
            <div class="option-item">
                <input type="text" class="option-text" placeholder="Nueva opción" required>
                <button type="button" class="remove-option-btn">×</button>
            </div>
        `;
        $(this).siblings('.options-container').append(optionItem);
    });
    
    // Remove option in edit form
    $(document).on('click', '.remove-option-btn', function() {
        $(this).closest('.option-item').remove();
    });
    
    // Remove question in edit form
    $(document).on('click', '.remove-question-btn', function() {
        if ($('.question-item').length > 1) {
            $(this).closest('.question-item').remove();
        } else {
            alert('Debe haber al menos una pregunta.');
        }
    });
    
    // Edit survey form submission
    $(document).on('submit', '#edit-survey-form', function(e) {
        e.preventDefault();
        console.log('Edit form submitted!'); // Debug log
        
        var form = $(this);
        var surveyId = form.data('survey-id');
        var submitBtn = form.find('.submit-btn');
        var messageDiv = $('#edit-survey-message');
        
        console.log('Form data survey ID:', surveyId); // Debug log
        
        // Collect form data
        var surveyData = {
            title: $('#edit-survey-title').val(),
            description: $('#edit-survey-description').val(),
            start_date: $('#edit-survey-start-date').val(),
            end_date: $('#edit-survey-end-date').val(),
            questions: []
        };
        
        console.log('Basic form data collected:', surveyData); // Debug log
        
        // Collect questions and options
        $('.question-item').each(function() {
            var questionText = $(this).find('.question-text').val();
            var options = [];
            
            $(this).find('.option-text').each(function() {
                var optionText = $(this).val();
                if (optionText.trim() !== '') {
                    options.push({ option_text: optionText });
                }
            });
            
            if (questionText.trim() !== '' && options.length >= 2) {
                surveyData.questions.push({
                    question_text: questionText,
                    options: options
                });
            }
        });
        
        console.log('Complete survey data:', surveyData); // Debug log
        
        // Validate form
        if (surveyData.title.trim() === '' || surveyData.description.trim() === '' || surveyData.questions.length === 0) {
            console.log('Form validation failed'); // Debug log
            showMessage(messageDiv, 'Por favor complete todos los campos requeridos.', 'error');
            return;
        }
        
        console.log('Form validation passed, sending to API...'); // Debug log
        
        // Disable submit button
        submitBtn.prop('disabled', true).text('Actualizando...');
        
        // Send to API
        console.log('Sending survey data:', surveyData);
        console.log('Survey ID:', surveyId);
        console.log('API URL:', 'https://api.bonaventurecclub.com/polls/surveys/' + surveyId); // Debug log
        
        $.ajax({
            url: 'https://api.bonaventurecclub.com/polls/surveys/' + surveyId,
            type: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(surveyData),
            success: function(response) {
                console.log('Update response:', response);
                showMessage(messageDiv, 'Carta Consulta actualizada exitosamente.', 'success');
                setTimeout(function() {
                    loadSurveysList();
                }, 2000);
            },
            error: function(xhr, status, error) {
                console.log('Update error:', xhr, status, error);
                console.log('Error response:', xhr.responseText); // Debug log
                var errorMessage = 'Error al actualizar la Carta Consulta.';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                showMessage(messageDiv, errorMessage, 'error');
            },
            complete: function() {
                submitBtn.prop('disabled', false).text('Actualizar Carta Consulta');
            }
        });
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
        if (surveyData.title.trim() === '' || surveyData.description.trim() === '' || surveyData.questions.length === 0) {
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
        console.log('loadSurveysForVoters called');
        var select = $('#select-survey-voters');
        console.log('Voters select element found:', select.length);
        select.html('<option value="">Cargando Cartas Consulta...</option>');
        
        // Use the /all endpoint to get all surveys including closed ones
        $.ajax({
            url: 'https://api.bonaventurecclub.com/polls/surveys/all',
            type: 'GET',
            success: function(surveys) {
                console.log('Surveys loaded for voters:', surveys.length);
                var options = '<option value="">Seleccione una Carta Consulta</option>';
                // Show all surveys (both open and closed) for voters
                $.each(surveys, function(index, survey) {
                    var statusText = survey.status === 'open' ? ' (Activa)' : ' (Cerrada)';
                    options += `<option value="${survey.id}">${survey.title}${statusText}</option>`;
                });
                select.html(options);
                console.log('Voters select options updated');
            },
            error: function(xhr, status, error) {
                console.log('Error loading surveys for voters:', error);
                select.html('<option value="">Error de conexión: ' + error + '</option>');
            }
        });
    }
    
    // Edit survey button click
    $(document).on('click', '.edit-survey-btn', function() {
        var surveyId = $(this).data('survey-id');
        loadSurveyForEdit(surveyId);
    });
    
    // Close survey button click
    $(document).on('click', '.close-survey-btn', function() {
        var surveyId = $(this).data('survey-id');
        var button = $(this);
        var originalText = button.text();
        
        if (!confirm('¿Está seguro de que desea cerrar esta Carta Consulta? Esta acción no se puede deshacer.')) {
            return;
        }
        
        button.prop('disabled', true).text('Cerrando...');
        
        $.ajax({
            url: 'https://api.bonaventurecclub.com/polls/surveys/' + surveyId + '/close',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            success: function(response) {
                console.log('Survey closed successfully:', response);
                showMessage($('#surveys-list-message'), 'Carta Consulta cerrada exitosamente.', 'success');
                setTimeout(function() {
                    loadSurveysList();
                }, 2000);
            },
            error: function(xhr, status, error) {
                console.log('Error closing survey:', xhr, status, error);
                var errorMessage = 'Error al cerrar la Carta Consulta.';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                showMessage($('#surveys-list-message'), errorMessage, 'error');
                button.prop('disabled', false).text(originalText);
            }
        });
    });
    
    // Back to list button
    $(document).on('click', '.back-to-list-btn', function() {
        loadSurveysList();
    });
    
    // Cancel edit button
    $(document).on('click', '.cancel-btn', function() {
        loadSurveysList();
    });
    
    // Load survey for editing
    function loadSurveyForEdit(surveyId) {
        console.log('loadSurveyForEdit called with surveyId:', surveyId);
        var container = $('.surveys-list-container');
        var loadingMessage = container.find('.loading-message');
        var surveysList = container.find('.surveys-list');
        
        loadingMessage.show().text('Cargando datos de la Carta Consulta...');
        surveysList.hide();
        
        // Get survey details from API
        $.ajax({
            url: 'https://api.bonaventurecclub.com/polls/surveys/' + surveyId,
            type: 'GET',
            success: function(survey) {
                console.log('Survey data received:', survey);
                // Load edit template via AJAX
                $.ajax({
                    url: condo360_admin_ajax.ajax_url,
                    type: 'POST',
                    data: {
                        action: 'condo360_admin_load_template',
                        template: 'admin-edit-survey',
                        nonce: condo360_admin_ajax.nonce,
                        survey: survey
                    },
                    success: function(templateResponse) {
                        console.log('Template response:', templateResponse);
                        if (templateResponse.success) {
                            surveysList.html(templateResponse.data.html);
                            loadingMessage.hide();
                            surveysList.show();
                        } else {
                            loadingMessage.text('Error al cargar la plantilla de edición: ' + templateResponse.data.message);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log('Template error:', xhr, status, error);
                        loadingMessage.text('Error al cargar la plantilla de edición: ' + error);
                    }
                });
            },
            error: function(xhr, status, error) {
                console.log('Survey fetch error:', xhr, status, error);
                loadingMessage.text('Error al cargar los datos de la Carta Consulta: ' + error);
            }
        });
    }
    
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
    
    // Load survey voters with pagination
    $('#select-survey-voters').on('change', function() {
        var surveyId = $(this).val();
        loadVotersPage(surveyId, 1);
    });
    
    // Handle pagination clicks
    $(document).on('click', '.pagination-btn', function() {
        var page = $(this).data('page');
        var surveyId = $('#select-survey-voters').val();
        
        if (page && surveyId) {
            loadVotersPage(surveyId, page);
        }
    });
    
    // Function to load voters page
    function loadVotersPage(surveyId, page) {
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
                survey_id: surveyId,
                page: page,
                limit: 10
            },
            success: function(response) {
                console.log('Condo360 Admin: Voters API response:', response);
                if (response.success) {
                    console.log('Condo360 Admin: Loading template with votersData:', response.data.votersData);
                    
                    // Validate votersData before sending
                    if (!response.data.votersData) {
                        console.error('Condo360 Admin: No votersData in response');
                        $('.voters-summary').html('<p>Error: No se recibieron datos de votantes del servidor.</p>');
                        return;
                    }
                    
                    if (!response.data.votersData.survey) {
                        console.error('Condo360 Admin: No survey data in votersData');
                        $('.voters-summary').html('<p>Error: Datos de encuesta faltantes.</p>');
                        return;
                    }
                    
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
                            console.error('Condo360 Admin: Template loading error:', xhr, status, error);
                            console.error('Condo360 Admin: Response text:', xhr.responseText);
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
    }
    
    // Download PDF
    $(document).on('click', '.download-pdf-btn', function() {
        var surveyId = $(this).data('survey-id');
        var button = $(this);
        var originalText = button.text();
        
        console.log('PDF download clicked, survey ID:', surveyId);
        
        if (!surveyId) {
            console.log('No survey ID found');
            alert('Error: No se pudo obtener el ID de la encuesta');
            return;
        }
        
        button.prop('disabled', true).text('Generando PDF...');
        
        // Create a temporary link to download the PDF
        var downloadUrl = 'https://api.bonaventurecclub.com/polls/surveys/' + surveyId + '/pdf';
        console.log('Download URL:', downloadUrl);
        
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