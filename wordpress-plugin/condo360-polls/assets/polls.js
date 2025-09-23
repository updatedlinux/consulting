class Condo360Polls {
    constructor() {
        this.init();
    }

    init() {
        this.loadPolls();
        this.bindEvents();
    }

    loadPolls() {
        const userId = condo360_polls_ajax.current_user_id;
        if (!userId || userId === 0) {
            $('#condo360-polls-container').html('<p>Debes iniciar sesión para ver las encuestas.</p>');
            return;
        }

        // Mostrar mensaje de carga
        $('#condo360-polls-container').html('<p>Cargando encuestas...</p>');

        // Obtener encuestas abiertas
        $.ajax({
            url: `${condo360_polls_ajax.api_url}/api/polls`,
            method: 'GET',
            headers: {
                'X-WordPress-User-ID': userId
            },
            success: (polls) => {
                if (polls.length === 0) {
                    $('#condo360-polls-container').html('<p>No hay encuestas disponibles en este momento.</p>');
                    return;
                }

                // Renderizar encuestas
                this.renderPolls(polls);
            },
            error: (xhr) => {
                console.error('Error al obtener encuestas:', xhr);
                $('#condo360-polls-container').html('<p>Error al obtener encuestas. Por favor, inténtalo de nuevo más tarde.</p>');
            }
        });
    }

    renderPolls(polls) {
        let html = '<div class="condo360-polls-list">';

        polls.forEach(poll => {
            html += `
                <div class="condo360-poll" data-poll-id="${poll.id}">
                    <h3>${poll.title}</h3>
                    <p class="poll-description">${poll.description || ''}</p>
                    <p class="poll-dates">
                        Desde: ${new Date(poll.start_date).toLocaleDateString()} 
                        Hasta: ${new Date(poll.end_date).toLocaleDateString()}
                    </p>
                    <div class="poll-questions">
            `;

            poll.questions.forEach(question => {
                html += `
                    <div class="poll-question" data-question-id="${question.id}">
                        <h4>${question.text}</h4>
                        <div class="poll-options">
                `;

                question.options.forEach(option => {
                    html += `
                        <label class="poll-option">
                            <input type="radio" name="question_${question.id}" value="${option}" required>
                            ${option}
                        </label>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                    <button id="condo360-vote-btn" class="condo360-vote-btn" onclick="condo360Polls.submitVote(${poll.id})">Votar</button>
                    <div id="condo360-results-${poll.id}" class="condo360-results"></div>
                </div>
            `;
        });

        html += '</div>';
        $('#condo360-polls-container').html(html);
    }

    bindEvents() {
        // Los eventos se manejan directamente en el HTML generado
    }

    submitVote(pollId) {
        const userId = condo360_polls_ajax.current_user_id;
        if (!userId || userId === 0) {
            alert('Debes iniciar sesión para votar.');
            return;
        }

        // Obtener todas las respuestas
        const questions = $(`.condo360-poll[data-poll-id="${pollId}"] .poll-question`);
        const votePromises = [];

        questions.each((index, questionElement) => {
            const questionId = $(questionElement).data('question-id');
            const selectedOption = $(`input[name="question_${questionId}"]:checked`).val();

            if (!selectedOption) {
                alert('Por favor, selecciona una opción para cada pregunta.');
                return false; // Break the loop
            }

            // Crear una promesa para cada voto
            const votePromise = $.ajax({
                url: `${condo360_polls_ajax.api_url}/api/polls/${pollId}/vote`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WordPress-User-ID': userId
                },
                data: JSON.stringify({
                    questionId: questionId,
                    answer: selectedOption
                })
            });

            votePromises.push(votePromise);
        });

        if (votePromises.length === 0) {
            return;
        }

        // Deshabilitar botón mientras se procesa
        $('#condo360-vote-btn').prop('disabled', true).text('Procesando...');

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
    }

    loadPollResults(pollId) {
        const userId = condo360_polls_ajax.current_user_id;
        if (!userId || userId === 0) {
            return;
        }

        $.ajax({
            url: `${condo360_polls_ajax.api_url}/api/polls/${pollId}/results`,
            method: 'GET',
            headers: {
                'X-WordPress-User-ID': userId
            },
            success: (data) => {
                this.renderResults(pollId, data);
            },
            error: (xhr) => {
                console.error('Error al obtener resultados:', xhr);
                $(`#condo360-results-${pollId}`).html('<p>Error al cargar los resultados.</p>');
            }
        });
    }

    renderResults(pollId, data) {
        let html = '<h4>Resultados:</h4>';

        data.results.questions.forEach(question => {
            html += `<h5>${question.text}</h5>`;
            html += '<ul>';

            // Ordenar opciones por cantidad de votos (descendente)
            const sortedOptions = Object.entries(question.options).sort((a, b) => b[1] - a[1]);

            sortedOptions.forEach(([option, count]) => {
                const percentage = question.total_votes > 0 ? ((count / question.total_votes) * 100).toFixed(1) : 0;
                html += `<li>${option}: ${count} votos (${percentage}%)</li>`;
            });

            html += '</ul>';
        });

        html += `<p><strong>Total de votos: ${data.results.total_votes}</strong></p>`;
        $(`#condo360-results-${pollId}`).html(html);
    }
}

// Inicializar cuando el DOM esté listo
$(document).ready(() => {
    window.condo360Polls = new Condo360Polls();
});