const pool = require('../config/database');

class Poll {
  // Create a new poll with multiple questions
  static async create(title, description, questions, startDate = null, endDate = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Create the main poll
      const [pollResult] = await connection.execute(
        'INSERT INTO condo360_polls (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
        [title, description, startDate, endDate]
      );
      
      const pollId = pollResult.insertId;
      
      // Create questions for this poll
      for (const question of questions) {
        await connection.execute(
          'INSERT INTO condo360_poll_questions (poll_id, question_text, options) VALUES (?, ?, ?)',
          [pollId, question.text, JSON.stringify(question.options)]
        );
      }
      
      await connection.commit();
      return pollId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all open polls (without questions)
  static async getOpenPolls() {
    // First, check for polls that should be closed due to end date
    await this.closeExpiredPolls();
    
    const [rows] = await pool.execute(
      `SELECT id, title, description, status, start_date, end_date, created_at 
       FROM condo360_polls 
       WHERE status = 'open' 
       AND (start_date IS NULL OR start_date <= NOW()) 
       ORDER BY created_at DESC`
    );
    
    return rows;
  }

  // Get poll by ID with all its questions
  static async getById(id) {
    // Validate that id is a number
    const pollId = parseInt(id);
    if (isNaN(pollId)) {
      return null;
    }
    
    // First, check if this poll should be closed due to end date
    await this.closeExpiredPollIfNecessary(pollId);
    
    // Get the main poll
    const [pollRows] = await pool.execute(
      'SELECT id, title, description, status, start_date, end_date, created_at FROM condo360_polls WHERE id = ?',
      [pollId]
    );
    
    if (pollRows.length === 0) return null;
    
    const poll = pollRows[0];
    
    // Get all questions for this poll
    const [questionRows] = await pool.execute(
      'SELECT id, question_text, options FROM condo360_poll_questions WHERE poll_id = ? ORDER BY id',
      [pollId]
    );
    
    const questions = questionRows.map(q => ({
      id: q.id,
      text: q.question_text,
      options: JSON.parse(q.options)
    }));
    
    return {
      ...poll,
      questions
    };
  }

  // Get all polls (for admin view)
  static async getAllPolls() {
    // First, check for polls that should be closed due to end date
    await this.closeExpiredPolls();
    
    const [rows] = await pool.execute(
      `SELECT id, title, description, status, start_date, end_date, created_at 
       FROM condo360_polls 
       ORDER BY created_at DESC`
    );
    
    return rows;
  }

  // Vote on a specific question
  static async vote(pollId, questionId, userId, answer) {
    // Validate that pollId and questionId are numbers
    const pId = parseInt(pollId);
    const qId = parseInt(questionId);
    const uId = parseInt(userId);
    
    if (isNaN(pId) || isNaN(qId) || isNaN(uId)) {
      throw new Error('Invalid poll, question, or user ID');
    }
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Check if user already voted on this question
      const [existingVotes] = await connection.execute(
        'SELECT id FROM condo360_votes WHERE wp_user_id = ? AND poll_id = ? AND question_id = ?',
        [uId, pId, qId]
      );
      
      if (existingVotes.length > 0) {
        throw new Error('User already voted on this question');
      }
      
      // Check if the poll is open
      const [pollRows] = await connection.execute(
        'SELECT status FROM condo360_polls WHERE id = ?',
        [pId]
      );
      
      if (pollRows.length === 0 || pollRows[0].status !== 'open') {
        throw new Error('Poll is not open');
      }
      
      // Record the vote
      await connection.execute(
        'INSERT INTO condo360_votes (poll_id, question_id, wp_user_id, answer) VALUES (?, ?, ?, ?)',
        [pId, qId, uId, answer]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get results for a specific poll
  static async getResults(pollId) {
    // Validate that pollId is a number
    const pId = parseInt(pollId);
    if (isNaN(pId)) {
      throw new Error('Invalid poll ID');
    }
    
    // Get the main poll
    const [pollRows] = await pool.execute(
      'SELECT id, title, description FROM condo360_polls WHERE id = ?',
      [pId]
    );
    
    if (pollRows.length === 0) {
      throw new Error('Poll not found');
    }
    
    const poll = pollRows[0];
    
    // Get all questions for this poll
    const [questionRows] = await pool.execute(
      'SELECT id, question_text, options FROM condo360_poll_questions WHERE poll_id = ? ORDER BY id',
      [pId]
    );
    
    // Get all votes for this poll
    const [voteRows] = await pool.execute(
      `SELECT question_id, answer FROM condo360_votes 
       WHERE poll_id = ?`,
      [pId]
    );
    
    // Process results for each question
    const results = {};
    let totalVotes = 0;
    
    for (const question of questionRows) {
      const questionId = question.id;
      const options = JSON.parse(question.options);
      
      // Initialize results for this question
      const questionResults = {};
      options.forEach(option => {
        questionResults[option] = 0;
      });
      
      // Count votes for this question
      const questionVotes = voteRows.filter(vote => vote.question_id === questionId);
      questionVotes.forEach(vote => {
        if (questionResults.hasOwnProperty(vote.answer)) {
          questionResults[vote.answer]++;
          totalVotes++;
        }
      });
      
      results[questionId] = {
        question: question.question_text,
        options: questionResults
      };
    }
    
    return {
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description
      },
      results,
      total_votes: totalVotes
    };
  }

  // Check if user has voted on a specific question
  static async hasUserVoted(pollId, questionId, userId) {
    // Validate that pollId, questionId, and userId are numbers
    const pId = parseInt(pollId);
    const qId = parseInt(questionId);
    const uId = parseInt(userId);
    
    if (isNaN(pId) || isNaN(qId) || isNaN(uId)) {
      return false;
    }
    
    const [rows] = await pool.execute(
      'SELECT id FROM condo360_votes WHERE wp_user_id = ? AND poll_id = ? AND question_id = ?',
      [uId, pId, qId]
    );
    
    return rows.length > 0;
  }

  // Close polls that have expired
  static async closeExpiredPolls() {
    try {
      const [result] = await pool.execute(
        `UPDATE condo360_polls 
         SET status = 'closed' 
         WHERE status = 'open' 
         AND end_date IS NOT NULL 
         AND end_date <= NOW()`
      );
      return result.affectedRows;
    } catch (error) {
      console.error('Error closing expired polls:', error);
      // Don't throw the error to avoid breaking the main functionality
      return 0;
    }
  }

  // Close a specific poll if it has expired
  static async closeExpiredPollIfNecessary(pollId) {
    // Validate that pollId is a number
    const id = parseInt(pollId);
    if (isNaN(id)) {
      return false;
    }
    
    try {
      const [result] = await pool.execute(
        `UPDATE condo360_polls 
         SET status = 'closed' 
         WHERE id = ? 
         AND status = 'open' 
         AND end_date IS NOT NULL 
         AND end_date <= NOW()`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error closing expired poll:', error);
      // Don't throw the error to avoid breaking the main functionality
      return false;
    }
  }

  // Manually close a poll
  static async closePoll(pollId) {
    // Validate that pollId is a number
    const id = parseInt(pollId);
    if (isNaN(id)) {
      throw new Error('Invalid poll ID');
    }
    
    const [result] = await pool.execute(
      'UPDATE condo360_polls SET status = ? WHERE id = ?',
      ['closed', id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Poll not found or already closed');
    }
    
    return true;
  }
}

module.exports = Poll;