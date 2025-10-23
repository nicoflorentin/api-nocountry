import { Request, Response } from "express"
import { makePatientService } from "../services/patient"
import { PatientCreateByAdminSchema, PatientCreateSchema } from "../validations/patient"
import { PatientCreate, PatientCreateByAdmin, PatientResponse } from "../models/patient"
import { UserResponse } from "../models/user"

let patientService: Awaited<ReturnType<typeof makePatientService>>
	; (async () => {
		patientService = await makePatientService()
	})()

export const createPatient = async (req: Request, res: Response) => {
	const result = PatientCreateSchema.safeParse(req.body)
	console.log("result", result)
	if (!result.success) {
		return res.status(400).json({
			errors: result.error.issues.map((e) => ({
				field: e.path.join("."),
				message: e.message,
			})),
		})
	}

	const createUser: PatientCreate = result.data as PatientCreate

	try {
		const user: UserResponse | null = await patientService.createPatient(createUser)
		return res.status(200).json({ user })
	} catch (error: any) {
		console.error("Error fetching user:", error)
		if (error.code === "ER_DUP_ENTRY") {
			if (error.message.includes("email")){
				return res.status(409).json({
					error: "El email ya está registrado. Usa otro.",
				})
			} else if (error.message.includes("type_identification")) {
				return res.status(409).json({
					error: "La identificación ya está registrada.",
				})
			}
		}
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const getAllPatients = async (req: Request, res: Response) => {
	try {
		if (!patientService) {
			throw new Error("Patient service not initialized")
		}

		const limit = parseInt(req.query.limit as string) || 10
		const page = parseInt(req.query.page as string) || 1

		const { patients, total } = await patientService.getAllPatients(limit, page)
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<PatientResponse> = {
      data: patients,
      metadata: {
        total,
        page,
        limit,
        totalPages
      }
    };

		return res.status(200).json(response)
	} catch (error) {
		console.error("Error fetching patients:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const getPatientByID = async (req: Request, res: Response) => {
	try {
		if (!patientService) {
			throw new Error("Patient service not initialized")
		}

		const { id } = req.params
		const patient = await patientService.getPatientByID(id)

		return res.status(200).json({ patient })
	} catch (error) {
		if (error instanceof Error && error.message === "Patient not found") {
			return res.status(404).json({ error: "Patient not found" })
		}
		console.error("Error fetching patient:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const getPatientsByName = async (req: Request, res: Response) => {
	try {
		if (!patientService) {
			throw new Error("Patient service not initialized")
		}

		const { name } = req.query;
		if (typeof name === "string") {
			if (name.length < 3) {
				return res.status(400).json({ error: "el nombre debe tener al menos 3 caracteres" });
			}
		} else {
			return res.status(404).json({ error: "el nombre es requerido" });
		}

		const patients = await patientService.getPatientsByName(name)

		return res.status(200).json({ patients })
	} catch (error) {
		if (error instanceof Error && error.message === "Patient not found") {
			return res.status(404).json({ error: "Patient not found" })
		}
		console.error("Error fetching patient:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const createPatientByAdmin = async (req: Request, res: Response) => {
	const result = PatientCreateByAdminSchema.safeParse(req.body)
	console.log("result", result)
	if (!result.success) {
		return res.status(400).json({
			errors: result.error.issues.map((e) => ({
				field: e.path.join("."),
				message: e.message,
			})),
		})
	}

	const createUser: PatientCreateByAdmin = result.data as PatientCreateByAdmin

	try {
		const user: UserResponse | null = await patientService.createPatientByAdmin(createUser)
		return res.status(200).json({ user })
	} catch (error: any) {
		console.error("Error fetching user:", error)
		if (error.code === "ER_DUP_ENTRY") {
			if (error.message.includes("email")){
				return res.status(409).json({
					error: "El email ya está registrado. Usa otro.",
				})
			} else if (error.message.includes("type_identification")) {
				return res.status(409).json({
					error: "La identificación ya está registrada.",
				})
			}
		}
		return res.status(500).json({ error: "Internal server error" })
	}
}