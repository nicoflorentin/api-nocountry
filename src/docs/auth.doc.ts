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

/**
 * @swagger
 * /api/auth/change_password:
 *   patch:
 *     summary: Actualiza la contraseña del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente.
 *       400:
 *         description: Error de validación o contraseñas nuevas no coinciden.
 *       401:
 *         description: Contraseña actual incorrecta o No Autorizado.
 */