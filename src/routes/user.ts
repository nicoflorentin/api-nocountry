import { Router } from "express";
import { getUserByID } from "../controllers/user";

export const user = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Operaciones relacionadas con usuarios
 */

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */

user.get("/:id", getUserByID);