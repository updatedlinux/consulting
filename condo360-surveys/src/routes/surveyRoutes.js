const express = require('express');
const SurveyController = require('../controllers/SurveyController');

const router = express.Router();

// Survey routes
router.post('/surveys', SurveyController.createSurvey);
router.get('/surveys', SurveyController.getActiveSurveys);
router.get('/surveys/all', SurveyController.getAllSurveys); // For admin panel
router.get('/surveys/:id', SurveyController.getSurveyById);
router.post('/surveys/:id/vote', SurveyController.voteInSurvey);
router.get('/surveys/:id/results', SurveyController.getSurveyResults);
router.put('/surveys/:id/close', SurveyController.closeSurvey);

module.exports = router;