export interface Doctor {
  id: number;
  speciality: string;
  licenseNumber: string;
  bio: string;
}

export interface DoctorCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  specialityId: number;
  licenseNumber: string;
}

export interface DoctorResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  speciality: string;
  licenseNumber: string;
}