const SurveyModel = require('../models/SurveyModel');

// Mensajes en español
const MESSAGES = {
  MISSING_FIELDS: 'Faltan campos obligatorios: título, fecha de inicio, fecha de fin, preguntas',
  END_DATE_AFTER_START: 'La fecha de finalización debe ser posterior a la fecha de inicio',
  QUESTION_MISSING_FIELDS: 'Pregunta {index} faltan campos obligatorios: texto de la pregunta, opciones',
  QUESTION_MIN_OPTIONS: 'La pregunta {index} debe tener al menos una opción',
  OPTION_MISSING_TEXT: 'Pregunta {index}, Opción {optIndex} falta el texto de la opción',
  INVALID_SURVEY_ID: 'ID de encuesta inválido',
  SURVEY_NOT_FOUND: 'Encuesta no encontrada',
  SURVEY_NOT_ACTIVE: 'La encuesta no está activa',
  USER_ALREADY_PARTICIPATED: 'El usuario ya ha participado en esta encuesta',
  ALL_QUESTIONS_REQUIRED: 'Todas las preguntas deben ser respondidas',
  INVALID_QUESTION_IDS: 'IDs de preguntas inválidos en la respuesta',
  MISSING_RESPONSE_FIELDS: 'Cada respuesta debe incluir question_id y option_id',
  QUESTION_NOT_BELONG: 'La pregunta {questionId} no pertenece a esta encuesta',
  OPTION_NOT_VALID: 'La opción {optionId} no es válida para la pregunta {questionId}',
  FAILED_CREATE_SURVEY: 'Error al crear la encuesta',
  FAILED_FETCH_SURVEYS: 'Error al obtener las encuestas',
  FAILED_FETCH_SURVEY: 'Error al obtener la encuesta',
  FAILED_RECORD_VOTE: 'Error al registrar el voto',
  FAILED_FETCH_RESULTS: 'Error al obtener los resultados de la encuesta',
  RESULTS_NOT_AVAILABLE: 'Los resultados aún no están disponibles para esta encuesta',
  SURVEY_CLOSED_SUCCESS: 'Encuesta cerrada exitosamente',
  INVALID_SURVEY_ID_CLOSE: 'ID de encuesta inválido para cerrar'
};

class SurveyController {
  // Create a new survey
  static async createSurvey(req, res) {
    try {
      const { title, description, start_date, end_date, questions } = req.body;
      
      // Validate required fields
      if (!title || !start_date || !end_date || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ 
          error: MESSAGES.MISSING_FIELDS
        });
      }
      
      // Validate date logic
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate >= endDate) {
        return res.status(400).json({ 
          error: MESSAGES.END_DATE_AFTER_START
        });
      }
      
      // Validate questions structure
      for (const [index, question] of questions.entries()) {
        if (!question.question_text || !question.options || !Array.isArray(question.options)) {
          return res.status(400).json({ 
            error: MESSAGES.QUESTION_MISSING_FIELDS.replace('{index}', index + 1)
          });
        }
        
        if (question.options.length === 0) {
          return res.status(400).json({ 
            error: MESSAGES.QUESTION_MIN_OPTIONS.replace('{index}', index + 1)
          });
        }
        
        for (const [optIndex, option] of question.options.entries()) {
          if (!option.option_text) {
            return res.status(400).json({ 
              error: MESSAGES.OPTION_MISSING_TEXT
                .replace('{index}', index + 1)
                .replace('{optIndex}', optIndex + 1)
            });
          }
        }
      }
      
      const surveyId = await SurveyModel.createSurvey({
        title,
        description,
        start_date,
        end_date,
        questions
      });
      
      res.status(201).json({ 
        message: 'Encuesta creada exitosamente', 
        survey_id: surveyId 
      });
    } catch (error) {
      console.error('Error creating survey:', error);
      res.status(500).json({ error: MESSAGES.FAILED_CREATE_SURVEY });
    }
  }
  
  // Get all active surveys
  static async getActiveSurveys(req, res) {
    try {
      const surveys = await SurveyModel.getActiveSurveys();
      res.status(200).json(surveys);
    } catch (error) {
      console.error('Error fetching active surveys:', error);
      res.status(500).json({ error: MESSAGES.FAILED_FETCH_SURVEYS });
    }
  }
  
  // Get survey by ID
  static async getSurveyById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: MESSAGES.INVALID_SURVEY_ID });
      }
      
      const survey = await SurveyModel.getSurveyById(id);
      
      if (!survey) {
        return res.status(404).json({ error: MESSAGES.SURVEY_NOT_FOUND });
      }
      
      res.status(200).json(survey);
    } catch (error) {
      console.error('Error fetching survey:', error);
      res.status(500).json({ error: MESSAGES.FAILED_FETCH_SURVEY });
    }
  }
  
  // Vote in a survey
  static async voteInSurvey(req, res) {
    try {
      const { id } = req.params;
      const { wp_user_id, responses } = req.body;
      
      // Validate input
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: MESSAGES.INVALID_SURVEY_ID });
      }
      
      if (!wp_user_id || isNaN(wp_user_id)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
      }
      
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({ error: 'Las respuestas son obligatorias' });
      }
      
      // Get survey to validate
      const survey = await SurveyModel.getSurveyById(id);
      
      if (!survey) {
        return res.status(404).json({ error: MESSAGES.SURVEY_NOT_FOUND });
      }
      
      // Check if survey is active
      const now = new Date();
      if (survey.status !== 'open' || 
          new Date(survey.start_date) > now || 
          new Date(survey.end_date) < now) {
        return res.status(400).json({ error: MESSAGES.SURVEY_NOT_ACTIVE });
      }
      
      // Check if user has already participated
      const hasParticipated = await SurveyModel.hasUserParticipated(id, wp_user_id);
      if (hasParticipated) {
        return res.status(400).json({ error: MESSAGES.USER_ALREADY_PARTICIPATED });
      }
      
      // Validate all questions are answered
      const surveyQuestionIds = survey.questions.map(q => q.id);
      const responseQuestionIds = responses.map(r => parseInt(r.question_id));
      
      // Check if all survey questions are answered
      const unansweredQuestions = surveyQuestionIds.filter(
        qId => !responseQuestionIds.includes(qId)
      );
      
      if (unansweredQuestions.length > 0) {
        return res.status(400).json({ 
          error: MESSAGES.ALL_QUESTIONS_REQUIRED,
          unanswered_questions: unansweredQuestions
        });
      }
      
      // Check if there are any extra questions in response
      const extraQuestions = responseQuestionIds.filter(
        rId => !surveyQuestionIds.includes(rId)
      );
      
      if (extraQuestions.length > 0) {
        return res.status(400).json({ 
          error: MESSAGES.INVALID_QUESTION_IDS,
          invalid_questions: extraQuestions
        });
      }
      
      // Validate each response
      for (const response of responses) {
        if (!response.question_id || !response.option_id) {
          return res.status(400).json({ 
            error: MESSAGES.MISSING_RESPONSE_FIELDS
          });
        }
        
        // Check if question belongs to this survey
        const question = survey.questions.find(q => q.id == response.question_id);
        if (!question) {
          return res.status(400).json({ 
            error: MESSAGES.QUESTION_NOT_BELONG.replace('{questionId}', response.question_id)
          });
        }
        
        // Check if option is valid for this question
        const option = question.options.find(o => o.id == response.option_id);
        if (!option) {
          return res.status(400).json({ 
            error: MESSAGES.OPTION_NOT_VALID
              .replace('{optionId}', response.option_id)
              .replace('{questionId}', response.question_id)
          });
        }
      }
      
      // Record the vote
      await SurveyModel.recordVote(id, wp_user_id, responses);
      
      res.status(200).json({ message: 'Voto registrado exitosamente' });
    } catch (error) {
      console.error('Error recording vote:', error);
      if (error.message === MESSAGES.USER_ALREADY_PARTICIPATED) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: MESSAGES.FAILED_RECORD_VOTE });
    }
  }
  
  // Get survey results
  static async getSurveyResults(req, res) {
    try {
      const { id } = req.params;
      const isAdmin = req.query.admin === 'true'; // Simple admin check for now
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: MESSAGES.INVALID_SURVEY_ID });
      }
      
      const results = await SurveyModel.getSurveyResults(id, isAdmin);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching survey results:', error);
      if (error.message === 'Results are not available for this survey yet') {
        return res.status(400).json({ error: MESSAGES.RESULTS_NOT_AVAILABLE });
      }
      if (error.message === 'Survey not found') {
        return res.status(404).json({ error: MESSAGES.SURVEY_NOT_FOUND });
      }
      res.status(500).json({ error: MESSAGES.FAILED_FETCH_RESULTS });
    }
  }
  
  // Close a survey
  static async closeSurvey(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: MESSAGES.INVALID_SURVEY_ID_CLOSE });
      }
      
      const success = await SurveyModel.closeSurvey(id);
      
      if (!success) {
        return res.status(404).json({ error: MESSAGES.SURVEY_NOT_FOUND });
      }
      
      res.status(200).json({ message: MESSAGES.SURVEY_CLOSED_SUCCESS });
    } catch (error) {
      console.error('Error closing survey:', error);
      res.status(500).json({ error: 'Error al cerrar la encuesta' });
    }
  }
  
  // Get all surveys for admin panel
  static async getAllSurveys(req, res) {
    try {
      const surveys = await SurveyModel.getAllSurveys();
      res.status(200).json(surveys);
    } catch (error) {
      console.error('Error fetching all surveys:', error);
      res.status(500).json({ error: MESSAGES.FAILED_FETCH_SURVEYS });
    }
  }
}

module.exports = SurveyController;