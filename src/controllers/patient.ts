import { Request, Response } from "express";
import { makePatientService } from "../services/pacient";
import { PatientCreateSchema } from "../validations/patient";
import { PatientCreate } from "../models/patient";
import { UserResponse } from "../models/user";

let patientService: Awaited<ReturnType<typeof makePatientService>>;

(async () => {
  patientService = await makePatientService();
})()

export const createPatient = async (req: Request, res: Response) => {
  const result = PatientCreateSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const createUser: PatientCreate = result.data as PatientCreate;
    
    try {
      const user: UserResponse|null = await patientService.createPatient(createUser);
      return res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
}
