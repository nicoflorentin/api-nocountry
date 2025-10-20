import { makeDoctorService } from "../services/doctor"
import { Request, Response } from "express"
import { DoctorCreateSchema, DoctorUpdateSchema } from "../validations/doctor";
import { DoctorCreate, DoctorUpdate } from "../models/doctor";
import { CurrentUser } from "../models/auth";

let doctorService: Awaited<ReturnType<typeof makeDoctorService>>
	; (async () => {
		doctorService = await makeDoctorService()
	})()

export const getAllDoctors = async (req: Request, res: Response) => {
	try {
		if (!doctorService) {
			throw new Error("Medic service not initialized")
		}

		const limit = parseInt(req.query.limit as string) || 10
		const page = parseInt(req.query.page as string) || 1
		const medics = await doctorService.getAllDoctors(limit, page)

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
	} catch (error: any) {
		console.error("Error fetching doctor:", error)
		if (error.code === "ER_DUP_ENTRY") {
			if (error.message.includes("email")) {
				return res.status(409).json({
					error: "El email ya está registrado. Usa otro.",
				})
			} else if (error.message.includes("license_number")) {
				return res.status(409).json({
					error: "El DNI ya está registrado. Usa otro.",
				})
			}
		}
	}
};

export const getPatientByID = async (req: Request, res: Response) => {
	try {
		if (!doctorService) {
			throw new Error("Patient service not initialized")
		}

		const userDoctor: CurrentUser = res.locals.user

		const { id } = req.params
		const patient = await doctorService.getPatientByID(id, userDoctor)

		return res.status(200).json({ patient })
	} catch (error) {
		if (error instanceof Error && error.message === "Patient not found") {
			return res.status(404).json({ error: "Patient not found" })
		}
		console.error("Error fetching patient:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
};

export const getDoctorsBySpecialtyID = async (req: Request, res: Response) => {
	try {
		if (!doctorService) {
			throw new Error("Patient service not initialized")
		}

		const limit = parseInt(req.query.limit as string) || 10
		const page = parseInt(req.query.page as string) || 1

		const { id } = req.params
		const doctors = await doctorService.getDoctorsBySpecialtyID(id, limit, page)

		return res.status(200).json({ doctors })
	} catch (error) {
		if (error instanceof Error && error.message === "Patient not found") {
			return res.status(404).json({ error: "Patient not found" })
		}
		console.error("Error fetching patient:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
};

export const getDoctorsByName = async (req: Request, res: Response) => {
	try {
		if (!doctorService) {
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

		const doctors = await doctorService.getDoctorsByName(name)

		return res.status(200).json({ doctors })
	} catch (error) {
		if (error instanceof Error && error.message === "Patient not found") {
			return res.status(404).json({ error: "Patient not found" })
		}
		console.error("Error fetching patient:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
};

export const updateDoctor = async (req: Request, res: Response) => {
	try {
		if (!doctorService) {
			throw new Error("Patient service not initialized")
		}

		const result = DoctorUpdateSchema.safeParse(req.body);
		console.log("result", result)
		if (!result.success) {
			return res.status(400).json({
				errors: result.error.issues.map((e) => ({
					field: e.path.join("."),
					message: e.message,
				})),
			})
		}

		const updateDoctor: DoctorUpdate = result.data as any;

		const medic = await doctorService.updateDoctor(updateDoctor);

		return res.status(200).json({ medic })
	} catch (error) {
		if (error instanceof Error && error.message === "Patient not found") {
			return res.status(404).json({ error: "Patient not found" })
		}
		console.error("Error fetching patient:", error)
		return res.status(500).json({ error: "Internal server error" })
	}
};
