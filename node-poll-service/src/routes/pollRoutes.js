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
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               text:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *           description: Las preguntas de la encuesta
 *         status:
 *           type: string
 *           description: Estado de la encuesta (open/closed)
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio de la encuesta
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin de la encuesta
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *     Vote:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del voto
 *         poll_id:
 *           type: integer
 *           description: ID de la encuesta
 *         question_id:
 *           type: integer
 *           description: ID de la pregunta
 *         question_text:
 *           type: string
 *           description: Texto de la pregunta
 *         wp_user_id:
 *           type: integer
 *           description: ID del usuario que votó
 *         user_login:
 *           type: string
 *           description: Nombre de usuario
 *         user_email:
 *           type: string
 *           description: Email del usuario
 *         answer:
 *           type: string
 *           description: Respuesta del usuario
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha del voto
 *     PollResult:
 *       type: object
 *       properties:
 *         poll:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             title:
 *               type: string
 *             description:
 *               type: string
 *         results:
 *           type: object
 *           additionalProperties:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: object
 *                 additionalProperties:
 *                   type: integer
 *         total_votes:
 *           type: integer
 *           description: Total de votos
 */

// Create a new poll (admin only)
/**
 * @swagger
 * /api/polls:
 *   post:
 *     summary: Crear una nueva encuesta
 *     tags: [Polls]
 *     security:
 *       - wordpressAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título de la encuesta
 *               description:
 *                 type: string
 *                 description: Descripción de la encuesta
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - options
 *                   properties:
 *                     text:
 *                       type: string
 *                       description: Texto de la pregunta
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Opciones de respuesta
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio (opcional)
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de fin (opcional)
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
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores pueden crear encuestas
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls', PollController.createPoll);

// Get all open polls (without questions)
/**
 * @swagger
 * /api/polls:
 *   get:
 *     summary: Obtener todas las encuestas abiertas (sin preguntas)
 *     tags: [Polls]
 *     responses:
 *       200:
 *         description: Lista de encuestas abiertas
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
 *                   status:
 *                     type: string
 *                   start_date:
 *                     type: string
 *                     format: date-time
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls', PollController.getOpenPolls);

// Get all polls (admin only) - This route must be defined BEFORE /polls/:id
/**
 * @swagger
 * /api/polls/all:
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
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   start_date:
 *                     type: string
 *                     format: date-time
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores pueden ver todas las encuestas
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls/all', PollController.getAllPolls);

// Get poll by ID with all its questions
/**
 * @swagger
 * /api/polls/{id}:
 *   get:
 *     summary: Obtener una encuesta por ID con todas sus preguntas
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

// Vote on a poll question
/**
 * @swagger
 * /api/polls/{id}/vote:
 *   post:
 *     summary: Votar en una pregunta de la encuesta
 *     tags: [Polls]
 *     security:
 *       - wordpressAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la encuesta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - answer
 *             properties:
 *               questionId:
 *                 type: integer
 *                 description: ID de la pregunta
 *               answer:
 *                 type: string
 *                 description: Respuesta seleccionada
 *     responses:
 *       200:
 *         description: Voto registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Encuesta no encontrada
 *       409:
 *         description: Usuario ya votó en esta pregunta
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls/:id/vote', PollController.voteOnPoll);

// Get poll results
/**
 * @swagger
 * /api/polls/{id}/results:
 *   get:
 *     summary: Obtener resultados de una encuesta
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
 *         description: Resultados de la encuesta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PollResult'
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls/:id/results', PollController.getPollResults);

// Get poll votes (admin only)
/**
 * @swagger
 * /api/polls/{id}/votes:
 *   get:
 *     summary: Obtener votos de una encuesta (solo administradores)
 *     tags: [Polls]
 *     security:
 *       - wordpressAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la encuesta
 *     responses:
 *       200:
 *         description: Votos de la encuesta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 poll:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                 votes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vote'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores pueden ver los votos
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls/:id/votes', PollController.getPollVotes);

// Close a poll manually (admin only)
/**
 * @swagger
 * /api/polls/{id}/close:
 *   post:
 *     summary: Cerrar una encuesta manualmente (solo administradores)
 *     tags: [Polls]
 *     security:
 *       - wordpressAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la encuesta
 *     responses:
 *       200:
 *         description: Encuesta cerrada exitosamente
 *       400:
 *         description: La encuesta ya está cerrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores pueden cerrar encuestas
 *       404:
 *         description: Encuesta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls/:id/close', PollController.closePoll);

module.exports = router;