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
  createdAt: Date;
  dateOfBirth: Date;
  gender: string;
  typeIdentification: string;
  identification: string;
  nationality: string;
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