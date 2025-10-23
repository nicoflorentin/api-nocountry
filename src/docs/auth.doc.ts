/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Operaciones relacionadas con Autenticacion de Usuarios
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Loguear usuario
 *     tags: [Auth]
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @swagger
 * /api/auth/current_user:
 *   get:
 *     summary: Usuario logueado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */