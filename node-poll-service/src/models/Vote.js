const pool = require('../config/database');

class Vote {
  // Create a new vote
  static async create(pollId, userId, answer) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const [result] = await connection.execute(
        'INSERT INTO condo360_votes (poll_id, wp_user_id, answer) VALUES (?, ?, ?)',
        [pollId, userId, answer]
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

  // Get all votes for a poll
  static async getByPollId(pollId) {
    const [rows] = await pool.execute(
      'SELECT id, poll_id, wp_user_id, answer, created_at FROM condo360_votes WHERE poll_id = ?',
      [pollId]
    );
    return rows;
  }
}

module.exports = Vote;