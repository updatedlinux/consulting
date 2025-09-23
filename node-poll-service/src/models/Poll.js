// src/models/Poll.js
const pool = require('../config/database');

class Poll {
  // Create a new poll with multiple questions
  static async create(title, description, questions, startDate, endDate) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Create the poll
      const [pollResult] = await connection.execute(
        'INSERT INTO condo360_polls (title, description, start_date, end_date) VALUES (?, ?, ?, ?)',
        [title, description, startDate, endDate]
      );
      
      const pollId = pollResult.insertId;
      
      // Create questions
      for (const question of questions) {
        const [questionResult] = await connection.execute(
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

  // Get all open polls (without questions) - for public view
  static async getOpenPolls() {
    // First, check for polls that should be closed due to end date
    await this.closeExpiredPolls();
    
    const [rows] = await pool.execute(
      `SELECT id, title, description, status, start_date, end_date, created_at 
       FROM condo360_polls 
       WHERE status = 'open' AND (start_date IS NULL OR start_date <= NOW()) 
       ORDER BY created_at DESC`
    );
    
    return rows;
  }

  // Get poll by ID with all its questions
  static async getById(pollId) {
    // First, check if this poll should be closed due to end date
    await this.closeExpiredPolls();
    
    // Get poll info
    const [pollRows] = await pool.execute(
      `SELECT id, title, description, status, start_date, end_date, created_at 
       FROM condo360_polls 
       WHERE id = ? AND status = 'open' AND (start_date IS NULL OR start_date <= NOW())`,
      [pollId]
    );
    
    if (pollRows.length === 0) {
      throw new Error('Poll not found');
    }
    
    const poll = pollRows[0];
    
    // Get all questions for this poll
    const [questionRows] = await pool.execute(
      'SELECT id, question_text, options FROM condo360_poll_questions WHERE poll_id = ? ORDER BY id',
      [pollId]
    );
    
    // Process questions with error handling for options parsing
    const questions = questionRows.map(q => {
      let options;
      try {
        // Try to parse as JSON first
        options = JSON.parse(q.options);
      } catch (e) {
        // If parsing fails, treat as a comma-separated string or create empty array
        if (typeof q.options === 'string') {
          // If it's a comma-separated string, split it
          if (q.options.includes(',')) {
            options = q.options.split(',').map(opt => opt.trim());
          } else {
            // Otherwise, treat the whole string as a single option
            options = [q.options];
          }
        } else {
          // If it's neither JSON nor string, create empty array
          options = [];
        }
      }
      
      return {
        id: q.id,
        text: q.question_text,
        options: options
      };
    });
    
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

  // Vote on a poll question
  static async vote(pollId, questionId, userId, answer) {
    // First, check if this poll should be closed due to end date
    await this.closeExpiredPolls();
    
    // Check if poll is open
    const [pollRows] = await pool.execute(
      'SELECT status FROM condo360_polls WHERE id = ?',
      [pollId]
    );
    
    if (pollRows.length === 0) {
      throw new Error('Poll not found');
    }
    
    if (pollRows[0].status !== 'open') {
      throw new Error('Poll is not open');
    }
    
    // Check if user already voted on this question
    const [voteRows] = await pool.execute(
      'SELECT id FROM condo360_votes WHERE poll_id = ? AND question_id = ? AND wp_user_id = ?',
      [pollId, questionId, userId]
    );
    
    if (voteRows.length > 0) {
      throw new Error('User already voted on this question');
    }
    
    // Record the vote
    await pool.execute(
      'INSERT INTO condo360_votes (poll_id, question_id, wp_user_id, answer) VALUES (?, ?, ?, ?)',
      [pollId, questionId, userId, answer]
    );
  }

  // Get poll results
  static async getResults(pollId) {
    // First, check if this poll should be closed due to end date
    await this.closeExpiredPolls();
    
    // Get poll info
    const [pollRows] = await pool.execute(
      'SELECT id, title, description FROM condo360_polls WHERE id = ?',
      [pollId]
    );
    
    if (pollRows.length === 0) {
      throw new Error('Poll not found');
    }
    
    const poll = pollRows[0];
    
    // Get questions with vote counts
    const [questionRows] = await pool.execute(
      `SELECT pq.id, pq.question_text, pq.options, 
              COUNT(v.id) as vote_count
       FROM condo360_poll_questions pq
       LEFT JOIN condo360_votes v ON pq.id = v.question_id
       WHERE pq.poll_id = ?
       GROUP BY pq.id, pq.question_text, pq.options
       ORDER BY pq.id`,
      [pollId]
    );
    
    // Process results
    const results = {};
    let totalVotes = 0;
    
    for (const question of questionRows) {
      let options;
      try {
        options = JSON.parse(question.options);
      } catch (e) {
        options = typeof question.options === 'string' ? 
                  question.options.split(',').map(opt => opt.trim()) : 
                  [];
      }
      
      // Get vote counts for each option
      const [optionVotes] = await pool.execute(
        `SELECT answer, COUNT(*) as count 
         FROM condo360_votes 
         WHERE question_id = ? 
         GROUP BY answer`,
        [question.id]
      );
      
      const optionCounts = {};
      let questionTotal = 0;
      
      for (const vote of optionVotes) {
        optionCounts[vote.answer] = vote.count;
        questionTotal += vote.count;
      }
      
      totalVotes += questionTotal;
      
      results[question.id] = {
        question: question.question_text,
        options: optionCounts,
        total: questionTotal
      };
    }
    
    return {
      poll,
      results,
      total_votes: totalVotes
    };
  }

  // Close a poll manually
  static async closePoll(pollId) {
    const [result] = await pool.execute(
      'UPDATE condo360_polls SET status = ? WHERE id = ? AND status = ?',
      ['closed', pollId, 'open']
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Poll not found or already closed');
    }
  }

  // Close polls that have reached their end date
  static async closeExpiredPolls() {
    await pool.execute(
      `UPDATE condo360_polls 
       SET status = 'closed' 
       WHERE status = 'open' AND end_date IS NOT NULL AND end_date < NOW()`
    );
  }

  // Close polls that have reached their end date (to be called periodically)
  static async closeExpiredPollsIfNecessary() {
    const [polls] = await pool.execute(
      `SELECT id FROM condo360_polls 
       WHERE status = 'open' AND end_date IS NOT NULL AND end_date < NOW()`
    );
    
    if (polls.length > 0) {
      await this.closeExpiredPolls();
      return polls.length;
    }
    
    return 0;
  }
}

module.exports = Poll;