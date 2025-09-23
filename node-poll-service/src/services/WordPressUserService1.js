// src/services/WordPressUserService.js

class WordPressUserService {
  // This is a mock implementation - in a real scenario, you would validate
  // the user token with your WordPress installation
  static async validateUser(userId) {
    // For now, we'll assume all users are valid
    // In a real implementation, you would check with WordPress API
    // to verify the user exists and get their role/permissions
    
    // Mock user data - in reality, this would come from WordPress
    const mockUsers = {
      '1': { 
        id: 1, 
        login: 'admin', 
        email: 'admin@example.com', 
        isAdmin: true 
      },
      '2': { 
        id: 2, 
        login: 'user1', 
        email: 'user1@example.com', 
        isAdmin: false 
      }
    };
    
    // Convert userId to string for comparison
    const user = mockUsers[userId.toString()];
    
    if (user) {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        isAdmin: user.isAdmin
      };
    }
    
    // If user not found in mock data, still return a basic user object
    // This is for demonstration purposes only
    return {
      id: parseInt(userId),
      login: `user${userId}`,
      email: `user${userId}@example.com`,
      isAdmin: userId === '1' // Only user ID 1 is admin
    };
  }
}

module.exports = WordPressUserService;