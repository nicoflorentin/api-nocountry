import { Router } from "express"
import { createPatient, createPatientByAdmin, getAllPatients, getPatientByID, getPatientsByName } from "../controllers/patient"

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Operaciones relacionadas con pacientes
 */
export const patient = Router()

/**
 * @swagger
 * /api/patient/create:
 *   post:
 *     summary: Crea un nuevo paciente
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientCreate'
 *     responses:
 *       200:
 *         description: Paciente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Ya existe un paciente con ese documento
 */
patient.post("/create", createPatient)

patient.post("/create_by_admin", createPatientByAdmin)

/**
 * @swagger
 * /api/patient:
 *   get:
 *     summary: Obtener lista de pacientes
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
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
 *       500:
 *         description: Error interno del servidor
 */
patient.get("/", getAllPatients)

/**
 * @swagger
 * /api/patient/search:
 *   get:
 *     summary: Obtener pacientes por nombre
 *     tags: [Patient]
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         description: Nombre del paciente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pacientes obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PatientResponse[]'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
patient.get("/search", getPatientsByName)

/**
 * @swagger
 * /api/patient/{id}:
 *   get:
 *     summary: Obtener paciente por ID
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
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
patient.get("/:id", getPatientByID)