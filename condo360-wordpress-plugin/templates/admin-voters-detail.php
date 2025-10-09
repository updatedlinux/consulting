<?php
/**
 * Voters detail template
 */
?>

<div class="voters-detail-content">
    <h3><?php echo esc_html($votersData['survey']['title']); ?></h3>
    
    <?php if (!empty($votersData['survey']['description'])): ?>
        <p class="survey-description"><?php echo esc_html($votersData['survey']['description']); ?></p>
    <?php endif; ?>
    
    <div class="survey-info-section">
        <h4>Estatus de la Carta</h4>
        <p><strong>Estado:</strong> <?php echo $votersData['survey']['status'] === 'open' ? 'Activa' : 'Cerrada'; ?></p>
        
        <h4>Fecha de Inicio y Fin</h4>
        <p>
            <strong>Inicio:</strong> <?php echo date_i18n(get_option('date_format'), strtotime($votersData['survey']['start_date'])); ?><br>
            <strong>Fin:</strong> <?php echo date_i18n(get_option('date_format'), strtotime($votersData['survey']['end_date'])); ?>
        </p>
    </div>
    
    <div class="participation-stats-section">
        <h4>Estadísticas de Participación</h4>
        
        <div class="stats-display">
            <div class="stat-row">
                <span class="stat-label">Propietarios Habilitados:</span>
                <span class="stat-value"><?php echo esc_html($votersData['statistics']['total_eligible_voters']); ?></span>
            </div>
            
            <div class="stat-row">
                <span class="stat-label">Votos Recibidos:</span>
                <span class="stat-value"><?php echo esc_html($votersData['statistics']['actual_voters']); ?></span>
            </div>
            
            <div class="stat-row">
                <span class="stat-label">Porcentaje de Participación:</span>
                <span class="stat-value"><?php echo esc_html($votersData['statistics']['participation_percentage']); ?>%</span>
            </div>
        </div>
        
        <div class="participation-bar-section">
            <h5>Barra de Participación:</h5>
            <div class="participation-bar-container">
                <div class="participation-bar">
                    <div class="participation-bar-fill" style="width: <?php echo esc_attr($votersData['statistics']['participation_percentage']); ?>%"></div>
                </div>
                <div class="participation-percentage-text"><?php echo esc_html($votersData['statistics']['participation_percentage']); ?>%</div>
            </div>
        </div>
    </div>
    
    <div class="voters-list-section">
        <h4>Lista de Votantes (<?php echo count($votersData['voters']); ?> de <?php echo $votersData['pagination']['total_voters']; ?> propietarios)</h4>
        
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
            
            <!-- Pagination -->
            <?php if ($votersData['pagination']['total_pages'] > 1): ?>
                <div class="voters-pagination">
                    <div class="pagination-info">
                        Mostrando <?php echo (($votersData['pagination']['current_page'] - 1) * $votersData['pagination']['per_page']) + 1; ?> 
                        a <?php echo min($votersData['pagination']['current_page'] * $votersData['pagination']['per_page'], $votersData['pagination']['total_voters']); ?> 
                        de <?php echo $votersData['pagination']['total_voters']; ?> votantes
                    </div>
                    
                    <div class="pagination-controls">
                        <?php if ($votersData['pagination']['current_page'] > 1): ?>
                            <button class="pagination-btn" data-page="<?php echo $votersData['pagination']['current_page'] - 1; ?>">
                                ← Anterior
                            </button>
                        <?php endif; ?>
                        
                        <div class="pagination-numbers">
                            <?php
                            $currentPage = $votersData['pagination']['current_page'];
                            $totalPages = $votersData['pagination']['total_pages'];
                            $startPage = max(1, $currentPage - 2);
                            $endPage = min($totalPages, $currentPage + 2);
                            
                            for ($i = $startPage; $i <= $endPage; $i++):
                            ?>
                                <button class="pagination-btn <?php echo $i === $currentPage ? 'active' : ''; ?>" 
                                        data-page="<?php echo $i; ?>">
                                    <?php echo $i; ?>
                                </button>
                            <?php endfor; ?>
                        </div>
                        
                        <?php if ($votersData['pagination']['current_page'] < $votersData['pagination']['total_pages']): ?>
                            <button class="pagination-btn" data-page="<?php echo $votersData['pagination']['current_page'] + 1; ?>">
                                Siguiente →
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</div>
