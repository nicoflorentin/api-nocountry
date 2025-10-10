import z from "zod";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/;

export const PatientCreateSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre no puede estar vacio" }),
  lastName: z.string().min(1, { message: "El apellido no puede estar vacio" }),
  phone: z.string(),
  email: z.email({ message: "Email inválido" }),
  password: z.string().regex(passwordRegex, {
    message:
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
  }),
  repeatPassword: z.string().min(1).trim().min(1, { message: "Debes repetir la contraseña" }),
  dateOfBirth: z.preprocess(
      (val) => (typeof val === "string" || typeof val === "number" ? new Date(val) : val),
      z.date({ error: "Fecha inválida" })
    ),
  gender: z.string(),
  dni: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
  path: ["repeatPassword"],
  message: "Las contraseñas no coinciden",
});

