import { Request, Response } from "express"
import { makePatientService } from "../services/pacient"
import { PatientCreateSchema } from "../validations/patient"
import { PatientCreate } from "../models/patient"
import { UserResponse } from "../models/user"

let patientService: Awaited<ReturnType<typeof makePatientService>>
;(async () => {
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
	} catch (error) {
		console.error("Error fetching user:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const getAllPatients = () => {
	return async (req: Request, res: Response) => {
		try {
			if (!patientService) {
				throw new Error("Patient service not initialized")
			}

			const patients = await patientService.getAllPatients()

			return res.status(200).json({ patients })
		} catch (error) {
			console.error("Error fetching patients:", error)
			return res.status(500).json({ error: "Internal server error" })
		}
	}
}

export const getPatientByID = () => {
	return async (req: Request, res: Response) => {
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
}
