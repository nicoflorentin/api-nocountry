import { Router } from "express"
import { getAllSpecialties } from "../controllers/specialty"

/**
 * @swagger
 * tags:
 *   name: Specialty
 *   description: Operaciones relacionadas con pacientes
 */
export const specialty = Router()


specialty.get("/", getAllSpecialties)