import { z } from "zod";

// Regex para validar formato DATE (YYYY-MM-DD) - Reutilizado o definido aquí
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
// Enum para tipos de sangre (opcional pero bueno para validación estricta)
const bloodTypeEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).nullable().optional();

// Esquema para HealthSummaryCreate (Datos opcionales de resumen de salud)
export const HealthSummaryCreateSchema = z.object({
    patient_id: z.number().int().positive(),
    summary_date: z.string().regex(dateRegex, { message: "Fecha del resumen inválida (YYYY-MM-DD)." }),
    temperature: z.number().positive().nullable().optional(),
    height: z.number().positive().nullable().optional(), // En cm o m según decidas
    weight: z.number().positive().nullable().optional(), // En kg
    systolic_pressure: z.number().int().positive().nullable().optional(),
    diastolic_pressure: z.number().int().positive().nullable().optional(),
    blood_type: bloodTypeEnum,
});

// Esquema para ConsultationDetailCreate (Datos obligatorios de la consulta)
export const ConsultationDetailCreateSchema = z.object({
    doctor_id: z.number().int().positive(),
    patient_id: z.number().int().positive(),
    appointment_id: z.number().int().positive(),
    reason_for_consultation: z.string().min(1, { message: "El motivo de la consulta no puede estar vacío." }),
    description: z.string().optional(),
    diagnosis: z.string().min(1, { message: "El diagnóstico no puede estar vacío." }),
    instructions: z.string().optional(),
    notes: z.string().optional(),
});

// Esquema principal para el Payload de Completar Consulta
export const CompleteConsultationPayloadSchema = z.object({
    consultation: ConsultationDetailCreateSchema, // La parte de consulta es obligatoria
    summary: HealthSummaryCreateSchema.optional(), // La parte de resumen es opcional
}).refine(data => {
    // Validación cruzada: Asegurar que patient_id coincida en ambos objetos si summary existe
    if (data.summary) {
        return data.consultation.patient_id === data.summary.patient_id;
    }
    return true; // Si no hay summary, la validación pasa
}, {
    message: "El ID del paciente en la consulta y el resumen de salud deben coincidir.",
    path: ["summary", "patient_id"], // Ruta del error si falla la validación cruzada
});
