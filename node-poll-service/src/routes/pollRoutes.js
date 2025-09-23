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
router.post('/polls/{id}/close', PollController.closePoll);

// Get all polls (admin only)
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
 *                 $ref: '#/components/schemas/Poll'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores pueden ver todas las encuestas
 *       500:
 *         description: Error interno del servidor
 */
router.get('/polls/all', PollController.getAllPolls);

module.exports = router;