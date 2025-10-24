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
 *         - nationality
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
 * 
 *     PatientUpdate:
 *       type: object
 *       description: Datos parciales para actualizar la información de un paciente. Todos los campos son opcionales.
 *       properties:
 *         firstName:
 *           type: string
 *           description: Nuevo nombre del paciente.
 *         lastName:
 *           type: string
 *           description: Nuevo apellido del paciente.
 *         phone:
 *           type: string
 *           description: Nuevo número de teléfono.
 *         email:
 *           type: string
 *           format: email
 *           description: Nuevo correo electrónico.
 *         urlImage:
 *           type: string
 *           nullable: true
 *           description: Nueva URL de la imagen de perfil.
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Nueva fecha de nacimiento (YYYY-MM-DD).
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: Nuevo género.
 *         nationality:
 *           type: string
 *           description: Nueva nacionalidad.
 *         typeIdentification:
 *           type: string
 *           enum: [dni, cc, ci]
 *           description: Nuevo tipo de identificación.
 *         identification:
 *           type: string
 *           description: Nuevo número de identificación.
 *       example:
 *         phone: "555-1234"
 *         nationality: "Venezolana"
 * 
 *     PatientResponse:
 *       type: object
 *       description: Estructura de respuesta de un paciente, combinando datos de 'users' y 'patients'.
 *       properties:
 *         id:
 *           type: integer
 *           description: ID interno de la tabla 'patients'.
 *         user_id:
 *           type: integer
 *           description: ID de la tabla 'users'.
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         urlImage:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         typeIdentification:
 *           type: string
 *           enum: [dni, cc, ci]
 *         identification:
 *           type: string
 *         nationality:
 *           type: string
 *         isActive:
 *           type: boolean
 *         phone:
 *           type: string
 *           nullable: true
 *       example:
 *         id: 101
 *         user_id: 50
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@email.com"
 *         urlImage: null
 *         createdAt: "2024-01-01T10:00:00Z"
 *         dateOfBirth: "1985-05-15"
 *         gender: "male"
 *         typeIdentification: "dni"
 *         identification: "98765432"
 *         nationality: "Argentina"
 *         isActive: true
 *         phone: "5551234567"
 */