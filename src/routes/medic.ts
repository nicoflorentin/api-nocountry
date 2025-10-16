import { Router } from "express"
import { getAllMedics, getMedicByID } from "../controllers/medic"

/**
 * @swagger
 * tags:
 *   name: Medic
 *   description: Operaciones relacionadas con médicos
 */
export const medic = Router()

/**
 * @swagger
 * /api/medic:
 *   get:
 *     summary: Obtener lista de médicos
 *     tags: [Medic]
 *     responses:
 *       200:
 *         description: Lista de médicos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 medics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MedicResponse'
 */
medic.get("/", getAllMedics())

/**
 * @swagger
 * /api/medic/{id}:
 *   get:
 *     summary: Obtener médico por ID
 *     tags: [Medic]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del médico
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del médico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 medic:
 *                   $ref: '#/components/schemas/MedicResponse'
 *       404:
 *         description: Médico no encontrado
 *       500:
 *         description: Error interno del servidor
 */
medic.get("/:id", getMedicByID)
