const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const WordPressUserService = require('../services/wordpressUserService');

class PollController {
  // Create a new poll (admin only)
  static async createPoll(req, res) {
    try {
      const { question, options } = req.body;
      const { userId } = req.body; // wp_user_id from request body

      // Validate user
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const user = await WordPressUserService.validateUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'Invalid user' });
      }

      // Check if user is admin
      if (!user.isAdmin) {
        return res.status(403).json({ error: 'Only administrators can create polls' });
      }

      // Validate input
      if (!question || !options || !Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ error: 'Question and options are required' });
      }

      // Create poll
      const pollId = await Poll.create(question, options);
      
      res.status(201).json({ 
        message: 'Poll created successfully', 
        pollId 
      });
    } catch (error) {
      console.error('Error creating poll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all open polls
  static async getOpenPolls(req, res) {
    try {
      const polls = await Poll.getOpenPolls();
      res.json(polls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get poll by ID
  static async getPollById(req, res) {
    try {
      const { id } = req.params;
      const poll = await Poll.getById(id);
      
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }
      
      res.json(poll);
    } catch (error) {
      console.error('Error fetching poll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Vote on a poll
  static async voteOnPoll(req, res) {
    try {
      const { id } = req.params;
      const { userId, answer } = req.body;

      // Validate user
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const user = await WordPressUserService.validateUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'Invalid user' });
      }

      // Check if poll exists
      const poll = await Poll.getById(id);
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      // Check if poll is open
      if (poll.status !== 'open') {
        return res.status(400).json({ error: 'Poll is closed' });
      }

      // Check if user has already voted
      const hasVoted = await Poll.hasUserVoted(id, userId);
      if (hasVoted) {
        return res.status(400).json({ error: 'User has already voted on this poll' });
      }

      // Validate answer
      if (!answer || !poll.options.includes(answer)) {
        return res.status(400).json({ error: 'Invalid answer' });
      }

      // Create vote
      await Vote.create(id, userId, answer);
      
      res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
      console.error('Error voting on poll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get poll results
  static async getPollResults(req, res) {
    try {
      const { id } = req.params;
      const results = await Poll.getResults(id);
      
      if (!results) {
        return res.status(404).json({ error: 'Poll not found' });
      }
      
      res.json(results);
    } catch (error) {
      console.error('Error fetching poll results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = PollController;