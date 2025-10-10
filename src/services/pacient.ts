import { PatientCreate } from "../models/pacient";
import { User, UserCreate, UserResponse } from "../models/user";
import { makePatientRepository } from "../repositories/patient";
import { hashPassword } from "../utils/hash_password";

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
  };
}