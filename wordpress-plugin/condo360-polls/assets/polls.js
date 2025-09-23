jQuery(document).ready(function($) {
    // Load polls when the page loads
    loadPolls();
    
    // Load poll results when the results shortcode is present
    $('.condo360-poll-results').each(function() {
        var pollId = $(this).data('poll-id');
        loadPollResults(pollId);
    });
    
    function loadPolls() {
        var container = $('#condo360-polls-container');
        var loading = container.find('.polls-loading');
        var content = container.find('.polls-content');
        
        // Check if we have the necessary data
        if (typeof condo360_polls_ajax === 'undefined') {
            loading.hide();
            container.html('<p>Error: No se pudo cargar la configuración necesaria.</p>');
            return;
        }
        
        $.ajax({
            url: condo360_polls_ajax.api_url + '/api/polls',
            method: 'GET',
            success: function(data) {
                loading.hide();
                if (data.length > 0) {
                    var pollsHtml = '<h2>Encuestas Disponibles</h2>';
                    pollsHtml += '<div class="polls-list">';
                    data.forEach(function(poll) {
                        pollsHtml += '<div class="poll-item" data-poll-id="' + poll.id + '">';
                        pollsHtml += '<h3>' + poll.title + '</h3>';
                        if (poll.description) {
                            pollsHtml += '<p>' + poll.description + '</p>';
                        }
                        pollsHtml += '<button class="select-poll-button">Seleccionar Encuesta</button>';
                        pollsHtml += '</div>';
                    });
                    pollsHtml += '</div>';
                    pollsHtml += '<div class="poll-details" style="display: none;"></div>';
                    content.html(pollsHtml).show();
                } else {
                    content.html('<p>No hay encuestas disponibles.</p>').show();
                }
            },
            error: function(xhr, status, error) {
                loading.hide();
                container.html('<p>Error al cargar las encuestas: ' + error + '</p>');
            }
        });
    }
    
    // Handle poll selection
    $(document).on('click', '.select-poll-button', function() {
        var pollItem = $(this).closest('.poll-item');
        var pollId = pollItem.data('poll-id');
        var pollsList = $('.polls-list');
        var pollDetails = $('.poll-details');
        
        // Hide the polls list and show loading
        pollsList.hide();
        pollDetails.html('<p>Cargando detalles de la encuesta...</p>').show();
        
        // Load poll details
        $.ajax({
            url: condo360_polls_ajax.api_url + '/api/polls/' + pollId,
            method: 'GET',
            success: function(data) {
                var pollHtml = '<h2>' + data.title + '</h2>';
                if (data.description) {
                    pollHtml += '<p>' + data.description + '</p>';
                }
                pollHtml += '<button class="back-to-polls">&larr; Volver a la lista de encuestas</button>';
                pollHtml += '<div class="poll-questions">';
                
                data.questions.forEach(function(question) {
                    pollHtml += '<div class="poll-question" data-question-id="' + question.id + '">';
                    pollHtml += '<h3>' + question.text + '</h3>';
                    pollHtml += '<form class="poll-question-form">';
                    pollHtml += '<input type="hidden" name="poll_id" value="' + data.id + '">';
                    pollHtml += '<input type="hidden" name="question_id" value="' + question.id + '">';
                    question.options.forEach(function(option, index) {
                        pollHtml += '<div class="poll-option">';
                        pollHtml += '<input type="radio" name="option" id="option-' + question.id + '-' + index + '" value="' + option + '">';
                        pollHtml += '<label for="option-' + question.id + '-' + index + '">' + option + '</label>';
                        pollHtml += '</div>';
                    });
                    pollHtml += '<button type="submit" class="poll-vote-button">Votar</button>';
                    pollHtml += '</form>';
                    pollHtml += '<div class="poll-message" style="display: none;"></div>';
                    pollHtml += '</div>';
                });
                
                pollHtml += '</div>';
                pollDetails.html(pollHtml);
            },
            error: function(xhr, status, error) {
                pollDetails.html('<p>Error al cargar los detalles de la encuesta: ' + error + '</p>');
            }
        });
    });
    
    // Handle back to polls list
    $(document).on('click', '.back-to-polls', function() {
        $('.polls-list').show();
        $('.poll-details').hide().html('');
    });
    
    function loadPollResults(pollId) {
        var resultsContainer = $('.condo360-poll-results[data-poll-id="' + pollId + '"]');
        var loading = resultsContainer.find('.poll-results-loading');
        var content = resultsContainer.find('.poll-results-content');
        
        // Check if we have the necessary data
        if (typeof condo360_polls_ajax === 'undefined') {
            loading.hide();
            content.html('<p>Error: No se pudo cargar la configuración necesaria.</p>').show();
            return;
        }
        
        $.ajax({
            url: condo360_polls_ajax.api_url + '/api/polls/' + pollId + '/results',
            method: 'GET',
            success: function(data) {
                loading.hide();
                var resultsHtml = '<h2>' + data.poll.title + '</h2>';
                if (data.poll.description) {
                    resultsHtml += '<p>' + data.poll.description + '</p>';
                }
                
                resultsHtml += '<div class="poll-results-container">';
                var totalVotes = data.total_votes;
                
                for (var questionId in data.results) {
                    var questionData = data.results[questionId];
                    resultsHtml += '<div class="poll-result-item">';
                    resultsHtml += '<h3>' + questionData.question + '</h3>';
                    resultsHtml += '<div class="poll-result-options">';
                    
                    for (var option in questionData.options) {
                        var votes = questionData.options[option];
                        var percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : 0;
                        resultsHtml += '<div class="poll-result-option">';
                        resultsHtml += '<div class="poll-result-label">' + option + '</div>';
                        resultsHtml += '<div class="poll-result-bar">';
                        resultsHtml += '<div class="poll-result-bar-fill" style="width: ' + percentage + '%"></div>';
                        resultsHtml += '</div>';
                        resultsHtml += '<div class="poll-result-count">' + votes + ' votos (' + percentage + '%)</div>';
                        resultsHtml += '</div>';
                    }
                    
                    resultsHtml += '</div>'; // .poll-result-options
                    resultsHtml += '</div>'; // .poll-result-item
                }
                
                resultsHtml += '<div class="poll-total-votes">Total de votos: ' + totalVotes + '</div>';
                resultsHtml += '</div>'; // .poll-results-container
                content.html(resultsHtml).show();
            },
            error: function(xhr, status, error) {
                loading.hide();
                content.html('<p>Error al cargar los resultados: ' + error + '</p>').show();
            }
        });
    }
    
    // Handle poll voting
    $(document).on('submit', '.poll-question-form', function(e) {
        e.preventDefault();
        var form = $(this);
        var pollId = form.find('input[name="poll_id"]').val();
        var questionId = form.find('input[name="question_id"]').val();
        var selectedOption = form.find('input[name="option"]:checked');
        var messageDiv = form.siblings('.poll-message');
        
        if (selectedOption.length === 0) {
            messageDiv.html('<p class="error">Por favor selecciona una opción.</p>').show();
            return;
        }
        
        var selectedOptionValue = selectedOption.val();
        var currentUserId = condo360_polls_ajax.current_user_id;
        
        // Disable the vote button to prevent double voting
        form.find('.poll-vote-button').prop('disabled', true);
        messageDiv.hide();
        
        // Check if we have the necessary data
        if (typeof condo360_polls_ajax === 'undefined') {
            messageDiv.html('<p class="error">Error: No se pudo cargar la configuración necesaria.</p>').show();
            form.find('.poll-vote-button').prop('disabled', false);
            return;
        }
        
        $.ajax({
            url: condo360_polls_ajax.api_url + '/api/polls/' + pollId + '/vote',
            method: 'POST',
            headers: {
                'X-WordPress-User-ID': currentUserId
            },
            contentType: 'application/json',
            data: JSON.stringify({
                questionId: parseInt(questionId),
                answer: selectedOptionValue
            }),
            success: function(data) {
                messageDiv.html('<p class="success">¡Gracias por participar!</p>').show();
                form.hide();
                
                // Optionally load results
                // loadPollResults(pollId);
            },
            error: function(xhr, status, error) {
                var errorMessage = 'Error al registrar el voto.';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                messageDiv.html('<p class="error">' + errorMessage + '</p>').show();
                form.find('.poll-vote-button').prop('disabled', false);
            }
        });
    });
});