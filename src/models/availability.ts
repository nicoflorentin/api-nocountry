export interface AvailabilityResponse {
	id: number
	doctor_id: number
	day_of_week: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
	start_time: string // TIME en MySQL se mapea a string en formato 'HH:MM:SS'
	end_time: string // TIME en MySQL se mapea a string en formato 'HH:MM:SS'
	rest_start_time: string // TIME en MySQL se mapea a string en formato 'HH:MM:SS'
	rest_end_time: string // TIME en MySQL se mapea a string en formato 'HH:MM:SS'
	period_duration: 15 | 30 | 60 // Se pueden acotar los valores posibles según la lógica del negocio
	created_at: Date // TIMESTAMP en MySQL se mapea a Date en TypeScript
}

type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

export interface AvailabilityUpdatePayload {
	dayOfWeek?: DayOfWeek
	startTime?: string
	endTime?: string
	restStartTime?: string
	restEndTime?: string
	periodTime?: number
}
