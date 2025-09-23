const SurveyModel = require('../models/SurveyModel');

class SurveyController {
  // Create a new survey
  static async createSurvey(req, res) {
    try {
      const { title, description, start_date, end_date, questions } = req.body;
      
      // Validate required fields
      if (!title || !start_date || !end_date || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, start_date, end_date, questions' 
        });
      }
      
      // Validate date logic
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate >= endDate) {
        return res.status(400).json({ 
          error: 'End date must be after start date' 
        });
      }
      
      // Validate questions structure
      for (const [index, question] of questions.entries()) {
        if (!question.question_text || !question.options || !Array.isArray(question.options)) {
          return res.status(400).json({ 
            error: `Question ${index + 1} missing required fields: question_text, options` 
          });
        }
        
        if (question.options.length === 0) {
          return res.status(400).json({ 
            error: `Question ${index + 1} must have at least one option` 
          });
        }
        
        for (const [optIndex, option] of question.options.entries()) {
          if (!option.option_text) {
            return res.status(400).json({ 
              error: `Question ${index + 1}, Option ${optIndex + 1} missing option_text` 
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
        message: 'Survey created successfully', 
        survey_id: surveyId 
      });
    } catch (error) {
      console.error('Error creating survey:', error);
      res.status(500).json({ error: 'Failed to create survey' });
    }
  }
  
  // Get all active surveys
  static async getActiveSurveys(req, res) {
    try {
      const surveys = await SurveyModel.getActiveSurveys();
      res.status(200).json(surveys);
    } catch (error) {
      console.error('Error fetching active surveys:', error);
      res.status(500).json({ error: 'Failed to fetch surveys' });
    }
  }
  
  // Get survey by ID
  static async getSurveyById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid survey ID' });
      }
      
      const survey = await SurveyModel.getSurveyById(id);
      
      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }
      
      res.status(200).json(survey);
    } catch (error) {
      console.error('Error fetching survey:', error);
      res.status(500).json({ error: 'Failed to fetch survey' });
    }
  }
  
  // Vote in a survey
  static async voteInSurvey(req, res) {
    try {
      const { id } = req.params;
      const { wp_user_id, responses } = req.body;
      
      // Validate input
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid survey ID' });
      }
      
      if (!wp_user_id || isNaN(wp_user_id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      if (!responses || !Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({ error: 'Responses are required' });
      }
      
      // Get survey to validate
      const survey = await SurveyModel.getSurveyById(id);
      
      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }
      
      // Check if survey is active
      const now = new Date();
      if (survey.status !== 'open' || 
          new Date(survey.start_date) > now || 
          new Date(survey.end_date) < now) {
        return res.status(400).json({ error: 'Survey is not active' });
      }
      
      // Check if user has already participated
      const hasParticipated = await SurveyModel.hasUserParticipated(id, wp_user_id);
      if (hasParticipated) {
        return res.status(400).json({ error: 'User has already participated in this survey' });
      }
      
      // Validate all questions are answered
      const surveyQuestionIds = survey.questions.map(q => q.id);
      const responseQuestionIds = responses.map(r => r.question_id);
      
      // Check if all survey questions are answered
      const unansweredQuestions = surveyQuestionIds.filter(
        qId => !responseQuestionIds.includes(qId)
      );
      
      if (unansweredQuestions.length > 0) {
        return res.status(400).json({ 
          error: 'All questions must be answered',
          unanswered_questions: unansweredQuestions
        });
      }
      
      // Check if there are any extra questions in response
      const extraQuestions = responseQuestionIds.filter(
        rId => !surveyQuestionIds.includes(rId)
      );
      
      if (extraQuestions.length > 0) {
        return res.status(400).json({ 
          error: 'Invalid question IDs in response',
          invalid_questions: extraQuestions
        });
      }
      
      // Validate each response
      for (const response of responses) {
        if (!response.question_id || !response.option_id) {
          return res.status(400).json({ 
            error: 'Each response must include question_id and option_id' 
          });
        }
        
        // Check if question belongs to this survey
        const question = survey.questions.find(q => q.id == response.question_id);
        if (!question) {
          return res.status(400).json({ 
            error: `Question ${response.question_id} does not belong to this survey` 
          });
        }
        
        // Check if option is valid for this question
        const option = question.options.find(o => o.id == response.option_id);
        if (!option) {
          return res.status(400).json({ 
            error: `Option ${response.option_id} is not valid for question ${response.question_id}` 
          });
        }
      }
      
      // Record the vote
      await SurveyModel.recordVote(id, wp_user_id, responses);
      
      res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (error) {
      console.error('Error recording vote:', error);
      if (error.message === 'User has already participated in this survey') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to record vote' });
    }
  }
  
  // Get survey results
  static async getSurveyResults(req, res) {
    try {
      const { id } = req.params;
      const isAdmin = req.query.admin === 'true'; // Simple admin check for now
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid survey ID' });
      }
      
      const results = await SurveyModel.getSurveyResults(id, isAdmin);
      res.status(200).json(results);
    } catch (error) {
      console.error('Error fetching survey results:', error);
      if (error.message === 'Results are not available for this survey yet') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Survey not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to fetch survey results' });
    }
  }
  
  // Close a survey
  static async closeSurvey(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid survey ID' });
      }
      
      const success = await SurveyModel.closeSurvey(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Survey not found' });
      }
      
      res.status(200).json({ message: 'Survey closed successfully' });
    } catch (error) {
      console.error('Error closing survey:', error);
      res.status(500).json({ error: 'Failed to close survey' });
    }
  }
  
  // Get all surveys (for admin panel)
  static async getAllSurveys(req, res) {
    try {
      const surveys = await SurveyModel.getAllSurveys();
      res.status(200).json(surveys);
    } catch (error) {
      console.error('Error fetching all surveys:', error);
      res.status(500).json({ error: 'Failed to fetch surveys' });
    }
  }
}

module.exports = SurveyController;