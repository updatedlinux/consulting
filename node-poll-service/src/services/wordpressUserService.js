const pool = require('../config/database');

class WordPressUserService {
  // Validate if a user exists and get their role
  static async validateUser(userId) {
    const [rows] = await pool.execute(
      `SELECT u.ID, u.user_login, u.user_email, um.meta_value as capabilities
       FROM wp_users u
       LEFT JOIN wp_usermeta um ON u.ID = um.user_id AND um.meta_key = 'wp_capabilities'
       WHERE u.ID = ?`,
      [userId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const user = rows[0];
    
    // Check if user is admin
    const isAdmin = user.capabilities && user.capabilities.includes('administrator');
    
    return {
      id: user.ID,
      username: user.user_login,
      email: user.user_email,
      isAdmin: isAdmin
    };
  }
  
  // Check if user is admin
  static async isUserAdmin(userId) {
    const user = await this.validateUser(userId);
    return user ? user.isAdmin : false;
  }
}

module.exports = WordPressUserService;