const pool = require('../config/database');
const Poll = require('./Poll');

class Vote {
  // Get all votes for a specific poll (admin only)
  static async getVotesForPoll(pollId) {
    // Validate that pollId is a number
    const pId = parseInt(pollId);
    if (isNaN(pId)) {
      throw new Error('Invalid poll ID');
    }
    
    // Get the main poll
    const [pollRows] = await pool.execute(
      'SELECT id, title FROM condo360_polls WHERE id = ?',
      [pId]
    );
    
    if (pollRows.length === 0) {
      throw new Error('Poll not found');
    }
    
    const poll = pollRows[0];
    
    // Get all questions for this poll
    const [questionRows] = await pool.execute(
      'SELECT id, question_text FROM condo360_poll_questions WHERE poll_id = ? ORDER BY id',
      [pId]
    );
    
    // Get all votes for this poll with user info
    const [voteRows] = await pool.execute(
      `SELECT v.id, v.question_id, v.wp_user_id, v.answer, v.created_at, 
              q.question_text, u.user_login, u.user_email
       FROM condo360_votes v
       JOIN condo360_poll_questions q ON v.question_id = q.id
       LEFT JOIN wp_users u ON v.wp_user_id = u.id
       WHERE v.poll_id = ?
       ORDER BY v.created_at DESC`,
      [pId]
    );
    
    // Format votes data
    const votes = voteRows.map(vote => ({
      id: vote.id,
      poll_id: pId,
      question_id: vote.question_id,
      question_text: vote.question_text,
      wp_user_id: vote.wp_user_id,
      user_login: vote.user_login || 'Unknown',
      user_email: vote.user_email || 'Unknown',
      answer: vote.answer,
      created_at: vote.created_at
    }));
    
    return {
      poll: {
        id: poll.id,
        title: poll.title
      },
      votes
    };
  }
}

module.exports = Vote;