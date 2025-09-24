<?php
/**
 * Surveys list template
 */
?>

<div class="surveys-list-content">
    <?php foreach ($surveys as $survey): ?>
        <div class="survey-item-admin">
            <div class="survey-header">
                <h4><?php echo esc_html($survey['title']); ?></h4>
                <span class="survey-status <?php echo esc_attr($survey['status']); ?>">
                    <?php echo $survey['status'] === 'active' ? 'Activa' : 'Cerrada'; ?>
                </span>
            </div>
            
            <?php if (!empty($survey['description'])): ?>
                <p class="survey-description"><?php echo esc_html($survey['description']); ?></p>
            <?php endif; ?>
            
            <div class="survey-dates">
                <?php 
                $start_date = date_i18n(get_option('date_format'), strtotime($survey['start_date']));
                $end_date = date_i18n(get_option('date_format'), strtotime($survey['end_date']));
                printf('Disponible desde %s hasta %s', $start_date, $end_date);
                ?>
            </div>
            
            <div class="survey-actions">
                <?php if ($survey['status'] === 'active'): ?>
                    <button class="close-survey-btn" data-survey-id="<?php echo esc_attr($survey['id']); ?>">
                        Cerrar Carta Consulta
                    </button>
                <?php else: ?>
                    <span class="closed-label">Carta Consulta Cerrada</span>
                <?php endif; ?>
            </div>
        </div>
    <?php endforeach; ?>
</div>