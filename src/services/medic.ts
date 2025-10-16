import { MedicResponse } from "../models/medic"
import { makeMedicRepository } from "../repositories/medic"

export async function makeMedicService() {
	const medicRepository = await makeMedicRepository()

	return {
		async getMedicByID(id: string): Promise<MedicResponse> {
			const medic = await medicRepository.getMedicByID(Number(id))
			if (!medic) {
				throw new Error("Medic not found")
			}
			return medic
		},

		async getAllMedics(): Promise<MedicResponse[]> {
			return await medicRepository.getAllMedics()
		},
	}
}
