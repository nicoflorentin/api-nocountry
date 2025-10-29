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
  phone?: string;
  password: string;
  specialityId: number;
  licenseNumber: string;
  bio?: string;
}

export interface DoctorCreateByAdmin {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialtyId: number;
  licenseNumber: string;
  bio?: string;
}

export interface DoctorUpdate {
  id: number;
  firstName: string;
  lastName: string;
  specialityId: number;
  bio?: string;
  phone?: string;
}

export interface DoctorResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  speciality: string;
  licenseNumber: string;
  urlImage: string | null;
  isActive: boolean;
  phone: string | null;
  bio: string | null;
  specialtyId: number;
}
