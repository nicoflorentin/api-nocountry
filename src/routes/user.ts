import { Router } from "express";
import { getAllUsers, getUserByID, updateUserImage } from "../controllers/user";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";

export const user = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Operaciones relacionadas con usuarios
 */

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * /api/user/update_image:
 *   post:
 *     summary: Actualizar imagen de usuario
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Imagen a subir
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Imagen actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 */
user.post("/update_image", authMiddleware, upload.single("file"), updateUserImage);
