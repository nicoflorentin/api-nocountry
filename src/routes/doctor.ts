import { Router } from "express"
import { getAllDoctors, getDoctorByID, createDoctor, getPatientByID, getDoctorsBySpecialtyID, getDoctorsByName, updateDoctor } from "../controllers/doctor"
import { get } from "http"

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Operaciones relacionadas con doctores
 */
export const doctor = Router()

/**
 * @swagger
 * /api/doctor:
 *   get:
 *     summary: Obtener lista de doctor
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de doctor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 doctor:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DoctorResponse'
 */
doctor.get("/", getAllDoctors)

/**
 * @swagger
 * /api/doctor/{id}:
 *   get:
 *     summary: Obtener médico por ID
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del médico
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del doctor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 doctor:
 *                   $ref: '#/components/schemas/DoctorResponse'
 *       404:
 *         description: Doctor no encontrado
 *       500:
 *         description: Error interno del servidor
 */
doctor.get("/:id", getDoctorByID)

/**
 * @swagger
 * /api/doctor/create:
 *   post:
 *     summary: Crear usuario doctor
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorCreate'
 *     responses:
 *       201:
 *         description: Doctor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoctorResponse'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
doctor.post("/create", createDoctor)

doctor.get("/patient/:id", getPatientByID)
doctor.get("/specialty/:id", getDoctorsBySpecialtyID)
doctor.get("/search", getDoctorsByName)
doctor.put("/:id", updateDoctor)


