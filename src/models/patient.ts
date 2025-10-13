export interface Patient {
  id: number;
  dateOfBirth: Date;
  dni: string;
  gender: string;
}

export interface PatientCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  repeatPassword: string;
  dateOfBirth: Date;
  gender: string;
  dni: string;
}