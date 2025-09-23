jQuery(document).ready(function($) {
    // Usar los datos proporcionados por wp_localize_script
    const condo360 = {
        apiBaseUrl: condo360_polls_ajax.api_url + '/api',
        userId: condo360_polls_ajax.current_user_id,
        
        init: function() {
            this.loadPollList();
            this.bindEvents();
        },
        
        bindEvents: function() {
            $('#condo360-poll-list').on('click', '.condo360-poll-item', function() {
                const pollId = $(this).data('poll-id');
                condo360.loadPollDetails(pollId);
            });
            
            $('#condo360-poll-details').on('click', '#condo360-back-to-list', function() {
                condo360.loadPollList();
            });
        },
        
        loadPollList: function() {
            // Mostrar mensaje de carga
            $('#condo360-poll-list').html('<p>Cargando encuestas...</p>');
            
            $.get(`${this.apiBaseUrl}/polls`)
                .done((data) => {
                    this.renderPollList(data);
                })
                .fail((xhr) => {
                    console.error('Error al cargar encuestas:', xhr);
                    $('#condo360-poll-list').html('<p>Error al cargar la lista de encuestas. Por favor, inténtalo de nuevo más tarde.</p>');
                });
        },
        
        renderPollList: function(polls) {
            const $container = $('#condo360-poll-list');
            $container.empty();
            
            if (polls.length === 0) {
                $container.html('<p>No hay encuestas disponibles en este momento.</p>');
                return;
            }
            
            const title = '<h2>Encuestas Disponibles</h2>';
            const list = polls.map(poll => `
                <div class="condo360-poll-item" data-poll-id="${poll.id}">
                    <h3>${poll.title}</h3>
                    <p>${poll.description || 'Sin descripción'}</p>
                    <small>Publicado: ${new Date(poll.created_at).toLocaleDateString()}</small>
                </div>
            `).join('');
            
            $container.html(title + list);
        },
        
        loadPollDetails: function(pollId) {
            // Mostrar mensaje de carga
            $('#condo360-poll-details').html('<p>Cargando detalles de la encuesta...</p>');
            
            $.get(`${this.apiBaseUrl}/polls/${pollId}`)
                .done((data) => {
                    this.renderPollDetails(data);
                })
                .fail((xhr) => {
                    console.error('Error al cargar detalles de encuesta:', xhr);
                    $('#condo360-poll-details').html('<p>Error al cargar los detalles de la encuesta. Por favor, inténtalo de nuevo más tarde.</p>');
                });
        },
        
        renderPollDetails: function(poll) {
            const $container = $('#condo360-poll-details');
            $container.empty();
            
            // Agregar botón para volver a la lista
            const backButton = '<button id="condo360-back-to-list" class="condo360-btn condo360-btn-secondary">← Volver a la lista de encuestas</button>';
            
            // Título y descripción de la encuesta
            const header = `
                <h2>${poll.title}</h2>
                <p>${poll.description || 'Sin descripción'}</p>
            `;
            
            // Generar preguntas con opciones
            let questionsHtml = '';
            const answers = {};
            
            poll.questions.forEach((question, index) => {
                // Verificar si las opciones son un array o un objeto
                let optionsArray = [];
                if (Array.isArray(question.options)) {
                    optionsArray = question.options;
                } else if (typeof question.options === 'object' && question.options !== null) {
                    // Si es un objeto, convertirlo a array
                    optionsArray = Object.values(question.options);
                } else if (typeof question.options === 'string') {
                    // Si es una cadena, dividirla por comas
                    optionsArray = question.options.split(',').map(opt => opt.trim());
                } else {
                    // Si no es ninguno de los anteriores, crear array vacío
                    optionsArray = [];
                }
                
                const optionsHtml = optionsArray.map((option, optionIndex) => `
                    <label class="condo360-option">
                        <input type="radio" name="question-${question.id}" value="${option}" data-question-id="${question.id}">
                        ${option}
                    </label>
                `).join('');
                
                questionsHtml += `
                    <div class="condo360-question" data-question-id="${question.id}">
                        <h3>${question.text}</h3>
                        <div class="condo360-options">
                            ${optionsHtml}
                        </div>
                    </div>
                `;
                
                // Inicializar objeto de respuestas
                answers[question.id] = null;
            });
            
            // Botón de votar único
            const voteButton = '<button id="condo360-vote-btn" class="condo360-btn condo360-btn-primary" disabled>Votar</button>';
            
            $container.html(backButton + header + questionsHtml + voteButton);
            
            // Almacenar datos de la encuesta
            $container.data('poll-id', poll.id);
            $container.data('answers', answers);
            
            // Vincular eventos para las opciones de respuesta
            this.bindVoteEvents();
        },
        
        bindVoteEvents: function() {
            const $container = $('#condo360-poll-details');
            
            // Evento para las opciones de respuesta
            $container.on('change', 'input[type="radio"]', function() {
                const questionId = $(this).data('question-id');
                const answer = $(this).val();
                
                // Actualizar respuestas almacenadas
                const answers = $container.data('answers') || {};
                answers[questionId] = answer;
                $container.data('answers', answers);
                
                // Verificar si todas las preguntas tienen respuesta
                condo360.checkAllQuestionsAnswered();
            });
            
            // Evento para el botón de votar
            $container.on('click', '#condo360-vote-btn', function() {
                condo360.submitVote();
            });
        },
        
        checkAllQuestionsAnswered: function() {
            const $container = $('#condo360-poll-details');
            const answers = $container.data('answers') || {};
            const allAnswered = Object.values(answers).every(answer => answer !== null);
            
            // Habilitar o deshabilitar el botón de votar
            $('#condo360-vote-btn').prop('disabled', !allAnswered);
        },
        
        submitVote: function() {
            const $container = $('#condo360-poll-details');
            const pollId = $container.data('poll-id');
            const answers = $container.data('answers') || {};
            
            // Verificar que todas las preguntas tengan respuesta
            const unanswered = Object.entries(answers).filter(([questionId, answer]) => answer === null);
            if (unanswered.length > 0) {
                alert('Por favor responde todas las preguntas antes de votar.');
                return;
            }
            
            // Enviar votos para cada pregunta
            const votePromises = Object.entries(answers).map(([questionId, answer]) => {
                return $.ajax({
                    url: `${this.apiBaseUrl}/polls/${pollId}/vote`,
                    method: 'POST',
                    headers: {
                        'X-WordPress-User-ID': this.userId
                    },
                    contentType: 'application/json',
                    data: JSON.stringify({
                        questionId: questionId,
                        answer: answer
                    })
                });
            });
            
            // Mostrar mensaje de procesamiento
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
                        alert('Ya has votado en esta encuesta.');
                    } else {
                        alert('Error al registrar el voto. Por favor, inténtalo de nuevo.');
                    }
                });
        },
        
        loadPollResults: function(pollId) {
            // Mostrar mensaje de carga
            $('#condo360-poll-details').html('<p>Cargando resultados de la encuesta...</p>');
            
            $.get(`${this.apiBaseUrl}/polls/${pollId}/results`)
                .done((data) => {
                    this.renderPollResults(data);
                })
                .fail((xhr) => {
                    console.error('Error al cargar resultados:', xhr);
                    $('#condo360-poll-details').html('<p>Error al cargar los resultados de la encuesta. Por favor, inténtalo de nuevo más tarde.</p>');
                });
        },
        
        renderPollResults: function(results) {
            const $container = $('#condo360-poll-details');
            $container.empty();
            
            // Botón para volver a la lista
            const backButton = '<button id="condo360-back-to-list" class="condo360-btn condo360-btn-secondary">← Volver a la lista de encuestas</button>';
            
            // Título de los resultados
            const header = `<h2>Resultados: ${results.poll.title}</h2>`;
            
            // Mostrar resultados por pregunta
            let resultsHtml = '';
            Object.entries(results.results).forEach(([questionId, questionData]) => {
                let optionsHtml = '';
                Object.entries(questionData.options).forEach(([option, count]) => {
                    const percentage = questionData.total > 0 ? (count / questionData.total * 100).toFixed(1) : 0;
                    optionsHtml += `
                        <div class="condo360-result-option">
                            <span class="condo360-option-text">${option}</span>
                            <div class="condo360-progress-bar">
                                <div class="condo360-progress" style="width: ${percentage}%"></div>
                            </div>
                            <span class="condo360-vote-count">${count} votos (${percentage}%)</span>
                        </div>
                    `;
                });
                
                resultsHtml += `
                    <div class="condo360-result-question">
                        <h3>${questionData.question}</h3>
                        <div class="condo360-result-options">
                            ${optionsHtml}
                        </div>
                        <p class="condo360-total-votes">Total de votos: ${questionData.total}</p>
                    </div>
                `;
            });
            
            $container.html(backButton + header + resultsHtml);
        }
    };
    
    // Inicializar cuando el DOM esté listo
    condo360.init();
});