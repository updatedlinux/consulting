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
      `SELECT v.id, v.poll_id, v.wp_user_id, v.answer, v.created_at, u.user_login, u.user_email
       FROM condo360_votes v
       LEFT JOIN wp_users u ON v.wp_user_id = u.ID
       WHERE v.poll_id = ?
       ORDER BY v.created_at DESC`,
      [pollId]
    );
    return rows;
  }
}

module.exports = Vote;