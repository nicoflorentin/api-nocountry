import { AvailabilityResponse, AvailabilityUpdatePayload } from "../models/availability"
import { makeAvailabilityRepository } from "../repositories/availability"

export const makeAvailabilityService = async () => {
	// makeRepository
	const availabilityRepository = await makeAvailabilityRepository()

	return {
		async getAllAvailabilities(): Promise<AvailabilityResponse[]> {
			const availabilities = await availabilityRepository.getAllAvailabilities()
			return availabilities
		},

		async getAvailabilitiesByDoctorID(doctorId: string): Promise<AvailabilityResponse> {
			const availability = await availabilityRepository.getAvailabilitiesByDoctorID(Number(doctorId))
			return availability
		},

		async updateAvailabilityByDoctorID(
			doctorId: number,
			dayOfWeek: string,
			payload: AvailabilityUpdatePayload
		): Promise<AvailabilityResponse> {
			const availability = await availabilityRepository.updateAvailability(Number(doctorId), dayOfWeek, payload)
			return availability
		},
	}
}
