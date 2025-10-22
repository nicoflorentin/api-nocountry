export interface Patient {
  id: number;
  dateOfBirth: Date;
  typeIdentification: string;
  identification: string;
  nationality: string;
  gender: string;
}

export interface PatientResponse {
  id: number;
  user_id: number;
  firstName: string;
  lastName: string;
  email: string;
  urlImage: string | null;
  createdAt: Date;
  dateOfBirth: Date;
  gender: string;
  typeIdentification: string;
  identification: string;
  nationality: string;
  isActive: boolean;
  phone: string | null;
}

export interface PatientCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  repeatPassword: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  identification: string;
  typeIdentification: 'dni' | 'cc' | 'ci';
  nationality: string;
}

export interface PatientCreateByAdmin {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  identification: string;
  typeIdentification: 'dni' | 'cc' | 'ci';
  nationality: string;
}