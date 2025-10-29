import { z } from "zod";

// Regex para validar formato DATE (YYYY-MM-DD)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
// Regex para validar formato TIME (HH:MM:SS) o (HH:MM)
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

// Definiciones base para ENUMs
const statusEnum = z.enum(["confirmado", "cancelado", "completado", "ausente"], {
    message: "Estado de cita inválido."
});

const consultationTypeEnum = z.enum(["virtual", "presencial"], {
    message: "Tipo de consulta inválido."
});

// Esquema para la creación de una nueva cita
export const AppointmentCreateSchema = z.object({
    availability_id: z.number().int().positive({ message: "ID de disponibilidad debe ser positivo." }),
    doctor_id: z.number().int().positive({ message: "ID de doctor debe ser positivo." }),
    patient_id: z.number().int().positive({ message: "ID de paciente debe ser positivo." }),
    day: z.string().regex(dateRegex, { message: "Fecha de la cita inválida (formato YYYY-MM-DD)." }),
    start_time: z.string().regex(timeRegex, { message: "Hora de inicio inválida (formato HH:MM:SS)." }),
    end_time: z.string().regex(timeRegex, { message: "Hora de fin inválida (formato HH:MM:SS)." }),
    consultation_type: consultationTypeEnum,
}).superRefine((data, ctx) => {
    // Regla de negocio básica: Hora de inicio debe ser anterior a la hora de fin
    if (data.start_time >= data.end_time) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["end_time"],
            message: "La hora de fin debe ser posterior a la hora de inicio de la cita.",
        });
    }
});

// Esquema para la actualización parcial de la cita (método PATCH)
export const AppointmentUpdateSchema = AppointmentCreateSchema.partial();

// Esquema para la actualización del estado (métodos PATCH /cancel, /complete, /confirm)
export const AppointmentStatusUpdateSchema = z.object({
    status: statusEnum,
});

// Esquema para la validación de filtros de listado (query params)
export const AppointmentFilterSchema = z.object({
    status: statusEnum.optional(),
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)).pipe(z.number().int().min(1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)).pipe(z.number().int().min(1)),
});

export const BlockSlotCreateSchema = z.object({
    availability_id: z.number().int().positive(),
    doctor_id: z.number().int().positive(),
    day: z.string().regex(dateRegex, { message: "Fecha inválida (YYYY-MM-DD)." }),
    start_time: z.string().regex(timeRegex, { message: "Hora de inicio inválida (HH:MM:SS)." }),
    end_time: z.string().regex(timeRegex, { message: "Hora de fin inválida (HH:MM:SS)." }),
    reason: z.string().optional(), // Motivo opcional
}).superRefine((data, ctx) => {
    if (data.start_time >= data.end_time) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["end_time"],
            message: "La hora de fin debe ser posterior a la hora de inicio de la cita.",
        });
    }
});