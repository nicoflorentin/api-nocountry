import z from "zod"

export const AvailabilityUpdateSchema = z
	.object({
		dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], {
			message: "Día de la semana inválido",
		}),
		startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
			message: "Formato de hora inválido (debe ser HH:MM:SS)",
		}),
		endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
			message: "Formato de hora inválido (debe ser HH:MM:SS)",
		}),
		restStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
			message: "Formato de hora inválido (debe ser HH:MM:SS)",
		}),
		restEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
			message: "Formato de hora inválido (debe ser HH:MM:SS)",
		}),
		periodTime: z.number().refine((val) => [15, 30, 60].includes(val), {
			message: "El período debe ser 15, 30 o 60 minutos",
		}),
	})
	.refine((data) => data.startTime < data.endTime, {
		path: ["endTime"],
		message: "La hora de fin debe ser posterior a la hora de inicio",
	})
	.refine((data) => data.restStartTime < data.restEndTime, {
		path: ["restEndTime"],
		message: "La hora de fin del descanso debe ser posterior a la hora de inicio",
	})
