/**
 * @swagger
 * components:
 *   schemas:
 *     LoginCredentials:
 *       type: object
 *       description: Credenciales requeridas para iniciar sesión.
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *           description: "Correo electrónico del usuario"
 *         password:
 *           type: string
 *           format: password
 *           example: "MiContraseña123!"
 *           description: "Contraseña del usuario"
 *
 *     ChangePassword:
 *       type: object
 *       description: Esquema para actualizar la contraseña del usuario autenticado.
 *       required:
 *         - currentPassword
 *         - newPassword
 *         - repeatNewPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: Contraseña actual del usuario, requerida para verificar su identidad.
 *           example: "ContraseñaActual123"
 *         newPassword:
 *           type: string
 *           format: password
 *           description: La nueva contraseña. Debe cumplir con las reglas de seguridad.
 *           example: "ContraseñaNueva456#"
 *         repeatNewPassword:
 *           type: string
 *           format: password
 *           description: Confirmación de la nueva contraseña. Debe ser idéntica a 'newPassword'.
 *           example: "ContraseñaNueva456#"
 *       example:
 *         currentPassword: "ContraseñaActual123"
 *         newPassword: "ContraseñaNueva456#"
 *         repeatNewPassword: "ContraseñaNueva456#"
 */