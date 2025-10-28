import { Router } from "express"
import {
	getAllDoctors,
	getDoctorByID,
	createDoctor,
	getDoctorsBySpecialtyID,
	getDoctorsByName,
	updateDoctor,
	getPatientByID,
	createDoctorByAdmin,
} from "../controllers/doctor"
import { get } from "http"
import { authMiddleware } from "../middleware/auth"
import { permissionRoleMiddleware } from "../middleware/permission_role"


export const doctor = Router()
doctor.get("/", getAllDoctors)
doctor.post("/create", createDoctor)
doctor.post("/create_by_admin", createDoctorByAdmin)
doctor.get("/search", getDoctorsByName)
doctor.put("/", updateDoctor)
doctor.get("/:id", getDoctorByID)
doctor.get("/patient/:id", getPatientByID)
doctor.get("/specialty/:id", getDoctorsBySpecialtyID)

doctor.put("/update", authMiddleware, permissionRoleMiddleware(["admin", "doctor"]), updateDoctor)