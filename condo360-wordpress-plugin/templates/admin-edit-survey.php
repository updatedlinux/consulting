<?php
/**
 * Edit survey template
 */
?>

<div class="edit-survey-content">
    <div class="edit-survey-header">
        <h3>Editar Carta Consulta: <?php echo esc_html($survey['title']); ?></h3>
        <button class="back-to-list-btn" type="button">
            ← Volver a la Lista
        </button>
    </div>
    
    <form id="edit-survey-form" data-survey-id="<?php echo esc_attr($survey['id']); ?>">
        <div class="form-group">
            <label for="edit-survey-title">Título de la Carta Consulta *</label>
            <input type="text" id="edit-survey-title" name="title" value="<?php echo esc_attr($survey['title']); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="edit-survey-description">Descripción *</label>
            <textarea id="edit-survey-description" name="description" rows="4" required><?php echo esc_textarea($survey['description']); ?></textarea>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label for="edit-survey-start-date">Fecha de Inicio *</label>
                <input type="date" id="edit-survey-start-date" name="start_date" value="<?php echo esc_attr(date('Y-m-d', strtotime($survey['start_date']))); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="edit-survey-end-date">Fecha de Fin *</label>
                <input type="date" id="edit-survey-end-date" name="end_date" value="<?php echo esc_attr(date('Y-m-d', strtotime($survey['end_date']))); ?>" required>
            </div>
        </div>
        
        <div class="questions-section">
            <h4>Preguntas y Opciones</h4>
            <div class="questions-container">
                <?php foreach ($survey['questions'] as $index => $question): ?>
                    <div class="question-item">
                        <div class="question-header">
                            <input type="text" class="question-text" placeholder="Texto de la pregunta" value="<?php echo esc_attr($question['question_text']); ?>" required>
                            <button type="button" class="remove-question-btn">Eliminar Pregunta</button>
                        </div>
                        
                        <div class="options-container">
                            <?php foreach ($question['options'] as $optionIndex => $option): ?>
                                <div class="option-item">
                                    <input type="text" class="option-text" placeholder="Opción <?php echo $optionIndex + 1; ?>" value="<?php echo esc_attr($option['option_text']); ?>" required>
                                    <button type="button" class="remove-option-btn">×</button>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        
                        <button type="button" class="add-option-btn">+ Agregar Opción</button>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <button type="button" class="add-question-btn">+ Agregar Pregunta</button>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="submit-btn">Actualizar Carta Consulta</button>
            <button type="button" class="cancel-btn">Cancelar</button>
        </div>
        
        <div class="edit-survey-message" id="edit-survey-message" style="display: none;"></div>
    </form>
</div>
