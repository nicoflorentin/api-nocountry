import { Request, Response } from "express"
import { makePatientService } from "../services/patient"
import { PatientCreateByAdminSchema, PatientCreateSchema } from "../validations/patient"
import { PatientCreate, PatientCreateByAdmin, PatientResponse } from "../models/patient"
import { UserResponse } from "../models/user"
import { SpecialtyResponse } from "../models/specialty"
import { makeSpecialtyService } from "../services/specialty"

let specialtyService: Awaited<ReturnType<typeof makeSpecialtyService>>
  ; (async () => {
    specialtyService = await makeSpecialtyService()
  })()

export const getAllSpecialties = async (req: Request, res: Response) => {
  try {
    if (!specialtyService) {
      throw new Error("Specilty service not initialized")
    }

    const specilties: SpecialtyResponse[] = await specialtyService.getAllSpecialties()
    return res.status(200).json(specilties)
  } catch (error) {
    console.error("Error fetching patients:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}