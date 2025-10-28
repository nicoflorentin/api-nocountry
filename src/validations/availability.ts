// src/validations/availability.ts

import { z } from "zod";

// Regex para validar formato TIME (HH:MM:SS) o (HH:MM)
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/; 

export const AvailabilityCreateSchema = z.object({
  doctor_id: z.number().int().positive({ message: "El ID del doctor debe ser un entero positivo." }),
  day_of_week: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], {
    message: "Día de la semana inválido.",
  }),
  start_time: z.string().regex(timeRegex, { message: "Hora de inicio inválida (formato HH:MM:SS)." }),
  end_time: z.string().regex(timeRegex, { message: "Hora de fin inválida (formato HH:MM:SS)." }),
  rest_start_time: z.string().regex(timeRegex, { message: "Hora de inicio de descanso inválida." }),
  rest_end_time: z.string().regex(timeRegex, { message: "Hora de fin de descanso inválida." }),
  period_time: z.number().int().positive().multipleOf(5, { message: "El periodo debe ser múltiplo de 5 minutos." }),
}).superRefine((data, ctx) => {
    // Regla de negocio: Hora de inicio debe ser anterior a la hora de fin
    if (data.start_time >= data.end_time) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["end_time"],
            message: "La hora de fin debe ser posterior a la hora de inicio de jornada.",
        });
    }
}); // Simplificado por espacio

export const AvailabilityUpdateSchema = AvailabilityCreateSchema.partial();

export const AvailabilityBulkSchema = z.array(AvailabilityCreateSchema);