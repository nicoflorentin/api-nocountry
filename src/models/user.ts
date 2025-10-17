export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  phone_code?: string;
  password: string;
  url_image?: string;
  role: string;
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