const express = require('express');
const router = express.Router();
const PollController = require('../controllers/pollController');

// Create a new poll (admin only)
router.post('/polls', PollController.createPoll);

// Get all open polls
router.get('/polls', PollController.getOpenPolls);

// Get poll by ID
router.get('/polls/:id', PollController.getPollById);

// Vote on a poll
router.post('/polls/:id/vote', PollController.voteOnPoll);

// Get poll results
router.get('/polls/:id/results', PollController.getPollResults);

module.exports = router;