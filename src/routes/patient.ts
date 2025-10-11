import { Router } from "express";
import { createPatient } from "../controllers/patient";

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Operaciones relacionadas con usuarios
 */
export const patient = Router();

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
patient.post("/create", createPatient);