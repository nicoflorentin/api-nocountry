import { Router } from "express";
import { currentUser, login } from "../controllers/auth";
import { authMiddleware } from "../middleware/auth";

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

/**
 * @swagger
 * /api/auth/current_user:
 *   get:
 *     summary: Usuario logueado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
auth.get("/current_user", authMiddleware, currentUser);