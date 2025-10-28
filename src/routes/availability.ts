import { Router } from "express"
import { getAllAvailabilities, getAvailabilitiesByDoctorID, testAvailability, updateAvailability } from "../controllers/availability"

export const availabilityRouter = Router()

availabilityRouter.get("/test", testAvailability)
availabilityRouter.get("/", getAllAvailabilities)
availabilityRouter.get("/doctor/:id", getAvailabilitiesByDoctorID)
availabilityRouter.patch("/doctor/:doctorId/day/:day_of_week", updateAvailability)
