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
                    var pollsHtml = '';
                    data.forEach(function(poll) {
                        pollsHtml += '<div class="poll" data-poll-id="' + poll.id + '">';
                        pollsHtml += '<h3>' + poll.question + '</h3>';
                        pollsHtml += '<form class="poll-form">';
                        pollsHtml += '<input type="hidden" name="poll_id" value="' + poll.id + '">';
                        poll.options.forEach(function(option, index) {
                            pollsHtml += '<div class="poll-option">';
                            pollsHtml += '<input type="radio" name="option" id="option-' + poll.id + '-' + index + '" value="' + index + '">';
                            pollsHtml += '<label for="option-' + poll.id + '-' + index + '">' + option + '</label>';
                            pollsHtml += '</div>';
                        });
                        pollsHtml += '<button type="submit" class="poll-vote-button">Votar</button>';
                        pollsHtml += '</form>';
                        pollsHtml += '<div class="poll-message" style="display: none;"></div>';
                        pollsHtml += '<div class="poll-results" style="display: none;"></div>';
                        pollsHtml += '</div>';
                    });
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
                var resultsHtml = '<h3>' + data.poll.question + '</h3>';
                resultsHtml += '<div class="poll-results-chart">';
                var totalVotes = data.total_votes;
                for (var option in data.results) {
                    var votes = data.results[option];
                    var percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : 0;
                    resultsHtml += '<div class="poll-result-item">';
                    resultsHtml += '<div class="poll-result-label">' + option + '</div>';
                    resultsHtml += '<div class="poll-result-bar">';
                    resultsHtml += '<div class="poll-result-bar-fill" style="width: ' + percentage + '%"></div>';
                    resultsHtml += '</div>';
                    resultsHtml += '<div class="poll-result-count">' + votes + ' votos (' + percentage + '%)</div>';
                    resultsHtml += '</div>';
                }
                resultsHtml += '<div class="poll-total-votes">Total de votos: ' + totalVotes + '</div>';
                resultsHtml += '</div>';
                content.html(resultsHtml).show();
            },
            error: function(xhr, status, error) {
                loading.hide();
                content.html('<p>Error al cargar los resultados: ' + error + '</p>').show();
            }
        });
    }
    
    // Handle poll voting
    $(document).on('submit', '.poll-form', function(e) {
        e.preventDefault();
        var form = $(this);
        var pollId = form.find('input[name="poll_id"]').val();
        var selectedOption = form.find('input[name="option"]:checked');
        var messageDiv = form.siblings('.poll-message');
        var resultsDiv = form.siblings('.poll-results');
        
        if (selectedOption.length === 0) {
            messageDiv.html('<p class="error">Por favor selecciona una opción.</p>').show();
            return;
        }
        
        var selectedOptionIndex = selectedOption.val();
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
                optionIndex: parseInt(selectedOptionIndex)
            }),
            success: function(data) {
                messageDiv.html('<p class="success">¡Gracias por participar!</p>').show();
                form.hide();
                
                // Optionally load results
                loadPollResults(pollId);
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