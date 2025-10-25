import { Doctor } from "./doctor";
import { Patient } from "./patient";

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  urlImage?: string;
  isActive: boolean;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  data: null | Patient | Doctor
}

