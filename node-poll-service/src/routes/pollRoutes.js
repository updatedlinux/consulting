const express = require('express');
const router = express.Router();
const PollController = require('../controllers/pollController');

/**
 * @swagger
 * /api/polls/{id}/votes:
 *   get:
 *     summary: Obtener los votos de una encuesta (solo administradores)
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
 *         description: Votos de la encuesta
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
// router.get('/polls/:id/votes', PollController.getPollVotes);

// Close a poll manually (admin only)

module.exports = router;