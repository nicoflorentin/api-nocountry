/**
 * @swagger
 * components:
 *   schemas:
 *     DoctorCreate:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - licenseNumber
 *         - bio
 *         - specialityId
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
 *         licenseNumber:
 *           type: string
 *           format: date
 *           example: "MD1231"
 *         bio:
 *           type: string
 *           example: "Soy super profesional"
 *         specialityId:
 *           type: number
 *           example: 1
 */
