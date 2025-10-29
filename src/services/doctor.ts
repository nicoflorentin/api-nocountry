import { CurrentUser } from "../models/auth"
import { DoctorCreate, DoctorCreateByAdmin, DoctorResponse, DoctorUpdate } from "../models/doctor"
import { PatientResponse } from "../models/patient"
import { User, UserResponse } from "../models/user"
import { makeDoctorRepository } from "../repositories/doctor"
import { sendEmailCreateUser } from "../utils/email"
import { genericPassword } from "../utils/generic_pass"
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

		async getAllDoctors(limit: number, page: number): Promise<{ doctors: DoctorResponse[], total: number }> {
			return await medicRepository.getAllDoctors(limit, page)
		},

		async createDoctor(doctorCreate: DoctorCreate): Promise<UserResponse> {
			doctorCreate.password = await hashPassword(doctorCreate.password)
			const user: DoctorResponse | null = await medicRepository.createDoctor(doctorCreate)

			if (!user) {
				throw new Error("Failed to create user")
			}

			return {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				createdAt: user.createdAt,
			}
		},

		async createDoctorByAdmin(doctorCreate: DoctorCreateByAdmin): Promise<UserResponse> {
			const password = genericPassword()
			const hashedPassword = await hashPassword(password)
			const user: User | null = await medicRepository.createDoctorByAdmin(doctorCreate, hashedPassword)

			if (!user) {
				throw new Error("Failed to create user")
			}

			const name = `${doctorCreate.firstName} ${doctorCreate.lastName}`
			const email = doctorCreate.email
			await sendEmailCreateUser(name, email, password)

			return {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				createdAt: user.createdAt,
			}
		},

		async getPatientByID(id: string, userDoctor: CurrentUser): Promise<PatientResponse | null> {
			return await medicRepository.getPatientByID(Number(id), userDoctor)
		},

		async getDoctorsBySpecialtyID(id: string, limit: number, page: number): Promise<{ doctors: DoctorResponse[], total: number }> {
			return await medicRepository.getDoctorsBySpecialtyID(Number(id), limit, page)
		},

		async getDoctorsByName(name: string): Promise<DoctorResponse[]> {
			return await medicRepository.getDoctorsByName(name)
		},

		async updateDoctor(doctorUpdate: DoctorUpdate): Promise<boolean> {
			return await medicRepository.updateDoctor(doctorUpdate)
		},

	}
}
