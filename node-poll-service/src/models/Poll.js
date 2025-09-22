const pool = require('../config/database');

class Poll {
  // Create a new poll
  static async create(question, options) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.execute(
        'INSERT INTO condo360_polls (question, options) VALUES (?, ?)',
        [question, JSON.stringify(options)]
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
    const [rows] = await pool.execute(
      'SELECT id, question, options, created_at FROM condo360_polls WHERE status = ? ORDER BY created_at DESC',
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
    const [rows] = await pool.execute(
      'SELECT id, question, options, status, created_at FROM condo360_polls WHERE id = ?',
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
    poll.options.forEach(option => {
      const vote = voteRows.find(v => v.answer === option);
      results[option] = vote ? parseInt(vote.count) : 0;
    });

    return {
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options
      },
      results
    };
  }
}

module.exports = Poll;