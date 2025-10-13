<?php
/**
 * Admin dashboard template
 */
?>

<div class="condo360-admin-container">
    <h2>Gestión de Cartas Consulta</h2>
    
    <!-- Tabs -->
    <div class="admin-tabs-container">
        <div class="admin-tabs">
            <button class="tab-btn active" data-tab="surveys-list">Lista de Cartas Consulta</button>
            <button class="tab-btn" data-tab="create-survey">Crear Nueva Carta Consulta</button>
            <button class="tab-btn" data-tab="survey-results">Ver Resultados</button>
            <button class="tab-btn" data-tab="voters-detail">Detalle de Resultados</button>
        </div>
        <div class="tabs-gradient-left"></div>
        <div class="tabs-gradient-right"></div>
    </div>
    
    <!-- Surveys List Tab -->
    <div class="tab-content active" id="surveys-list-tab">
        <div class="admin-section">
            <h3>Cartas Consulta Activas</h3>
            <div class="admin-message" id="surveys-list-message" style="display: none;"></div>
            <div class="surveys-list-container">
                <div class="loading-message">Cargando Cartas Consulta...</div>
                <div class="surveys-list" style="display: none;">
                    <!-- Surveys will be loaded here dynamically -->
                </div>
            </div>
        </div>
    </div>
    
    <!-- Create Survey Tab -->
    <div class="tab-content" id="create-survey-tab">
        <div class="admin-section">
            <h3>Crear Nueva Carta Consulta</h3>
            <form id="create-survey-form" class="create-survey-form">
                <div class="form-group">
                    <label for="survey-title">Título de la Carta Consulta:</label>
                    <input type="text" id="survey-title" name="title" required>
                </div>
                
                <div class="form-group">
                    <label for="survey-description">Descripción:</label>
                    <textarea id="survey-description" name="description" rows="3"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="survey-start-date">Fecha de Inicio:</label>
                        <input type="date" id="survey-start-date" name="start_date" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="survey-end-date">Fecha de Fin:</label>
                        <input type="date" id="survey-end-date" name="end_date" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Preguntas:</label>
                    <div class="questions-container">
                        <div class="question-item">
                            <input type="text" class="question-text" placeholder="Texto de la pregunta" required>
                            <div class="options-container">
                                <input type="text" class="option-text" placeholder="Opción 1" required>
                                <input type="text" class="option-text" placeholder="Opción 2" required>
                            </div>
                            <button type="button" class="add-option-btn">+ Agregar Opción</button>
                        </div>
                    </div>
                    <button type="button" class="add-question-btn">+ Agregar Pregunta</button>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="submit-btn">Crear Carta Consulta</button>
                </div>
            </form>
            
            <div class="admin-message" id="create-survey-message" style="display: none;"></div>
        </div>
    </div>
    
    <!-- Survey Results Tab -->
    <div class="tab-content" id="survey-results-tab">
        <div class="admin-section">
            <h3>Ver Resultados de Cartas Consulta</h3>
            <div class="form-group">
                <label for="select-survey-results">Seleccionar Carta Consulta:</label>
                <select id="select-survey-results" name="survey_id">
                    <option value="">Cargando Cartas Consulta...</option>
                </select>
            </div>
            
            <div class="results-container" style="display: none;">
                <div class="survey-results">
                    <!-- Results will be loaded here dynamically -->
                </div>
            </div>
            
            <div class="admin-message" id="results-message" style="display: none;"></div>
        </div>
    </div>
    
    <!-- Voters Detail Tab -->
    <div class="tab-content" id="voters-detail-tab">
        <div class="admin-section">
            <h3>Detalle de Resultados - Votantes</h3>
            <div class="form-group">
                <label for="select-survey-voters">Seleccionar Carta Consulta:</label>
                <select id="select-survey-voters" name="survey_id">
                    <option value="">Cargando Cartas Consulta...</option>
                </select>
            </div>
            
            <div class="voters-container" style="display: none;">
                <div class="voters-summary">
                    <!-- Summary will be loaded here dynamically -->
                </div>
                <div class="voters-list">
                    <!-- Voters list will be loaded here dynamically -->
                </div>
            </div>
            
            <div class="admin-message" id="voters-message" style="display: none;"></div>
        </div>
    </div>
</div>