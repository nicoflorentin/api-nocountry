/**
 * @swagger
 * components:
 *   schemas:
 *     PatientCreate:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - repeatPassword
 *         - dateOfBirth
 *       properties:
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         phone:
 *           type: string
 *           example: "+34123456789"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "MiContraseña123!"
 *           description: "Mínimo 8 caracteres, al menos una mayúscula, un número y un símbolo especial"
 *         repeatPassword:
 *           type: string
 *           format: password
 *           example: "MiContraseña123!"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         gender:
 *           type: string
 *           enum:
 *             - male
 *             - female
 *             - other
 *           example: "other"
 *         dni:
 *           type: string
 *           example: "12345678"
 */
