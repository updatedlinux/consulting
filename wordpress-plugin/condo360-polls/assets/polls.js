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