import z from "zod";
import { fi } from "zod/v4/locales";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  created_at?: Date;
}

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/;

export interface UserCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  repeatPassword: string;
}

export const UserCreateSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre no puede estar vacio" }),
  lastName: z.string().min(1, { message: "El apellido no puede estar vacio" }),
  email: z.email({ message: "Email inválido" }),
  password: z.string().regex(passwordRegex, {
    message:
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
  }),
  repeatPassword: z.string().min(1).trim().min(1, { message: "Debes repetir la contraseña" }),
}).refine((data) => data.password === data.repeatPassword, {
  path: ["repeatPassword"],
  message: "Las contraseñas no coinciden",
});

export interface UserUpdate {
  name: string;
  email: string;
}

export const UserUpdateSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre no puede estar vacio" }),
  lastName: z.string().min(1, { message: "El apellido no puede estar vacio" }),
  email: z.email({ message: "Email inválido" }),
});
