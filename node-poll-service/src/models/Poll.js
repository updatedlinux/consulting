const pool = require('../config/database');

class Poll {
  // Create a new poll
  static async create(question, options, startDate = null, endDate = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.execute(
        'INSERT INTO condo360_polls (question, options, start_date, end_date) VALUES (?, ?, ?, ?)',
        [question, JSON.stringify(options), startDate, endDate]
      );
      
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all open polls
  static async getOpenPolls() {
    // First, check for polls that should be closed due to end date
    await this.closeExpiredPolls();
    
    const [rows] = await pool.execute(
      `SELECT id, question, options, status, start_date, end_date, created_at 
       FROM condo360_polls 
       WHERE status = ? 
       AND (start_date IS NULL OR start_date <= NOW()) 
       AND (end_date IS NULL OR end_date > NOW()) 
       ORDER BY created_at DESC`,
      ['open']
    );
    
    // Parse options JSON
    return rows.map(poll => {
      return {
        ...poll,
        options: JSON.parse(poll.options)
      };
    });
  }

  // Get poll by ID
  static async getById(id) {
    // First, check if this poll should be closed due to end date
    await this.closeExpiredPollIfNecessary(id);
    
    const [rows] = await pool.execute(
      'SELECT id, question, options, status, start_date, end_date, created_at FROM condo360_polls WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const poll = rows[0];
    return {
      ...poll,
      options: JSON.parse(poll.options)
    };
  }

  // Update poll status
  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE condo360_polls SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  // Check if user has voted on a poll
  static async hasUserVoted(pollId, userId) {
    const [rows] = await pool.execute(
      'SELECT id FROM condo360_votes WHERE poll_id = ? AND wp_user_id = ?',
      [pollId, userId]
    );
    return rows.length > 0;
  }

  // Get poll results
  static async getResults(pollId) {
    // First, check if this poll should be closed due to end date
    await this.closeExpiredPollIfNecessary(pollId);
    
    // Get poll details
    const poll = await this.getById(pollId);
    if (!poll) return null;

    // Get vote counts
    const [voteRows] = await pool.execute(
      'SELECT answer, COUNT(*) as count FROM condo360_votes WHERE poll_id = ? GROUP BY answer',
      [pollId]
    );

    // Format results
    const results = {};
    let totalVotes = 0;
    poll.options.forEach(option => {
      const vote = voteRows.find(v => v.answer === option);
      const count = vote ? parseInt(vote.count) : 0;
      results[option] = count;
      totalVotes += count;
    });

    return {
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options
      },
      results,
      total_votes: totalVotes
    };
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
    try {
      const [result] = await pool.execute(
        `UPDATE condo360_polls 
         SET status = 'closed' 
         WHERE id = ? 
         AND status = 'open' 
         AND end_date IS NOT NULL 
         AND end_date <= NOW()`,
        [pollId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error closing expired poll:', error);
      // Don't throw the error to avoid breaking the main functionality
      return false;
    }
  }

  // Get all polls (for admin view)
  static async getAllPolls() {
    // First, check for polls that should be closed due to end date
    await this.closeExpiredPolls();
    
    const [rows] = await pool.execute(
      `SELECT id, question, options, status, start_date, end_date, created_at 
       FROM condo360_polls 
       ORDER BY created_at DESC`
    );
    
    // Parse options JSON
    return rows.map(poll => {
      return {
        ...poll,
        options: JSON.parse(poll.options)
      };
    });
  }
}

module.exports = Poll;