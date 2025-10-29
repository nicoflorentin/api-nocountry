// src/models/appointment.ts

/**
 * @description Estados posibles de una cita médica, reflejando el ENUM en la DB.
 */
export type AppointmentStatus = 'confirmado' | 'cancelado' | 'completado' | 'ausente'; 

/**
 * @description Tipo de consulta, reflejando el ENUM en la DB.
 */
export type ConsultationType = 'virtual' | 'presencial';

/**
 * @description Estructura de la cita tal como se almacena/retorna de la DB (snake_case).
 */
export interface AppointmentResponse {
    id: number;
    availability_id: number;
    doctor_id: number;
    patient_id: number | null; // Puede ser nulo si la cita es un bloqueo o no está asignada
    day: string;              // Formato DATE (YYYY-MM-DD)
    start_time: string;       // Formato TIME (HH:MM:SS)
    end_time: string;         // Formato TIME (HH:MM:SS)
    status: AppointmentStatus;
    consultation_type: ConsultationType;
    created_at: Date;
    updated_at: Date;
}

/**
 * @description Campos necesarios para crear una nueva cita.
 */
export interface AppointmentCreate {
    availability_id: number;
    doctor_id: number;
    patient_id: number;
    day: string;
    start_time: string;
    end_time: string;
    consultation_type: ConsultationType;
}

/**
 * @description Estructura de la cita para reportes o respuestas detalladas (con JOIN).
 * Incluye la información básica del doctor y paciente.
 */
export interface AppointmentDetailResponse extends AppointmentResponse {
    doctorFirstName: string;
    doctorLastName: string;
    patientFirstName: string | null;
    patientLastName: string | null;
    specialityName: string;
}

/**
 * @description Estructura para representar un slot de tiempo disponible.
 */
export interface TimeSlot {
    start: string; // HH:MM:SS
    end: string;   // HH:MM:SS
}

/**
 * @description Datos necesarios para bloquear un slot de tiempo específico.
 */
export interface BlockSlotCreate {
    availability_id: number; // Referencia a la regla de disponibilidad
    doctor_id: number;
    day: string;          // YYYY-MM-DD
    start_time: string;   // HH:MM:SS
    end_time: string;     // HH:MM:SS
    reason?: string;      // Opcional: Motivo del bloqueo
}
