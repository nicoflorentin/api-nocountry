import { Router } from "express";
import {
    createAppointment,
    getAllAppointmentsByPatient,
    getAllAppointmentsByDoctor,
    getUpcomingAppointment,
    updateAppointment,
    cancelAppointment,
    completeAppointment,
    confirmAppointment,
    markAppointmentAsNoShow,
    deleteAppointment,
    getAppointmentById,
    getAvailableSlotsController,
    blockSlotController,
    getAppointmentsForDoctorByDayController,
    getUpcomingAppointmentForDoctor,
    completeConsultationController,
} from "../controllers/appointment";
import { authMiddleware } from "../middleware/auth";

export const appointmentRouter = Router();

// CRUD BÁSICO
appointmentRouter.post("/", createAppointment);
appointmentRouter.patch("/:id", updateAppointment);
appointmentRouter.delete("/:id", deleteAppointment);
appointmentRouter.get("/:id", getAppointmentById);

// LISTADOS Y BÚSQUEDAS
appointmentRouter.get("/patient/:id", getAllAppointmentsByPatient);
appointmentRouter.get("/doctor/:id", getAllAppointmentsByDoctor);
appointmentRouter.get("/upcoming/:patientId", getUpcomingAppointment);
appointmentRouter.get("/upcoming/doctor/:doctorId", getUpcomingAppointmentForDoctor);
appointmentRouter.get("/available/:doctorId", getAvailableSlotsController);
appointmentRouter.get("/doctor/:id/by-day", getAppointmentsForDoctorByDayController);

// ACCIONES DE ESTADO
appointmentRouter.patch("/:id/cancel", cancelAppointment);
appointmentRouter.patch("/:id/complete", completeAppointment);
appointmentRouter.patch("/:id/confirm", confirmAppointment);
appointmentRouter.patch("/:id/no-show", markAppointmentAsNoShow);

// BLOQUEO DE SLOTS
appointmentRouter.post("/block-slot", authMiddleware, blockSlotController);

// COMPLETAR CONSULTA
appointmentRouter.post("/:id/complete-consultation", authMiddleware, completeConsultationController);

