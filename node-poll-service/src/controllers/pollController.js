const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const WordPressUserService = require('../services/WordPressUserService');

class PollController {
  // Create a new poll
  static async createPoll(req, res) {
    try {
      const { title, description, questions, startDate, endDate } = req.body;
      
      // Validate input
      if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Title and questions are required' });
      }
      
      // Validate questions
      for (const question of questions) {
        if (!question.text || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
          return res.status(400).json({ error: 'Each question must have text and options' });
        }
      }
      
      // Create the poll
      const pollId = await Poll.create(title, description, questions, startDate, endDate);
      
      res.status(201).json({ message: 'Poll created successfully', pollId });
    } catch (error) {
      console.error('Error creating poll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all open polls (without questions)
  static async getOpenPolls(req, res) {
    try {
      const polls = await Poll.getOpenPolls();
      res.json(polls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get poll by ID with questions
  static async getPollById(req, res) {
    try {
      const { id } = req.params;
      const poll = await Poll.getById(id);
      res.json(poll);
    } catch (error) {
      if (error.message === 'Poll not found') {
        return res.status(404).json({ error: 'Poll not found' });
      }
      console.error('Error fetching poll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all polls (admin)
  static async getAllPolls(req, res) {
    try {
      const polls = await Poll.getAllPolls();
      res.json(polls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Vote on a poll question
  static async voteOnPoll(req, res) {
    try {
      const { id } = req.params;
      const { questionId, answer } = req.body;
      const userId = req.headers['x-wordpress-user-id'];
      
      // Validate input
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      if (!questionId || !answer) {
        return res.status(400).json({ error: 'Question ID and answer are required' });
      }
      
      // Vote on the poll
      await Poll.vote(id, questionId, userId, answer);
      
      res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
      if (error.message === 'User already voted on this poll') {
        return res.status(409).json({ error: 'You have already voted on this poll' });
      }
      if (error.message === 'Poll is not open') {
        return res.status(400).json({ error: 'This poll is not open for voting' });
      }
      if (error.message === 'Poll not found') {
        return res.status(404).json({ error: 'Poll not found' });
      }
      console.error('Error voting on poll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get poll results
  static async getPollResults(req, res) {
    try {
      const { id } = req.params;
      const results = await Poll.getResults(id);
      res.json(results);
    } catch (error) {
      if (error.message === 'Poll not found') {
        return res.status(404).json({ error: 'Poll not found' });
      }
      console.error('Error fetching poll results:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Close a poll
  static async closePoll(req, res) {
    try {
      const { id } = req.params;
      await Poll.closePoll(id);
      res.json({ message: 'Poll closed successfully' });
    } catch (error) {
      if (error.message === 'Poll not found or already closed') {
        return res.status(404).json({ error: 'Poll not found or already closed' });
      }
      console.error('Error closing poll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = PollController;