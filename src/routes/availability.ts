import { Router } from "express"
import { getAllAvailabilities, getAvailabilitiesByDoctorID, testAvailability } from "../controllers/availability"

export const availabilityRouter = Router()

availabilityRouter.get("/test", testAvailability)
availabilityRouter.get("/", getAllAvailabilities)
availabilityRouter.get("/doctor/:id", getAvailabilitiesByDoctorID)
