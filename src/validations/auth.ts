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

export const ChangePasswordSchema = z.object({
	currentPassword: z.string().min(1, { message: "La contraseña actual no puede estar vacía" }),
	newPassword: z.string().min(1, { message: "La nueva contraseña no puede estar vacía" }),
	// newPassword: z.string().regex(passwordRegex, {
	// 	message: "La nueva contraseña debe cumplir con los requisitos de seguridad.",
	// }),
	repeatNewPassword: z.string().min(1).trim().min(1, { message: "Debes repetir la nueva contraseña" }),
}).refine((data) => data.newPassword === data.repeatNewPassword, {
	path: ["repeatNewPassword"],
	message: "Las contraseñas nuevas no coinciden",
}).superRefine((data, ctx) => {
	if (data.currentPassword === data.newPassword) {
		ctx.addIssue({
			code: "custom",
			path: ["newPassword"],
			message: "La nueva contraseña no puede ser igual a la contraseña actual.",
		});
	}
});
