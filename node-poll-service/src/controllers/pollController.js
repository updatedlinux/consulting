const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const WordPressUserService = require('../services/wordpressUserService');

class PollController {
  // Create a new poll (admin only)
  static async createPoll(req, res) {
    try {
      const { question, options, start_date, end_date } = req.body;
      const userId = req.headers['x-wordpress-user-id']; // wp_user_id from header

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
      const pollId = await Poll.create(question, options, start_date, end_date);
      
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
      const { optionIndex } = req.body;
      const userId = req.headers['x-wordpress-user-id']; // wp_user_id from header

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

      // Check if poll is active (within start_date and end_date)
      const now = new Date();
      if (poll.start_date && new Date(poll.start_date) > now) {
        return res.status(400).json({ error: 'Poll has not started yet' });
      }
      if (poll.end_date && new Date(poll.end_date) < now) {
        return res.status(400).json({ error: 'Poll has expired' });
      }

      // Check if user has already voted
      const hasVoted = await Poll.hasUserVoted(id, userId);
      if (hasVoted) {
        return res.status(409).json({ error: 'User has already voted on this poll' });
      }

      // Validate optionIndex
      if (optionIndex === undefined || optionIndex < 0 || optionIndex >= poll.options.length) {
        return res.status(400).json({ error: 'Invalid option index' });
      }

      // Get the actual answer text
      const answer = poll.options[optionIndex];

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

  // Get poll votes (admin only)
  static async getPollVotes(req, res) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-wordpress-user-id']; // wp_user_id from header

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
        return res.status(403).json({ error: 'Only administrators can view poll votes' });
      }

      // Check if poll exists
      const poll = await Poll.getById(id);
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      // Get votes
      const votes = await Vote.getByPollId(id);
      
      res.json({ 
        message: 'Poll votes retrieved successfully',
        poll: {
          id: poll.id,
          question: poll.question
        },
        votes 
      });
    } catch (error) {
      console.error('Error fetching poll votes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Close a poll manually (admin only)
  static async closePoll(req, res) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-wordpress-user-id']; // wp_user_id from header

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
        return res.status(403).json({ error: 'Only administrators can close polls' });
      }

      // Check if poll exists
      const poll = await Poll.getById(id);
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found' });
      }

      // Check if poll is already closed
      if (poll.status === 'closed') {
        return res.status(400).json({ error: 'Poll is already closed' });
      }

      // Close the poll
      const success = await Poll.updateStatus(id, 'closed');
      
      if (success) {
        res.json({ message: 'Poll closed successfully' });
      } else {
        res.status(500).json({ error: 'Failed to close poll' });
      }
    } catch (error) {
      console.error('Error closing poll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all polls (admin only)
  static async getAllPolls(req, res) {
    try {
      const userId = req.headers['x-wordpress-user-id']; // wp_user_id from header

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
        return res.status(403).json({ error: 'Only administrators can view all polls' });
      }

      // Get all polls
      const polls = await Poll.getAllPolls();
      
      res.json(polls);
    } catch (error) {
      console.error('Error fetching all polls:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = PollController;