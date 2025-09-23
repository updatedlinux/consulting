const express = require('express');
const SurveyController = require('../controllers/SurveyController');

const router = express.Router();

/**
 * @swagger
 * /surveys:
 *   post:
 *     summary: Create a new survey
 *     description: Create a new survey with questions and options
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSurveyRequest'
 *     responses:
 *       201:
 *         description: Survey created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 survey_id:
 *                   type: integer
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /surveys:
 *   get:
 *     summary: Get active surveys
 *     description: Get all surveys that are currently active
 *     responses:
 *       200:
 *         description: List of active surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Survey'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post('/surveys', SurveyController.createSurvey);
router.get('/surveys', SurveyController.getActiveSurveys);

/**
 * @swagger
 * /surveys/all:
 *   get:
 *     summary: Get all surveys
 *     description: Get all surveys for admin panel
 *     responses:
 *       200:
 *         description: List of all surveys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   start_date:
 *                     type: string
 *                     format: date-time
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [open, closed]
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   participant_count:
 *                     type: integer
 *                   question_count:
 *                     type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /surveys/{id}:
 *   get:
 *     summary: Get a specific survey
 *     description: Get a specific survey by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Survey details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Survey'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get('/surveys/all', SurveyController.getAllSurveys);
router.get('/surveys/:id', SurveyController.getSurveyById);

/**
 * @swagger
 * /surveys/{id}/vote:
 *   post:
 *     summary: Vote in a survey
 *     description: Record a user's vote in a survey
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Survey ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VoteRequest'
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /surveys/{id}/results:
 *   get:
 *     summary: Get survey results
 *     description: Get results for a specific survey
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Survey ID
 *       - in: query
 *         name: admin
 *         required: false
 *         schema:
 *           type: string
 *         description: Set to "true" to bypass result availability checks
 *     responses:
 *       200:
 *         description: Survey results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SurveyResult'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /surveys/{id}/close:
 *   put:
 *     summary: Close a survey
 *     description: Manually close a survey
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Survey ID
 *     responses:
 *       200:
 *         description: Survey closed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Survey not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post('/surveys/:id/vote', SurveyController.voteInSurvey);
router.get('/surveys/:id/results', SurveyController.getSurveyResults);
router.put('/surveys/:id/close', SurveyController.closeSurvey);

module.exports = router;