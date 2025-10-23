export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  urlImage?: string;
  role: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  createdAt?: Date;
}

export interface UserCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  repeatPassword: string;
}