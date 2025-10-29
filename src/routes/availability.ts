// src/routes/availability.ts

import { Router } from "express"
import {
    createAvailability,
    createBulkAvailabilities,
    getAllAvailabilitiesByDoctor,
    updateAvailability,
    deleteAvailability,
    generateTimeSlotsController,
} from "../controllers/availability"

export const availabiliyRouter = Router()

// Asumiendo que la ruta base es /api/availabilities

availabiliyRouter.post("/", createAvailability)
availabiliyRouter.post("/bulk", createBulkAvailabilities)
availabiliyRouter.get("/doctor/:id", getAllAvailabilitiesByDoctor)
availabiliyRouter.get("/doctor/:id/slots", generateTimeSlotsController)
availabiliyRouter.delete("/:id", deleteAvailability)
availabiliyRouter.patch("/:id", updateAvailability)