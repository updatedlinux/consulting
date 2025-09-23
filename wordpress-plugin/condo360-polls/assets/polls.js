// Procesar todas las respuestas
            Promise.all(votePromises)
                .then(() => {
                    alert('¡Voto registrado exitosamente!');
                    this.loadPollResults(pollId);
                })
                .catch((xhr) => {
                    $('#condo360-vote-btn').prop('disabled', false).text('Votar');
                    console.error('Error al registrar voto:', xhr);
                    if (xhr.status === 409) {
                        alert('Ya has votado en esta encuesta. No puedes votar nuevamente.');
                    } else if (xhr.status === 400) {
                        alert('La encuesta no está disponible para votar.');
                    } else if (xhr.status === 404) {
                        alert('La encuesta no fue encontrada.');
                    } else {
                        alert('Error al registrar el voto. Por favor, inténtalo de nuevo.');
                    }
                });