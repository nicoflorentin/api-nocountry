import { z } from "zod"

export interface LoginCredentials {
	email: string
	password: string
}

export const LoginSchema = z.object({
	email: z.email({ message: "Email inválido" }),
	// password: z.string().regex(passwordRegex, {
	//   message:
	//     "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
	// }),
	password: z.string().min(1, { message: "La contraseña no debe ser vacía" }),
	// .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
	// .refine((val) => /[A-Z]/.test(val), {
	//   message: "Debe contener al menos una letra mayúscula",
	// })
	// .refine((val) => /\d/.test(val), {
	//   message: "Debe contener al menos un número",
	// })
	// .refine((val) => /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]/.test(val), {
	//   message: "Debe contener al menos un carácter especial",
	// }),
})
