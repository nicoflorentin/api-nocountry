import { Router } from "express";
import { login } from "../controllers/auth";

export const auth = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Operaciones relacionadas con usuarios
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Loguear usuario
 *     tags: [Auth]
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/LoginCredentials'
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
auth.post("/login", login);