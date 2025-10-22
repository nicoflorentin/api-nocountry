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
  gender: z.enum(["male", "female", "other"], {
    message: "El sexo debe ser masculino, femenino u otro",
  }),
  nationality: z.string().min(1, { message: "La nacionalidad no puede estar vacia" }),
  typeIdentification: z.enum(["dni", "cc", "ci"], {
    message: "El tipo de identificación debe ser DNI, CC o CI",
  }),
  identification: z.string(),
}).refine((data) => data.password === data.repeatPassword, {
  path: ["repeatPassword"],
  message: "Las contraseñas no coinciden",
}).superRefine((data, ctx) => {
  const { typeIdentification, identification } = data;

  if (typeIdentification === "dni") {
    if (!/^\d{7,8}$/.test(identification)) {
      ctx.addIssue({
        code: "custom", // 👈 obligatorio
        path: ["identification"],
        message: "El DNI debe tener entre 7 y 12 dígitos numéricos",
      });
    }
  }

  if (typeIdentification === "cc") {
    if (!/^\d{6,10}$/.test(identification)) {
      ctx.addIssue({
        code: "custom",
        path: ["identification"],
        message: "La CC debe tener entre 6 y 10 dígitos numéricos",
      });
    }
  }

  if (typeIdentification === "ci") {
    if (!/^[A-Za-z0-9]{6,12}$/.test(identification)) {
      ctx.addIssue({
        code: "custom",
        path: ["identification"],
        message:
          "La CI debe tener entre 6 y 12 caracteres alfanuméricos (letras o números)",
      });
    }
  }
});

