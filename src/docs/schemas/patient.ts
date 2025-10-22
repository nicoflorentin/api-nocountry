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
 *         - gender
 *         - nacionality
 *         - typeIdentification
 *         - identification
 *       properties:
 *         firstName:
 *           type: string
 *           example: "John"
 *           description: "Nombre del paciente"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *           description: "Apellido del paciente"
 *         phone:
 *           type: string
 *           example: "+5493876543210"
 *           description: "Teléfono del paciente (opcional)"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *           description: "Correo electrónico válido"
 *         password:
 *           type: string
 *           format: password
 *           example: "MiContraseña123!"
 *           description: "Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial"
 *         repeatPassword:
 *           type: string
 *           format: password
 *           example: "MiContraseña123!"
 *           description: "Debe coincidir con la contraseña"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *           description: "Fecha de nacimiento en formato ISO (YYYY-MM-DD)"
 *         gender:
 *           type: string
 *           enum:
 *             - male
 *             - female
 *             - other
 *           example: "male"
 *           description: "Género del paciente"
 *         nationality:
 *           type: string
 *           example: "Argentina"
 *           description: "Nacionalidad del paciente"
 *         typeIdentification:
 *           type: string
 *           enum:
 *             - dni
 *             - cc
 *             - ci
 *           example: "dni"
 *           description: "Tipo de documento de identidad. Puede ser: DNI (Argentina), CC (Colombia), CI (Uruguay/Chile)"
 *         identification:
 *           type: string
 *           example: "12345678"
 *           description: |
 *             Número del documento según el tipo:
 *             - **DNI:** solo números (7-8 dígitos).
 *             - **CC:** solo números (6-10 dígitos).
 *             - **CI:** alfanumérico (6-12 caracteres).
 */