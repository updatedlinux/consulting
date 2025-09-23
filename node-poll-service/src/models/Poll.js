// Get all open polls
  static async getOpenPolls() {
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