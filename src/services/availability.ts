import { AvailabilityResponse } from "../models/availability"
import { makeAvailabilityRepository } from "../repositories/availability"

export const makeAvailabilityService = async () => {
	// makeRepository
	const availabilityRepository = await makeAvailabilityRepository()

	return {
		async getAllAvailabilities(): Promise<AvailabilityResponse[]> {
			const availabilities = await availabilityRepository.getAllAvailabilities()

			return availabilities
		},
	}
}
