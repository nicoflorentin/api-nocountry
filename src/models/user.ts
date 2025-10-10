import z from "zod";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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