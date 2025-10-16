import { Router } from "express"
import { createPatient, getAllPatients, getPatientByID } from "../controllers/patient"

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Operaciones relacionadas con usuarios
 */
export const patient = Router()

/**
 * @swagger
 * /api/patient/{id}:
 *   get:
 *     summary: Obtener paciente por ID
 *     tags: [Patient]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del paciente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/PatientResponse'
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
patient.get("/:id", getPatientByID())

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
 *                     $ref: '#/components/schemas/PatientResponse'
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
