import { Router } from "express"
import { createPatient, createPatientByAdmin, getAllPatients, getPatientByID, getPatientsByName, updatePatient,getMedicalHistoryController } from "../controllers/patient"
import { authMiddleware } from "../middleware/auth";

export const patient = Router()

patient.post("/create", createPatient)
patient.post("/create_by_admin", createPatientByAdmin)
patient.get("/", getAllPatients)
patient.get("/search", getPatientsByName)
patient.get("/:id", getPatientByID)
patient.patch("/:id", updatePatient)

patient.get("/:id/medical-history", authMiddleware, getMedicalHistoryController); 