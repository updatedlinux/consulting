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
 * /polls:
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
 *                 description: La pregunta de la encuesta
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Las opciones de respuesta
 *               open:
 *                 type: boolean
 *                 description: Si la encuesta está abierta o no
 *     responses:
 *       201:
 *         description: Encuesta creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
// Create a new poll (admin only)
router.post('/polls', PollController.createPoll);

/**
 * @swagger
 * /polls:
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
 */
// Get all open polls
router.get('/polls', PollController.getOpenPolls);

/**
 * @swagger
 * /polls/{id}:
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
 */
// Get poll by ID
router.get('/polls/:id', PollController.getPollById);

/**
 * @swagger
 * /polls/{id}/vote:
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
 *               - optionIndex
 *             properties:
 *               optionIndex:
 *                 type: integer
 *                 description: Índice de la opción seleccionada
 *     responses:
 *       200:
 *         description: Voto registrado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Encuesta no encontrada
 */
// Vote on a poll
router.post('/polls/:id/vote', PollController.voteOnPoll);

/**
 * @swagger
 * /polls/{id}/results:
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
 *               type: object
 *               properties:
 *                 poll:
 *                   $ref: '#/components/schemas/Poll'
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       option:
 *                         type: string
 *                       votes:
 *                         type: integer
 *       404:
 *         description: Encuesta no encontrada
 */
// Get poll results
router.get('/polls/:id/results', PollController.getPollResults);

module.exports = router;