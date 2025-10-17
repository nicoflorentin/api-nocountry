import { Doctor } from "./doctor";
import { Patient } from "./patient";

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  url_image?: string;
  createdAt?: Date;
  updatedAt?: Date;
  data: null | Patient | Doctor
}

