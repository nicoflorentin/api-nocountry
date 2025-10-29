import { RowDataPacket } from "mysql2";

// Representa una fila de la tabla health_summaries
export interface HealthSummary extends RowDataPacket {
    id: number;
    patient_id: number;
    summary_date: string; // DATE -> string YYYY-MM-DD
    temperature?: number | null;
    height?: number | null;
    weight?: number | null;
    systolic_pressure?: number | null;
    diastolic_pressure?: number | null;
    blood_type?: string | null;
    created_at: Date;
    updated_at: Date;
}

// Interfaz auxiliar para crear un HealthSummary (sin IDs automáticos)
export interface HealthSummaryCreate {
    patient_id: number;
    summary_date: string; // Fecha en que se tomaron los datos
    temperature?: number | null;
    height?: number | null;
    weight?: number | null;
    systolic_pressure?: number | null;
    diastolic_pressure?: number | null;
    blood_type?: string | null;
}


// Representa una fila de la tabla medical_consultations_detail
export interface MedicalConsultationDetail extends RowDataPacket {
    id: number;
    doctor_id: number;
    patient_id: number;
    appointment_id: number;
    reason_for_consultation: string;
    description?: string | null;
    diagnosis: string;
    instructions?: string | null;
    notes?: string | null;
    created_at: Date; // Fecha de la consulta
    updated_at: Date;
    // Campos opcionales del JOIN con appointment/doctor si se necesitan
    appointment_day?: string;
    appointment_start_time?: string;
    doctor_first_name?: string;
    doctor_last_name?: string;
}

/**
 * @description Datos necesarios para crear un nuevo registro de detalle de consulta médica.
 */
export interface ConsultationDetailCreate {
    doctor_id: number;       // ID del doctor que realiza la consulta
    patient_id: number;      // ID del paciente atendido
    appointment_id: number; // ID de la cita a la que corresponde este detalle
    reason_for_consultation: string; // Motivo principal
    description?: string;     // Descripción adicional del motivo
    diagnosis: string;       // Diagnóstico realizado por el doctor
    instructions?: string;    // Instrucciones para el paciente
    notes?: string;           // Notas adicionales del doctor
}


// Estructura de la respuesta para el endpoint de historial médico
export interface MedicalHistoryResponse {
    patientId: number;
    healthSummaries: HealthSummary[];
    consultationDetails: MedicalConsultationDetail[];
}

/**
 * @description Payload esperado en el body de POST /api/consultations.
 * Incluye los detalles de la consulta y opcionalmente un resumen de salud.
 */
export interface CompleteConsultationPayload {
    consultation: ConsultationDetailCreate; // Datos obligatorios de la consulta
    summary?: HealthSummaryCreate;          // Datos opcionales del resumen de salud
}

