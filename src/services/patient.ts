import { createPatientByAdmin } from "../controllers/patient";
import { PatientCreate, PatientCreateByAdmin, PatientResponse } from "../models/patient";
import { User, UserCreate, UserResponse } from "../models/user";
import { makePatientRepository } from "../repositories/patient";
import { sendEmailCreateUser } from "../utils/email";
import { genericPassword } from "../utils/generic_pass";
import { hashPassword } from "../utils/hash_password";
import { PatientUpdate } from "../models/patient";

export async function makePatientService() {
  const patientRepository = await makePatientRepository();

  return {
    async createPatient(createPatient: PatientCreate): Promise<UserResponse | null> {
      createPatient.password = await hashPassword(createPatient.password);

      const user: User | null = await patientRepository.createPatient(createPatient);

      if (user == null) {
        return null;
      }

      const userResponse: UserResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      };

      return userResponse;
    },

    async getAllPatients(limit: number, page: number): Promise<{ patients: PatientResponse[], total: number }> {
      return await patientRepository.getAllPatients(limit, page);
    },

    async getPatientByID(id: string): Promise<PatientResponse> {
      const patient = await patientRepository.getPatientByID(Number(id));
      if (!patient) {
        throw new Error('Patient not found');
      }
      return patient;
    },

    async getPatientsByName(name: string): Promise<PatientResponse[]> {
      return await patientRepository.getPatientsByName(name)
    },

    async createPatientByAdmin(createPatient: PatientCreateByAdmin): Promise<UserResponse | null> {
      const pass = genericPassword();
      const hashedPassword = await hashPassword(pass);

      const user: User | null = await patientRepository.createPatientByAdmin(createPatient, hashedPassword);

      if (user == null) {
        return null;
      }

      const name = `${createPatient.firstName} ${createPatient.lastName}`
      const email = createPatient.email
      await sendEmailCreateUser(name, email, pass)

      const userResponse: UserResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      };

      return userResponse;
    },

    async updatePatient(id: string, patientUpdate: PatientUpdate): Promise<PatientResponse> {
      
      const updatedPatient = await patientRepository.updatePatient(Number(id), patientUpdate);

      if (!updatedPatient) {
        throw new Error('Patient not found');
      }

      return updatedPatient;
    },
  };
}