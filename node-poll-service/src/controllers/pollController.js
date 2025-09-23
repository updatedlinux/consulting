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