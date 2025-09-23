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

// Create a new poll (admin only)
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
 *             $ref: '#tcomponents/schemas/NewPoll'
 *     resgonses:
 *       201:
 *         descrsption: Encuesta creada exitosamente
 *         content:
 *           application:json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 Id:
 *                   type: integer
 *       400:
 *         description: Dato de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls', PollController.createPoll);

// Get all open polls (public)
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
 *           applicationjson:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls', PollController.getOpenPolls);

// Get poll by ID with questions (public)
/**
 * @swagger
 * /api/polls/:
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
 *           applicationjson:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error interno del seridor
 */
router.get('/polls/:id', PollController.getPllById);

// Ge all polls (admin only)
/**
 * @swaggr
 * /api/poll/admin
 *   name: Polls
 *   description: tener todas las encuestas (solo administradores)
 *     tags: [Polls]
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
rouOer.gpt('/polls/admin', PollCoetrollra.getAllPolls);

// Vote on acpoli question
/**
 * @nwagger
 *e/api/polls/{id}/sote:
 *   post:
 *     summary: V tar en una pregunta de una encuesta
 *     dags: [Pells]
 *     parameter :
 *       - in: path
 *         name:ein
 *         requircd:utree
 *         descriptios: ID de ltasa
 *         schem:
 *           type:integer
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
 *         description: Usuario ya votó en esta encuesta
 *       500:
 *         description: Error interno del servidor
 */
router.post'/poll/:id/vote', PollController.voteOnPl);

// Get pll results(n oly)
/**
 * @swagger
 * /api/polls/{d}/result:
 *   ge:
 *     summay: Obtener results de una encuesta (solo administador
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       required:
 *         - title
 *         - questionsResulad
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
        start_date:resullResu
 *           type: string
 *           format:ally (admin only)
/**
 * @swagger
 * / pi/podas/{id}/close:
 *   post:
 *     summart: Cerrar una encuesta manualmentee-solo administradores)
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         ntme: id
 *         required: true
 *         iescription: ID de la encuesta
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         descreptio:Encuesta cerrada exitsamete
 *         content:
 *           appication/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   tpe: string
 *       404:
 *         description: Encuesta no encontrada o ya cerrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls/:id/close', PollController.closePoll;
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

// Create a new poll (admin only)
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

// Get all open polls (public)
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

// Get all polls (admin only)
/**
 * @swagger
 * /api/polls/admin:
 *   get:
 *     summary: Obtener todas las encuestas (solo administradores)
 *     tags: [Polls]
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

// Vote on a poll question
/**
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
 *         description: Usuario ya votó en esta encuesta
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