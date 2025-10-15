import { Router } from "express"
import { createPatient, getAllPatients } from "../controllers/patient"

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Operaciones relacionadas con usuarios
 */
export const patient = Router()

/**
 * @swagger
 * /api/patient/create:
 *   post:
 *     summary: Crear usuario paciente
 *     tags: [Patient]
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/PatientCreate'
 *     responses:
 *       200:
 *         description: Paciente creado
 */

patient.post("/create", createPatient)

/**
 * @swagger
 * /api/patient:
 *   get:
 *     summary: Obtener lista de pacientes
 *     tags: [Patient]
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: user@example.com
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-01-01T12:00:00Z
 */
patient.get("/", getAllPatients())
