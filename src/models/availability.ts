export interface AvailabilityResponse {
	id: number
	doctor_id: number
	day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
	start_time: string // TIME en MySQL se mapea a string en formato 'HH:MM:SS'
	end_time: string // TIME en MySQL se mapea a string en formato 'HH:MM:SS'
	rest_start_time: string // TIME en MySQL se mapea a string en formato 'HH:MM:SS'
	rest_end_time: string // TIME en MySQL se mapea a string en formato 'HH:MM:SS'
	period_time: 15 | 30 | 60 // Se pueden acotar los valores posibles según la lógica del negocio
	created_at: Date // TIMESTAMP en MySQL se mapea a Date en TypeScript
	updated_at: Date // TIMESTAMP en MySQL se mapea a Date en TypeScript
}

/**
 * @description Campos requeridos para crear una nueva disponibilidad
 */
export interface AvailabilityCreate {
	doctor_id: number
	day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
	start_time: string
	end_time: string
	rest_start_time: string
	rest_end_time: string
	period_time: number
}