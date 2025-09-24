<div class="admin-section">
    <h3>Ver Resultados</h3>
    <div class="form-group">
        <label for="select-survey-results">Seleccione una Carta Consulta:</label>
        <select id="select-survey-results" class="form-control">
            <option value="">Cargando Cartas Consulta...</option>
        </select>
    </div>
    
    <div class="results-container" style="display: none;">
        <div class="survey-results">
            <!-- Results will be loaded here -->
        </div>
    </div>
    
    <div id="results-message" class="admin-message" style="display: none;"></div>
</div>

<script>
// Load all surveys for results dropdown
function loadSurveysForResults() {
    var select = $('#select-survey-results');
    select.html('<option value="">Cargando Cartas Consulta...</option>');
    
    $.ajax({
        url: condo360_admin_ajax.ajax_url,
        type: 'POST',
        data: {
            action: 'condo360_admin_get_surveys',
            nonce: condo360_admin_ajax.nonce
        },
        success: function(response) {
            if (response.success) {
                var options = '<option value="">Seleccione una Carta Consulta</option>';
                // Show all surveys (both open and closed) for results
                $.each(response.data.surveys, function(index, survey) {
                    var statusText = survey.status === 'open' ? ' (Activa)' : ' (Cerrada)';
                    options += `<option value="${survey.id}">${survey.title}${statusText}</option>`;
                });
                select.html(options);
            } else {
                select.html('<option value="">Error al cargar las Cartas Consulta: ' + response.data.message + '</option>');
            }
        },
        error: function(xhr, status, error) {
            select.html('<option value="">Error de conexión: ' + error + '</option>');
        }
    });
}

// Initialize results dropdown when results tab is shown
$('#survey-results-tab').on('show', function() {
    loadSurveysForResults();
});
</script>