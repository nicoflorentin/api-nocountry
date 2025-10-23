import { SpecialtyResponse } from "../models/specialty";
import { makeSpecialtyRepository } from "../repositories/specialty";

export async function makeSpecialtyService() {
  const specialtyRepository = await makeSpecialtyRepository();

  return {
    async getAllSpecialties(): Promise<SpecialtyResponse[]> {
      return await specialtyRepository.getAllSpecialties();
    },
  };
}