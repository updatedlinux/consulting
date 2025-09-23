const express = require('express');
const router = express.Router();
const PollController = require('../controllers/pollController');

/**
 * @swagger
 * tags:
 *   name: Polls
 *   description: Operaciones de encuestas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       required:
 *         - title
 *         - questions
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la encuesta
 *         title:
 *           type: string
 *           description: Título de la encuesta
 *         description:
 *           type: string
 *           description: Descripción de la encuesta
 *         status:
 *           type: string
 *           enum: [open, closed]
 *           description: Estado de la encuesta
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio de la encuesta
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Fecha de finalización de la encuesta
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación de la encuesta
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               question_text:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *     NewPoll:
 *       type: object
 *       required:
 *         - title
 *         - questions
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - text
 *               - options
 *             properties:
 *               text:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *     Vote:
 *       type: object
 *       required:
 *         - questionId
 *         - answer
 *       properties:
 *         questionId:
 *           type: integer
 *         answer:
 *           type: string
 */

/**
 * @swagger
 * /api/polls:
 *   post:
 *     summary: Crear una nueva encuesta (solo administradores)
 *     tags: [Polls]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewPoll'
 *     responses:
 *       201:
 *         description: Encuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pollId:
 *                   type: integer
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls', PollController.createPoll);

/**
 * @swagger
 * /api/polls:
 *   get:
 *     summary: Obtener todas las encuestas abiertas
 *     tags: [Polls]
 *     responses:
 *       200:
 *         description: Lista de encuestas abiertas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls', PollController.getOpenPolls);

/**
 * @swagger
 * /api/polls/{id}:
 *   get:
 *     summary: Obtener una encuesta por ID con sus preguntas
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la encuesta
 *     responses:
 *       200:
 *         description: Detalles de la encuesta con preguntas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
/**
 * @swagger
 * /api/polls/{id}:
 *   get:
 *     summary: Obtener una encuesta por ID con sus preguntas
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la encuesta
 *     responses:
 *       200:
 *         description: Detalles de la encuesta con preguntas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
// Get poll by ID with questions (public)
router.get('/polls/:id', PollController.getPollById);

/**
 * @swagger
 * /api/polls/admin:
 *   get:
 *     summary: Obtener todas las encuestas (solo administradores)
 *     tags: [Polls]
 *     security:
 *       - wordpressAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las encuestas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *       500:
 *         description: Error interno del servidor
 */
// Get all polls (admin only)
router.get('/polls/admin', PollController.getAllPolls);
/**
 * @swagger
 * /api/polls/admin:
 *   get:
 *     summary: Obtener todas las encuestas (solo administradores)
 *     tags: [Polls]
 *     security:
 *       - wordpressAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las encuestas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls/admin', PollController.getAllPolls);
router.get('/polls/admin', PollController.getAllPolls);

/**
 * @swagger
 * /api/polls/test:
 *   get:
 *     summary: Endpoint de prueba
 *     tags: [Polls]
 *     parameters:
 *       - in: query
 *         name: testParam
 *         schema:
 *           type: string
 *         description: Parámetro de prueba
 *     responses:
 *       200:
 *         description: Respuesta de prueba
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 params:
 *                   type: object
 *                 query:
 *                   type: object
 */
// Test endpoint
router.get('/polls/test', (req, res) => {
  console.log('Test endpoint called');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  res.json({ message: 'Test endpoint working', params: req.params, query: req.query });
});
/**
 * @swagger
 * /api/polls/test:
 *   get:
 *     summary: Endpoint de prueba
 *     tags: [Polls]
 *     parameters:
 *       - in: query
 *         name: testParam
 *         schema:
 *           type: string
 *         description: Parámetro de prueba
 *     responses:
 *       200:
 *         description: Respuesta de prueba
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 params:
 *                   type: object
 *                 query:
 *                   type: object
 */
/**
 * @swagger
 * /api/polls/test:
 *   get:
 *     summary: Endpoint de prueba
 *     tags: [Polls]
 *     parameters:
 *       - in: query
 *         name: testParam
 *         schema:
 *           type: string
 *         description: Parámetro de prueba
 *     responses:
 *       200:
 *         description: Respuesta de prueba
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 params:
 *                   type: object
 *                 query:
 *                   type: object
 */
// Test endpoint
router.get('/polls/test', (req, res) => {
  console.log('Test endpoint called');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  res.json({ message: 'Test endpoint working', params: req.params, query: req.query });
});
 // Test endpoint
router.get('/polls/test', (req, res) => {
  console.log('Test endpoint called');
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  res.json({ message: 'Test endpoint working', params: req.params, query: req.query });
});

 // Get poll by ID with questions (public)
 /**
  * @swagger
 * /api/polls/{id}:
 *   get:
 *     summary: Obtener una encuesta por ID con sus preguntas
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la encuesta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles de la encuesta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls/:id', PollController.getPollById);

/**
 * @swagger
 * /api/polls/{id}/vote:
 *   post:
 *     summary: Votar en una pregunta de una encuesta
 *     tags: [Polls]
 *     parameters:
 * @swagger
 * /api/polls/{id}/vote:
 *   post:
 *     summary: Votar en una pregunta de una encuesta
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la encuesta
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vote'
 *     responses:
 *       200:
 *         description: Voto registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos de entrada inválidos o encuesta no abierta
 *       404:
 *         description: Encuesta no encontrada
 *       409:
 *         description: Usuario ya votó en esta pregunta
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls/:id/vote', PollController.voteOnPoll);

// Get poll results (admin only)
/**
 * @swagger
 * /api/polls/{id}/results:
 *   get:
 *     summary: Obtener resultados de una encuesta (solo administradores)
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la encuesta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultados de la encuesta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 poll:
 *                   $ref: '#/components/schemas/Poll'
 *                 results:
 *                   type: object
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls/:id/results', PollController.getPollResults);

// Close a poll manually (admin only)
/**
 * @swagger
 * /api/polls/{id}/close:
 *   post:
 *     summary: Cerrar una encuesta manualmente (solo administradores)
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la encuesta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Encuesta cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Encuesta no encontrada o ya cerrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls/:id/close', PollController.closePoll);

module.exports = router;