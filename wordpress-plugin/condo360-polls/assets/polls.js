jQuery(document).ready(function($) {
    // Load polls on page load
    loadPolls();
    
    // Load results for result shortcodes
    $('.condo360-poll-results').each(function() {
        var pollId = $(this).data('poll-id');
        loadPollResults(pollId);
    });
    
    // Function to load polls
    function loadPolls() {
        $.ajax({
            url: condo360_polls_ajax.api_url + '/api/polls',
            method: 'GET',
            success: function(data) {
                renderPolls(data);
            },
            error: function(xhr, status, error) {
                $('#condo360-polls-container .polls-loading').hide();
                $('#condo360-polls-container .polls-content').html('<p>Error al cargar las encuestas.</p>').show();
            }
        });
    }
    
    // Function to render polls
    function renderPolls(polls) {
        var container = $('#condo360-polls-container .polls-content');
        var loading = $('#condo360-polls-container .polls-loading');
        
        if (polls.length === 0) {
            loading.hide();
            container.html('<p>No hay encuestas disponibles actualmente.</p>').show();
            return;
        }
        
        var html = '';
        
        polls.forEach(function(poll) {
            html += '<div class="poll-item" data-poll-id="' + poll.id + '">';
            html += '<h3>' + poll.question + '</h3>';
            html += '<form class="poll-form">';
            
            poll.options.forEach(function(option, index) {
                html += '<div class="poll-option">';
                html += '<label>';
                html += '<input type="radio" name="poll_' + poll.id + '" value="' + index + '"> ';
                html += option;
                html += '</label>';
                html += '</div>';
            });
            
            html += '<input type="hidden" name="poll_id" value="' + poll.id + '">';
            html += '<button type="submit" class="poll-vote-button">Votar</button>';
            html += '</form>';
            html += '<div class="poll-message" style="display: none;"></div>';
            html += '</div>';
        });
        
        loading.hide();
        container.html(html).show();
    }
    
    // Handle poll form submission
    $(document).on('submit', '.poll-form', function(e) {
        e.preventDefault();
        
        var form = $(this);
        var pollId = form.find('input[name="poll_id"]').val();
        var selectedOptionIndex = form.find('input[name="poll_' + pollId + '"]:checked').val();
        var messageDiv = form.siblings('.poll-message');
        
        // Get current user ID from the global variable
        var currentUserId = typeof condo360_current_user_id !== 'undefined' ? condo360_current_user_id : 0;
        
        if (selectedOptionIndex === undefined) {
            messageDiv.html('<p class="error">Por favor selecciona una opción.</p>').show();
            return;
        }
        
        if (!currentUserId) {
            messageDiv.html('<p class="error">Debes iniciar sesión para votar.</p>').show();
            return;
        }
        
        // Disable submit button
        form.find('.poll-vote-button').prop('disabled', true);
        
        $.ajax({
            url: condo360_polls_ajax.api_url + '/api/polls/' + pollId + '/vote',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userId: currentUserId,
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
    
    // Function to load poll results
    function loadPollResults(pollId) {
        var container = $('#condo360-poll-results-' + pollId + ' .results-content');
        var loading = $('#condo360-poll-results-' + pollId + ' .results-loading');
        
        $.ajax({
            url: condo360_polls_ajax.api_url + '/api/polls/' + pollId + '/results',
            method: 'GET',
            success: function(data) {
                renderPollResults(data, container, loading);
            },
            error: function(xhr, status, error) {
                loading.hide();
                container.html('<p>Error al cargar los resultados.</p>').show();
            }
        });
    }
    
    // Function to render poll results
    function renderPollResults(data, container, loading) {
        var html = '<h3>' + data.poll.question + '</h3>';
        html += '<div class="poll-results">';
        
        var totalVotes = data.total_votes || 0;
        
        data.options.forEach(function(option) {
            var count = option.votes || 0;
            var percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            
            html += '<div class="result-item">';
            html += '<div class="result-label">' + option.text + '</div>';
            html += '<div class="result-bar-container">';
            html += '<div class="result-bar" style="width: ' + percentage + '%;"></div>';
            html += '</div>';
            html += '<div class="result-count">' + count + ' votos (' + percentage + '%)</div>';
            html += '</div>';
        });
        
        html += '<div class="total-votes">Total de votos: ' + totalVotes + '</div>';
        html += '</div>';
        
        loading.hide();
        container.html(html).show();
    }
});