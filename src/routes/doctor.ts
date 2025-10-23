import { Router } from "express"
import {
	getAllDoctors,
	getDoctorByID,
	createDoctor,
	getDoctorsBySpecialtyID,
	getDoctorsByName,
	updateDoctor,
	getPatientByID,
	createDoctorByAdmin,
} from "../controllers/doctor"
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

doctor.post("/create_by_admin", createDoctorByAdmin)

/**
 * @swagger
 * /api/doctor/search:
 *   get:
 *     summary: Crear usuario doctor
 *     tags: [Doctor]
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         description: Nombre del doctor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctores obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoctorResponse'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
doctor.get("/search", getDoctorsByName)

/**
 * @swagger
 * /api/doctor/put:
 *   put:
 *     summary: Actualizar usuario doctor
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorUpdate'
 *     responses:
 *       200:
 *         description: Doctor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoctorResponse'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Algun campo ya existe en la base de datos y no se puede actualizar
 *       500:
 *         description: Error interno del servidor
 */
doctor.put("/", updateDoctor)

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
doctor.get("/patient/:id", getPatientByID)

/**
 * @swagger
 * /api/doctor/specialty/{id}:
 *   get:
 *     summary: Crear usuario doctor
 *     tags: [Doctor]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la espaecialidad
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctores obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoctorResponse'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
doctor.get("/specialty/:id", getDoctorsBySpecialtyID)
