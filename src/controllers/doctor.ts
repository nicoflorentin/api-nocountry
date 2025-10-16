import { makeDoctorService } from "../services/doctor"
import { Request, Response } from "express"
import { DoctorCreateSchema } from "../validations/doctor";
import { DoctorCreate } from "../models/doctor";

let doctorService: Awaited<ReturnType<typeof makeDoctorService>>
	; (async () => {
		doctorService = await makeDoctorService()
	})()

export const getAllDoctors = async (req: Request, res: Response) => {
	try {
		if (!doctorService) {
			throw new Error("Medic service not initialized")
		}
		const medics = await doctorService.getAllDoctors()

		return res.status(200).json({ medics })
	} catch (error) {
		console.error("Error fetching medics:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}

export const getDoctorByID = async (req: Request, res: Response) => {
	try {
		if (!doctorService) {
			throw new Error('Medic service not initialized')
		}

		const { id } = req.params
		const medic = await doctorService.getDoctorByID(id)

		return res.status(200).json({ medic })
	} catch (error) {
		if (error instanceof Error && error.message === 'Medic not found') {
			return res.status(404).json({ error: 'Medic not found' })
		}
		console.error('Error fetching medic:', error)
		return res.status(500).json({ error: 'Internal server error' })
	}
}

export const createDoctor = async (req: Request, res: Response) => {
	const result = DoctorCreateSchema.safeParse(req.body)
	console.log("result", result)
	if (!result.success) {
		return res.status(400).json({
			errors: result.error.issues.map((e) => ({
				field: e.path.join("."),
				message: e.message,
			})),
		})
	}

	const createDoctor: DoctorCreate = result.data as any

	try {
		const user: any = await doctorService.createDoctor(createDoctor)
		return res.status(200).json({ user })
	} catch (error) {
		console.error("Error fetching user:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
}
