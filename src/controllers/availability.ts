// src/controllers/availability.ts

import { Request, Response } from "express"
import { makeAvailabilityService } from "../services/availability"
import { AvailabilityCreateSchema, AvailabilityUpdateSchema, AvailabilityBulkSchema } from "../validations/availability"
import { AvailabilityCreate } from "../models/availability"

let availavilityService: Awaited<ReturnType<typeof makeAvailabilityService>>
	; (async () => {
		availavilityService = await makeAvailabilityService()
	})()

// Helper para manejar el servicio no inicializado 
const getService = () => {
	if (!availavilityService) {
		throw new Error("Availability service not initialized")
	}
	return availavilityService;
}

const handleServiceError = (res: Response, error: any) => {
	console.error("Error processing availability request:", error);
	if (error instanceof Error && error.message.includes("not found")) {
		return res.status(404).json({ error: error.message });
	}
	// Manejo de errores de duplicación u otros (ej. ER_DUP_ENTRY)
	return res.status(500).json({ error: "Internal server error" });
};


// ---------------------- CREATE ----------------------
export const createAvailability = async (req: Request, res: Response) => {
	const result = AvailabilityCreateSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ errors: result.error.issues });
	}
	try {
		const data: AvailabilityCreate = result.data as AvailabilityCreate;
		const created = await getService().createAvailability(data);
		return res.status(201).json(created);
	} catch (error) {
		return handleServiceError(res, error);
	}
};

// ---------------------- CREATE BULK ----------------------
export const createBulkAvailabilities = async (req: Request, res: Response) => {
	const result = AvailabilityBulkSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ errors: result.error.issues });
	}
	try {
		const data: AvailabilityCreate[] = result.data as AvailabilityCreate[];
		const created = await getService().createBulkAvailabilities(data);
		return res.status(201).json(created);
	} catch (error) {
		return handleServiceError(res, error);
	}
};

// ---------------------- GET ALL BY DOCTOR ----------------------
export const getAllAvailabilitiesByDoctor = async (req: Request, res: Response) => {
	try {
		const { id } = req.params; // doctorId
		const availabilities = await getService().getAllByDoctorId(id);
		if (availabilities.length === 0) {
			return res.status(200).json([]); // Devuelve array vacío si no hay nada
		}
		return res.status(200).json(availabilities);
	} catch (error) {
		return handleServiceError(res, error);
	}
};

// ---------------------- UPDATE ----------------------
export const updateAvailability = async (req: Request, res: Response) => {
	const result = AvailabilityUpdateSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ errors: result.error.issues });
	}
	try {
		const { id } = req.params;
		const data: Partial<AvailabilityCreate> = result.data as Partial<AvailabilityCreate>;
		const updated = await getService().updateAvailability(id, data);
		return res.status(200).json(updated);
	} catch (error) {
		return handleServiceError(res, error);
	}
};

// ---------------------- DELETE ----------------------
export const deleteAvailability = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const success = await getService().deleteAvailability(id);
		return res.status(204).send();
	} catch (error) {
		return handleServiceError(res, error);
	}
};

export const generateTimeSlotsController = async (req: Request, res: Response) => {
	try {
		const { id } = req.params; // doctorId
		const slotsByDay = await getService().generateTimeSlots(id);

		return res.status(200).json(slotsByDay);
	} catch (error) {
		// Manejar errores como "Doctor not found"
		return handleServiceError(res, error);
	}
};

