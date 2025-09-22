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
 *         open:
 *           type: boolean
 *           description: Si la encuesta está abierta o no
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
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
 */