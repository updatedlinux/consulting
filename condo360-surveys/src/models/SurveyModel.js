const db = require('../config/database');

// Helper function to format date for MySQL
function formatMySQLDate(dateString) {
  // Remove milliseconds and 'Z' suffix, then replace 'T' with space
  return dateString.replace(/\.\d{3}Z$/, '').replace('T', ' ');
}

class SurveyModel {
  // Create a new survey with questions and options
  static async createSurvey(surveyData) {
    const { title, description, start_date, end_date, questions } = surveyData;
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Format dates for MySQL
      const formattedStartDate = formatMySQLDate(start_date);
      const formattedEndDate = formatMySQLDate(end_date);
      
      // Insert survey
      const [surveyResult] = await connection.execute(
        'INSERT INTO condo360_surveys (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
        [title, description, formattedStartDate, formattedEndDate]
      );
      
      const surveyId = surveyResult.insertId;
      
      // Insert questions and options
      for (const question of questions) {
        const [questionResult] = await connection.execute(
          'INSERT INTO condo360_questions (survey_id, question_text, question_order) VALUES (?, ?, ?)',
          [surveyId, question.question_text, question.question_order || 1]
        );
        
        const questionId = questionResult.insertId;
        
        // Insert options for this question
        for (const [index, option] of question.options.entries()) {
          await connection.execute(
            'INSERT INTO condo360_question_options (question_id, option_text, option_order) VALUES (?, ?, ?)',
            [questionId, option.option_text, index + 1]
          );
        }
      }
      
      await connection.commit();
      return surveyId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Get all active surveys
  static async getActiveSurveys() {
    const [surveys] = await db.execute(`
      SELECT * FROM condo360_surveys 
      WHERE status = 'open' 
      AND start_date <= NOW() 
      AND end_date >= NOW()
      ORDER BY created_at DESC
    `);
    
    // For each survey, get questions and options
    for (const survey of surveys) {
      survey.questions = await this.getQuestionsWithOptions(survey.id);
    }
    
    return surveys;
  }
  
  // Get survey by ID with questions and options
  static async getSurveyById(surveyId) {
    const [surveys] = await db.execute(
      'SELECT * FROM condo360_surveys WHERE id = ?',
      [surveyId]
    );
    
    if (surveys.length === 0) {
      return null;
    }
    
    const survey = surveys[0];
    
    // Check if survey is active
    const now = new Date();
    if (survey.status !== 'open' || 
        new Date(survey.start_date) > now || 
        new Date(survey.end_date) < now) {
      // Survey is not active, but we still return it for admin purposes
    }
    
    survey.questions = await this.getQuestionsWithOptions(surveyId);
    return survey;
  }
  
  // Get questions with options for a survey
  static async getQuestionsWithOptions(surveyId) {
    const [questions] = await db.execute(
      'SELECT * FROM condo360_questions WHERE survey_id = ? ORDER BY question_order',
      [surveyId]
    );
    
    for (const question of questions) {
      const [options] = await db.execute(
        'SELECT * FROM condo360_question_options WHERE question_id = ? ORDER BY option_order',
        [question.id]
      );
      question.options = options;
    }
    
    return questions;
  }
  
  // Record a vote for a survey
  static async recordVote(surveyId, userId, responses) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Check if user already participated
      const [existingParticipation] = await connection.execute(
        'SELECT id FROM condo360_survey_participants WHERE survey_id = ? AND wp_user_id = ?',
        [surveyId, userId]
      );
      
      if (existingParticipation.length > 0) {
        throw new Error('User has already participated in this survey');
      }
      
      // Record participation
      await connection.execute(
        'INSERT INTO condo360_survey_participants (survey_id, wp_user_id) VALUES (?, ?)',
        [surveyId, userId]
      );
      
      // Record responses
      for (const response of responses) {
        await connection.execute(
          'INSERT INTO condo360_survey_responses (survey_id, question_id, option_id, wp_user_id) VALUES (?, ?, ?, ?)',
          [surveyId, response.question_id, response.option_id, userId]
        );
      }
      
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // Get survey results
  static async getSurveyResults(surveyId, isAdmin = false) {
    // First get the survey
    const [surveys] = await db.execute(
      'SELECT * FROM condo360_surveys WHERE id = ?',
      [surveyId]
    );
    
    if (surveys.length === 0) {
      throw new Error('Survey not found');
    }
    
    const survey = surveys[0];
    
    // Check access permissions
    const now = new Date();
    const isSurveyClosed = survey.status === 'closed';
    const isSurveyExpired = new Date(survey.end_date) < now;
    
    if (!isAdmin && !isSurveyClosed && !isSurveyExpired) {
      throw new Error('Results are not available for this survey yet');
    }
    
    // Get questions with options and response counts
    const [questions] = await db.execute(
      `SELECT q.id, q.question_text, q.question_order,
              o.id as option_id, o.option_text, o.option_order,
              COUNT(sr.id) as response_count
       FROM condo360_questions q
       LEFT JOIN condo360_question_options o ON q.id = o.question_id
       LEFT JOIN condo360_survey_responses sr ON o.id = sr.option_id
       WHERE q.survey_id = ?
       GROUP BY q.id, o.id
       ORDER BY q.question_order, o.option_order`,
      [surveyId]
    );
    
    // Structure the results
    const results = {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        start_date: survey.start_date,
        end_date: survey.end_date
      },
      questions: []
    };
    
    // Group options by question
    const questionsMap = {};
    questions.forEach(row => {
      if (!questionsMap[row.id]) {
        questionsMap[row.id] = {
          id: row.id,
          question_text: row.question_text,
          question_order: row.question_order,
          options: []
        };
      }
      
      if (row.option_id) {
        questionsMap[row.id].options.push({
          id: row.option_id,
          option_text: row.option_text,
          option_order: row.option_order,
          response_count: row.response_count
        });
      }
    });
    
    results.questions = Object.values(questionsMap);
    return results;
  }
  
  // Close a survey
  static async closeSurvey(surveyId) {
    const [result] = await db.execute(
      'UPDATE condo360_surveys SET status = ? WHERE id = ?',
      ['closed', surveyId]
    );
    
    return result.affectedRows > 0;
  }
  
  // Check if user has participated in a survey
  static async hasUserParticipated(surveyId, userId) {
    const [result] = await db.execute(
      'SELECT id FROM condo360_survey_participants WHERE survey_id = ? AND wp_user_id = ?',
      [surveyId, userId]
    );
    
    return result.length > 0;
  }
  
  // Get all surveys for admin panel
  static async getAllSurveys() {
    const [surveys] = await db.execute(`
      SELECT s.*, 
             COUNT(DISTINCT sp.id) as participant_count,
             COUNT(DISTINCT q.id) as question_count
      FROM condo360_surveys s
      LEFT JOIN condo360_survey_participants sp ON s.id = sp.survey_id
      LEFT JOIN condo360_questions q ON s.id = q.survey_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    
    return surveys;
  }
  
  // Get voters details for a survey
  static async getSurveyVoters(surveyId) {
    // Get total eligible voters (WordPress subscribers)
    const [eligibleVoters] = await db.execute(`
      SELECT COUNT(*) as total_eligible
      FROM wp_users u
      INNER JOIN wp_usermeta um ON u.ID = um.user_id
      WHERE um.meta_key = 'wp_capabilities'
      AND um.meta_value LIKE '%subscriber%'
    `);
    
    // Get actual voters for this survey
    const [voters] = await db.execute(`
      SELECT u.ID, u.user_login, u.user_email, u.display_name, sp.participated_at
      FROM condo360_survey_participants sp
      INNER JOIN wp_users u ON sp.wp_user_id = u.ID
      WHERE sp.survey_id = ?
      ORDER BY sp.participated_at DESC
    `, [surveyId]);
    
    // Get survey details
    const [surveys] = await db.execute(
      'SELECT * FROM condo360_surveys WHERE id = ?',
      [surveyId]
    );
    
    if (surveys.length === 0) {
      throw new Error('Survey not found');
    }
    
    const survey = surveys[0];
    
    return {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        status: survey.status,
        start_date: survey.start_date,
        end_date: survey.end_date
      },
      statistics: {
        total_eligible_voters: eligibleVoters[0].total_eligible,
        actual_voters: voters.length,
        participation_percentage: eligibleVoters[0].total_eligible > 0 
          ? ((voters.length / eligibleVoters[0].total_eligible) * 100).toFixed(2)
          : 0
      },
      voters: voters.map(voter => ({
        id: voter.ID,
        username: voter.user_login,
        email: voter.user_email,
        display_name: voter.display_name,
        voted_at: voter.participated_at
      }))
    };
  }
}

module.exports = SurveyModel;