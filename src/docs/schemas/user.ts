/**
 * @swagger
 * components:
 *   schemas:
 *     UserCreate:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         fist_name:
 *           type: string
 *           example: "John"
 *         last_name:
 *           type: string
 *           example: "Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "MiContraseña123!"
 *         repeat_password:
 *           type: string
 *           format: password
 *           example: "MiContraseña123!"
 */

