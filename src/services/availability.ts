// src/services/availability.ts

import { AvailabilityCreate, AvailabilityResponse } from "../models/availability"
import { makeAvailabilityRepository, AvailabilityRepository } from "../repositories/availability"
import { DoctorRepository, makeDoctorRepository } from "../repositories/doctor"
import { AvailabilityCreateSchema, AvailabilityUpdateSchema } from "../validations/availability";

// --- Tipos Auxiliares para la respuesta del generador de slots ---
export interface TimeSlot {
	start: string; // HH:MM:SS
	end: string;   // HH:MM:SS
}

export interface AvailabilityService {
	createAvailability(data: AvailabilityCreate): Promise<AvailabilityResponse>
	createBulkAvailabilities(data: AvailabilityCreate[]): Promise<AvailabilityResponse[]>
	getAvailabilityById(id: string): Promise<AvailabilityResponse>
	getAllByDoctorId(doctorId: string): Promise<AvailabilityResponse[]>
	updateAvailability(id: string, data: Partial<AvailabilityCreate>): Promise<AvailabilityResponse>
	deleteAvailability(id: string): Promise<boolean>

	// Método de generación de slots
	generateTimeSlots(doctorId: string): Promise<Record<string, TimeSlot[]>>;
}

// --- UTILIDADES DE TIEMPO ---
const timeToMinutes = (time: string): number => {
	const [h, m, s] = time.split(':').map(Number);
	return h * 60 + m + (s / 60 || 0);
};

const minutesToTime = (minutes: number): string => {
	const totalSeconds = Math.round(minutes * 60);
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
};
// -----------------------------

export const makeAvailabilityService = async (): Promise<AvailabilityService> => {
	// 1. INYECCIÓN DE DEPENDENCIAS
	const availabilityRepository: AvailabilityRepository = await makeAvailabilityRepository()
	const doctorRepository: DoctorRepository = await makeDoctorRepository()

	const verifyDoctorExists = async (doctorId: number): Promise<void> => {
		const doctor = await doctorRepository.getDoctorByID(doctorId)
		if (!doctor) {
			throw new Error(`Doctor with ID ${doctorId} not found.`)
		}
	}

	// 2. DEFINICIÓN DEL OBJETO SERVICE 
	const service: AvailabilityService = {

		// --- Métodos CRUD ya definidos ---
		async createAvailability(data: AvailabilityCreate): Promise<AvailabilityResponse> {
			await verifyDoctorExists(data.doctor_id);
			return await availabilityRepository.createAvailability(data);
		},
		async createBulkAvailabilities(data: AvailabilityCreate[]): Promise<AvailabilityResponse[]> {
			if (data.length > 0) {
				await verifyDoctorExists(data[0].doctor_id);
			}
			return await availabilityRepository.createBulkAvailabilities(data);
		},
		async getAvailabilityById(id: string): Promise<AvailabilityResponse> {
			const avail = await availabilityRepository.getAvailabilityById(Number(id))
			if (!avail) {
				throw new Error("Availability not found")
			}
			return avail
		},
		async getAllByDoctorId(doctorId: string): Promise<AvailabilityResponse[]> {
			return await availabilityRepository.getAllByDoctorId(Number(doctorId))
		},
		async updateAvailability(id: string, data: Partial<AvailabilityCreate>): Promise<AvailabilityResponse> {
			if (data.doctor_id) {
				await verifyDoctorExists(data.doctor_id)
			}
			const updated = await availabilityRepository.updateAvailability(Number(id), data)
			if (!updated) {
				const existing = await service.getAvailabilityById(id);
				if (!existing) {
					throw new Error("Availability not found");
				}
				return existing;
			}
			return updated;
		},
		async deleteAvailability(id: string): Promise<boolean> {
			const success = await availabilityRepository.deleteAvailability(Number(id))
			if (!success) {
				const existing = await service.getAvailabilityById(id);
				if (!existing) {
					throw new Error("Availability not found");
				}
				throw new Error("Deletion failed due to unknown database error");
			}
			return success
		},

		// ---------------------- GENERATE TIME SLOTS----------------------
		async generateTimeSlots(doctorId: string): Promise<Record<string, TimeSlot[]>> {
			const id = Number(doctorId);
			await verifyDoctorExists(id); 

			// Obtener todas las disponibilidades fijas para el doctor
			const availabilities = await availabilityRepository.getAllByDoctorId(id);

			const slotsByDay: Record<string, TimeSlot[]> = {};

			for (const avail of availabilities) {
				const day = avail.day_of_week;
				slotsByDay[day] = slotsByDay[day] || [];

				// Convertir todos los tiempos a minutos para un cálculo preciso
				const startMins = timeToMinutes(avail.start_time);
				const endMins = timeToMinutes(avail.end_time);
				const restStartMins = timeToMinutes(avail.rest_start_time);
				const restEndMins = timeToMinutes(avail.rest_end_time);
				const period = avail.period_time;

				let currentSlotStart = startMins;

				//  Iterar y generar slots
				while (currentSlotStart + period <= endMins) {
					const currentSlotEnd = currentSlotStart + period;

					// Verificar si el slot interfiere con el período de descanso
					const overlapsRest = (
						// El slot empieza en el descanso O
						(currentSlotStart >= restStartMins && currentSlotStart < restEndMins) ||
						// El slot termina en el descanso O
						(currentSlotEnd > restStartMins && currentSlotEnd <= restEndMins) ||
						// El slot envuelve el descanso
						(currentSlotStart < restStartMins && currentSlotEnd > restEndMins)
					);

					if (!overlapsRest) {
						slotsByDay[day].push({
							start: minutesToTime(currentSlotStart),
							end: minutesToTime(currentSlotEnd),
						});
					}

					// Mover al siguiente slot, saltando el tiempo de descanso
					if (currentSlotEnd <= restStartMins) {
						currentSlotStart = currentSlotEnd; // Continúa normal
					} else if (currentSlotStart < restEndMins) {
						currentSlotStart = restEndMins; // Salta al final del descanso
					} else {
						currentSlotStart = currentSlotEnd; // Continúa normal después del descanso
					}
				}
			}

			return slotsByDay;
		},
	}

	return service
}