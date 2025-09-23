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
 *         - question
 *         - options
 *       properties:
 *         id:
 *           type: integer
 *           description: ID de la encuesta
 *         question:
 *           type: string
 *           description: La pregunta de la encuesta
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Las opciones de respuesta
 *         status:
 *           type: string
 *           description: Estado de la encuesta (open/closed)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *     Vote:
 *       type: object
 *       required:
 *         - poll_id
 *         - option_index
 *         - user_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del voto
 *         poll_id:
 *           type: integer
 *           description: ID de la encuesta
 *         option_index:
 *           type: integer
 *           description: Índice de la opción seleccionada
 *         user_id:
 *           type: integer
 *           description: ID del usuario que votó
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha del voto
 *     PollResult:
 *       type: object
 *       properties:
 *         poll_id:
 *           type: integer
 *           description: ID de la encuesta
 *         question:
 *           type: string
 *           description: Pregunta de la encuesta
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               votes:
 *                 type: integer
 *           description: Opciones con conteo de votos
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
 *               - question
 *               - options
 *             properties:
 *               question:
 *                 type: string
 *                 description: Pregunta de la encuesta
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Opciones de respuesta
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de expiración (opcional)
 *     responses:
 *       201:
 *         description: Encuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/polls', PollController.createPoll);

// Get all open polls
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

// Get poll by ID
/**
 * @swagger
 * /api/polls/{id}:
 *   get:
 *     summary: Obtener una encuesta por ID
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

// Vote on a poll
/**
 * @swagger
 * /api/polls/{id}/vote:
 *   post:
 *     summary: Votar en una encuesta
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
 *               - option_index
 *             properties:
 *               option_index:
 *                 type: integer
 *                 description: Índice de la opción seleccionada (0-based)
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
 *         description: Usuario ya votó en esta encuesta
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

module.exports = router;