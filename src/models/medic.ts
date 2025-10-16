import { User } from "./user";

export interface MedicCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  speciality: string;
  licenseNumber: string;
}

export interface MedicResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  speciality: string;
  licenseNumber: string;
}