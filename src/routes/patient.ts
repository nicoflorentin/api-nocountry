import { Router } from "express"
import { createPatient, createPatientByAdmin, getAllPatients, getPatientByID, getPatientsByName, updatePatient } from "../controllers/patient"

export const patient = Router()

patient.post("/create", createPatient)
patient.post("/create_by_admin", createPatientByAdmin)
patient.get("/", getAllPatients)
patient.get("/search", getPatientsByName)
patient.get("/:id", getPatientByID)
patient.patch("/:id", updatePatient)