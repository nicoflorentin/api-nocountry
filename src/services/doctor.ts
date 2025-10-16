import { DoctorCreate, DoctorResponse } from "../models/doctor"
import { User, UserResponse } from "../models/user"
import { makeDoctorRepository } from "../repositories/doctor"
import { hashPassword } from "../utils/hash_password"

export async function makeDoctorService() {
	const medicRepository = await makeDoctorRepository()

	return {
		async getDoctorByID(id: string): Promise<DoctorResponse> {
			const medic = await medicRepository.getDoctorByID(Number(id))
			if (!medic) {
				throw new Error("Medic not found")
			}
			return medic
		},

		async getAllDoctors(): Promise<DoctorResponse[]> {
			return await medicRepository.getAllDoctors()
		},

		async createDoctor(doctorCreate: DoctorCreate): Promise<UserResponse> {
			doctorCreate.password = await hashPassword(doctorCreate.password)
			const user: User | null = await medicRepository.createDoctor(doctorCreate)

			if (!user) {
				throw new Error("Failed to create user")
			}

			return {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				createdAt: user.createdAt,
			}
		},
	}
}
