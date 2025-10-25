import { Router } from "express"
import { getAllAvailabilities, testAvailability } from "../controllers/availability"

export const availabiliyRouter = Router()

availabiliyRouter.get("/test", testAvailability)
availabiliyRouter.get("/", getAllAvailabilities)
