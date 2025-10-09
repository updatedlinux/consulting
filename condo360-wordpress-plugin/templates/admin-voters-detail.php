<?php
/**
 * Voters detail template
 */
?>

<div class="voters-detail-content">
    <h3>Detalle de Votantes: <?php echo esc_html($votersData['survey']['title']); ?></h3>
    
    <?php if (!empty($votersData['survey']['description'])): ?>
        <p class="survey-description"><?php echo esc_html($votersData['survey']['description']); ?></p>
    <?php endif; ?>
    
    <div class="survey-dates">
        <?php 
        $start_date = date_i18n(get_option('date_format'), strtotime($votersData['survey']['start_date']));
        $end_date = date_i18n(get_option('date_format'), strtotime($votersData['survey']['end_date']));
        printf('Disponible desde %s hasta %s', $start_date, $end_date);
        ?>
    </div>
    
    <div class="voters-summary-stats">
        <h4>Estadísticas de Participación</h4>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number"><?php echo esc_html($votersData['statistics']['total_eligible_voters']); ?></div>
                <div class="stat-label">Total Propietarios Habilitados</div>
            </div>
            <div class="stat-item">
                <div class="stat-number"><?php echo esc_html($votersData['statistics']['actual_voters']); ?></div>
                <div class="stat-label">Propietarios que Votaron</div>
            </div>
            <div class="stat-item">
                <div class="stat-number"><?php echo esc_html($votersData['statistics']['participation_percentage']); ?>%</div>
                <div class="stat-label">Porcentaje de Participación</div>
            </div>
        </div>
        
        <div class="participation-bar">
            <div class="participation-bar-fill" style="width: <?php echo esc_attr($votersData['statistics']['participation_percentage']); ?>%"></div>
        </div>
    </div>
    
    <div class="voters-list-section">
        <h4>Lista de Votantes (<?php echo count($votersData['voters']); ?> propietarios)</h4>
        
        <?php if (empty($votersData['voters'])): ?>
            <div class="no-voters-message">
                <p>No hay votantes registrados para esta Carta Consulta.</p>
            </div>
        <?php else: ?>
            <div class="voters-table-container">
                <table class="voters-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Fecha de Votación</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($votersData['voters'] as $voter): ?>
                            <tr>
                                <td><?php echo esc_html($voter['display_name'] ?: $voter['username']); ?></td>
                                <td><?php echo esc_html($voter['username']); ?></td>
                                <td><?php echo esc_html($voter['email']); ?></td>
                                <td><?php echo date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($voter['voted_at'])); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>
