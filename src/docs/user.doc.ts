/**
 * @swagger
 * tags:
 *   name: User
 *   description: Operaciones relacionadas con usuarios
 */

/**
 * @swagger
 * /api/user/update_image:
 *   post:
 *     summary: Actualizar imagen de usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Imagen a subir
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Imagen actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */