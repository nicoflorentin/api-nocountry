import z from "zod";

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/;

export const DoctorCreateSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre no puede estar vacio" }),
  lastName: z.string().min(1, { message: "El apellido no puede estar vacio" }),
  phone: z.string(),
  email: z.email({ message: "Email inválido" }),
  password: z.string().regex(passwordRegex, {
    message:
      "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
  }),
  repeatPassword: z.string().min(1).trim().min(1, { message: "Debes repetir la contraseña" }),
  licenseNumber: z.string(),
  bio: z.string(),
  specialityId: z.number(),
}).refine((data) => data.password === data.repeatPassword, {
  path: ["repeatPassword"],
  message: "Las contraseñas no coinciden",
});

export const DoctorUpdateSchema = z.object({
  id: z.number(),
  firstName: z.string().min(1, { message: "El nombre no puede estar vacio" }),
  lastName: z.string().min(1, { message: "El apellido no puede estar vacio" }),
  phone: z.string(),
  // email: z.email({ message: "Email inválido" }),
  // password: z.string().regex(passwordRegex, {
  //   message:
  //     "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial",
  // }),
  // repeatPassword: z.string().min(1).trim().min(1, { message: "Debes repetir la contraseña" }),
  // licenseNumber: z.string(),
  bio: z.string(),
  specialityId: z.number(),
// }).refine((data) => data.password === data.repeatPassword, {
//   path: ["repeatPassword"],
//   message: "Las contraseñas no coinciden",
});

export const DoctorCreateByAdminSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre no puede estar vacio" }),
  lastName: z.string().min(1, { message: "El apellido no puede estar vacio" }),
  phone: z.string(),
  email: z.email({ message: "Email inválido" }),
  licenseNumber: z.string().min(1, { message: "La licencia no puede estar vacia" }),
  bio: z.string(),
  specialtyId: z.number().min(1, { message: "La especialidad no puede estar vacia" }),
});