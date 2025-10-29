import { AppointmentCreate, AppointmentDetailResponse, AppointmentResponse, AppointmentStatus, TimeSlot, BlockSlotCreate } from "../models/appointment";
import { makeAppointmentRepository, AppointmentRepository } from "../repositories/appointment";
import { makeDoctorRepository, DoctorRepository } from "../repositories/doctor";
import { makePatientRepository } from "../repositories/patient";
import { AvailabilityRepository, makeAvailabilityRepository } from "../repositories/availability";
import { CompleteConsultationPayload, ConsultationDetailCreate, HealthSummaryCreate, MedicalConsultationDetail } from "../models/medical_history";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

// --- UTILIDADES DE TIEMPO ---
const timeToMinutes = (time: string): number => {
    try {
        const parts = time.split(':').map(Number);
        if (parts.length < 2 || parts.some(isNaN)) return 0;
        const [h, m, s = 0] = parts;
        return h * 60 + m + (s / 60);
    } catch (e) { console.error(`Error converting time ${time} to minutes:`, e); return 0; }
};

const minutesToTime = (minutes: number): string => {
    try {
        if (isNaN(minutes) || minutes < 0) return "00:00:00";
        const totalSeconds = Math.round(minutes * 60);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
    } catch (e) { console.error(`Error converting minutes ${minutes} to time:`, e); return "00:00:00"; }
};
// -----------------------------

export interface AppointmentService {
    createAppointment(data: AppointmentCreate): Promise<AppointmentResponse>;
    getAppointmentById(id: string): Promise<AppointmentDetailResponse>;
    getAllByPatientId(patientId: string, status?: AppointmentStatus, limit?: number, page?: number): Promise<{ appointments: AppointmentDetailResponse[], total: number }>;
    getAllByDoctorId(doctorId: string, status?: AppointmentStatus, limit?: number, page?: number): Promise<{ appointments: AppointmentDetailResponse[], total: number }>;
    getUpcomingAppointment(patientId: string): Promise<AppointmentDetailResponse | null>;
    getUpcomingAppointmentForDoctor(doctorId: string): Promise<AppointmentDetailResponse | null>;

    // Acciones y Actualizaciones
    updateAppointment(id: string, data: Partial<AppointmentCreate>): Promise<AppointmentResponse>;
    updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<boolean>;
    deleteAppointment(id: string): Promise<boolean>;
    blockSlot(data: BlockSlotCreate): Promise<AppointmentResponse>;

    // Lógica avanzada
    generateAvailableSlots(doctorId: string, day: string): Promise<TimeSlot[]>;
    getAppointmentsForDoctorByDay(doctorId: string, day: string): Promise<AppointmentDetailResponse[]>;

    completeConsultationService(payload: CompleteConsultationPayload): Promise<MedicalConsultationDetail | null>;
}

export const makeAppointmentService = async (): Promise<AppointmentService> => {
    // INYECCIÓN DE DEPENDENCIAS
    const appointmentRepository: AppointmentRepository = await makeAppointmentRepository();
    const doctorRepository: DoctorRepository = await makeDoctorRepository();
    const patientRepository = await makePatientRepository();
    const availabilityRepository: AvailabilityRepository = await makeAvailabilityRepository();

    // Función auxiliar para obtener el objeto del servicio
    const service: AppointmentService = {} as AppointmentService;

    // Métodos auxiliares de verificación (verifyDoctorExists, verifyPatientExists, verifySlotIntegrity - Omitidos por brevedad)
    const verifyDoctorExists = async (doctorId: number): Promise<void> => {
        const doctor = await doctorRepository.getDoctorByID(doctorId);
        if (!doctor) {
            throw new Error(`Doctor with ID ${doctorId} not found.`);
        }
    };
    const verifyPatientExists = async (patientId: number): Promise<void> => {
        const patient = await patientRepository.getPatientByID(patientId);
        if (!patient) {
            throw new Error(`Patient with ID ${patientId} not found.`);
        }
    };
    const verifySlotIntegrity = async (data: AppointmentCreate): Promise<void> => {
        const availability = await availabilityRepository.getAvailabilityById(data.availability_id);
        if (!availability) {
            throw new Error(`Availability slot ID ${data.availability_id} not found.`);
        }
        const isWithinWorkingHours = (data.start_time >= availability.start_time && data.end_time <= availability.end_time);
        if (!isWithinWorkingHours) {
            throw new Error("Cita fuera del rango de horas de la disponibilidad fija.");
        }
        const overlapsRest = (data.start_time < availability.rest_end_time && data.end_time > availability.rest_start_time);
        if (overlapsRest) {
            throw new Error("La cita interfiere con el período de descanso programado.");
        }
    };

    // Implementación de la lógica del servicio
    Object.assign(service, {

        // --- Métodos CRUD y de Listado ---
        async createAppointment(data: AppointmentCreate): Promise<AppointmentResponse> {
            await verifyDoctorExists(data.doctor_id);
            await verifyPatientExists(data.patient_id);
            await verifySlotIntegrity(data);
            const isBooked = await appointmentRepository.isSlotBooked(data.doctor_id, data.day, data.start_time);
            if (isBooked) {
                throw new Error("SLOT_ALREADY_BOOKED");
            }
            return await appointmentRepository.createAppointment(data);
        },
        async getAppointmentById(id: string): Promise<AppointmentDetailResponse> {
            const detail = await appointmentRepository.getAppointmentDetailById(Number(id));
            if (!detail) {
                throw new Error("Appointment not found");
            }
            return detail;
        },
        async getAllByPatientId(patientId: string, status?: AppointmentStatus, limit: number = 10, page: number = 1): Promise<{ appointments: AppointmentDetailResponse[], total: number }> {
            await verifyPatientExists(Number(patientId));
            return await appointmentRepository.getAllByPatientId(Number(patientId), status, limit, page);
        },
        async getAllByDoctorId(doctorId: string, status?: AppointmentStatus, limit: number = 10, page: number = 1): Promise<{ appointments: AppointmentDetailResponse[], total: number }> {
            await verifyDoctorExists(Number(doctorId));
            return await appointmentRepository.getAllByDoctorId(Number(doctorId), status, limit, page);
        },
        async getUpcomingAppointment(patientId: string): Promise<AppointmentDetailResponse | null> {
            await verifyPatientExists(Number(patientId));
            return await appointmentRepository.getUpcomingAppointment(Number(patientId));
        },
        async getUpcomingAppointmentForDoctor(doctorId: string): Promise<AppointmentDetailResponse | null> {
            await verifyDoctorExists(Number(doctorId));
            return await appointmentRepository.getUpcomingAppointmentForDoctor(Number(doctorId));
        },

        async updateAppointment(id: string, data: Partial<AppointmentCreate>): Promise<AppointmentResponse> {
            if (data.doctor_id) await verifyDoctorExists(data.doctor_id);
            if (data.patient_id) await verifyPatientExists(data.patient_id);
            if (data.availability_id) {
                const currentAppointment = await appointmentRepository.getAppointmentById(Number(id));
                if (!currentAppointment) throw new Error("Appointment not found");
                // Need full data for verifySlotIntegrity, construct it
                const checkData = { ...currentAppointment, ...data } as AppointmentCreate;
                await verifySlotIntegrity(checkData);
            }
            const updated = await appointmentRepository.updateAppointment(Number(id), data);
            if (!updated) {
                const existing = await appointmentRepository.getAppointmentById(Number(id));
                if (!existing) throw new Error("Appointment not found");
                return existing;
            }
            return updated;
        },
        async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<boolean> {
            const success = await appointmentRepository.updateAppointmentStatus(Number(id), status);
            if (!success) {
                const existing = await appointmentRepository.getAppointmentById(Number(id));
                if (!existing) throw new Error("Appointment not found");
                throw new Error("Failed to update appointment status");
            }
            return success;
        },
        async deleteAppointment(id: string): Promise<boolean> {
            const success = await appointmentRepository.deleteAppointment(Number(id));
            if (!success) {
                const existing = await appointmentRepository.getAppointmentById(Number(id));
                if (!existing) throw new Error("Appointment not found");
                throw new Error("Deletion failed due to unknown database error");
            }
            return success;
        },

        // ---------------------- GENERATE AVAILABLE SLOTS ----------------------
        async generateAvailableSlots(doctorId: string, day: string): Promise<TimeSlot[]> {

            const id = Number(doctorId);
            await verifyDoctorExists(id);

            const date = dayjs(day);
            if (!date.isValid()) {
                throw new Error("Invalid date format provided.");
            }
            const dayOfWeek = date.format('dddd').toLowerCase() as ReturnType<typeof date.format>;

            const allAvailabilities = await availabilityRepository.getAllByDoctorId(id);
            const availabilityRule = allAvailabilities.find(avail => avail.day_of_week === dayOfWeek);

            if (!availabilityRule) {
                return [];
            }

            const reservedAppointments = await appointmentRepository.getReservedAppointments(id, day);
            const reservedStartTimes = new Set(reservedAppointments.map(app => app.start_time));
            const potentialSlots: TimeSlot[] = [];
            const startMins = timeToMinutes(availabilityRule.start_time);
            const endMins = timeToMinutes(availabilityRule.end_time);
            const restStartMins = timeToMinutes(availabilityRule.rest_start_time);
            const restEndMins = timeToMinutes(availabilityRule.rest_end_time);
            const period = availabilityRule.period_time;

            let currentSlotStart = startMins;

            while (currentSlotStart + period <= endMins) {
                const currentSlotEnd = currentSlotStart + period;
                const slotStartTimeStr = minutesToTime(currentSlotStart);
                const slotEndTimeStr = minutesToTime(currentSlotEnd);

                const overlapsRest = (
                    (currentSlotStart >= restStartMins && currentSlotStart < restEndMins) ||
                    (currentSlotEnd > restStartMins && currentSlotEnd <= restEndMins) ||
                    (currentSlotStart < restStartMins && currentSlotEnd > restEndMins)
                );

                if (!overlapsRest && !reservedStartTimes.has(slotStartTimeStr)) {
                    potentialSlots.push({
                        start: slotStartTimeStr,
                        end: slotEndTimeStr,
                    });
                } else {

                }

                if (currentSlotEnd <= restStartMins) {
                    currentSlotStart = currentSlotEnd;
                } else if (currentSlotStart < restEndMins) {
                    currentSlotStart = restEndMins;
                } else {
                    currentSlotStart = currentSlotEnd;
                }
            }

            return potentialSlots;
        },
        // ---------------------- BLOCK SLOT ----------------------
        async blockSlot(data: BlockSlotCreate): Promise<AppointmentResponse> {
            // Validar existencia de Doctor y Availability
            await verifyDoctorExists(data.doctor_id);
            // await verifySlotIntegrity(data); // Requeriría adaptar verifySlotIntegrity o crear una versión para BlockSlotCreate

            // Lógica de Negocio: Verificar si el slot ya está ocupado (por cita o bloqueo)
            const isBooked = await appointmentRepository.isSlotBooked(
                data.doctor_id,
                data.day,
                data.start_time
            );
            if (isBooked) {
                throw new Error("SLOT_ALREADY_BOOKED");
            }

            // Crear el bloqueo
            return await appointmentRepository.blockSlot(data);
        },

        // ---------------------- CITAS POR DÍA (DOCTOR) ----------------------
        async getAppointmentsForDoctorByDay(doctorId: string, day: string): Promise<AppointmentDetailResponse[]> { // <-- Acepta 'day'
            // 1. Verificar que el doctor existe
            await verifyDoctorExists(Number(doctorId));

            // 2. (Opcional) Validar formato de fecha 'day' aquí si no se hace en el controller
            if (!dayjs(day, 'YYYY-MM-DD', true).isValid()) {
                throw new Error("Invalid date format provided. Use YYYY-MM-DD.");
            }

            // 3. Llamar al nuevo método del repositorio
            return await appointmentRepository.getAppointmentsForDoctorByDay(Number(doctorId), day);
        },

        // ---------------------- COMPLETAR CONSULTA ----------------------
        /**
         * @description Procesa la finalización de una consulta: guarda detalles,
         * opcionalmente resumen de salud, y actualiza el estado de la cita.
         * @param payload Objeto que contiene los datos de consulta y resumen.
         * @returns Una promesa que resuelve al detalle de consulta creado o null.
         * @throws Error si la cita no existe, no está confirmada, o falla la transacción.
         */
        async completeConsultationService(payload: CompleteConsultationPayload): Promise<MedicalConsultationDetail | null> {
            const { consultation, summary } = payload;
            const appointmentId = consultation.appointment_id;

            // 1. Validaciones de Negocio Previas
            // a) Verificar que la cita exista y esté en estado 'confirmado' (o el estado previo permitido)
            const appointment = await appointmentRepository.getAppointmentById(appointmentId);
            if (!appointment) {
                throw new Error(`Appointment with ID ${appointmentId} not found.`);
            }
            if (appointment.status !== 'confirmado') {
                throw new Error(`Appointment with ID ${appointmentId} cannot be completed because its status is '${appointment.status}'.`);
            }
            // b) Verificar que doctor_id y patient_id coincidan con la cita original (opcional pero seguro)
            if (appointment.doctor_id !== consultation.doctor_id || appointment.patient_id !== consultation.patient_id) {
                console.warn(`Mismatch in IDs for appointment ${appointmentId}: Request(Dr:${consultation.doctor_id}, Pt:${consultation.patient_id}) vs DB(Dr:${appointment.doctor_id}, Pt:${appointment.patient_id})`);
                throw new Error("Doctor or Patient ID in consultation data does not match the appointment.");
            }
            // c) Si se incluye summary, asegurar que la fecha sea la misma que la cita (o coherente)
            if (summary && summary.summary_date !== appointment.day) {
                //console.warn(`Summary date ${summary.summary_date} differs from appointment day ${appointment.day}`);
                //summary.summary_date = appointment.day; 
            }
            // d) Asegurar que patient_id en summary (si existe) coincida con consultation
            if (summary && summary.patient_id !== consultation.patient_id) {
                throw new Error("Patient ID mismatch between consultation and health summary data.");
            }


            // 2. Llamar al método del repositorio que ejecuta la transacción
            //    El repositorio se encarga de insertar detalles, resumen (si existe) y actualizar cita.
            const createdDetail = await appointmentRepository.completeConsultation(consultation, summary);

            // 3. Devolver el resultado (el detalle de consulta creado)
            return createdDetail;
        },

    });

    return service;
};

// Ensure PatientRepository interface includes getPatientByID if used elsewhere
import { PatientResponse } from '../models/patient';
export interface PacientRepository {
    getPatientByID(id: number): Promise<PatientResponse | null>;
}
