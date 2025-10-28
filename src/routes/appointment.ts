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
    deleteAppointment,
    getAppointmentById,
    getAvailableSlotsController,
} from "../controllers/appointment";

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
appointmentRouter.get("/available/:doctorId", getAvailableSlotsController);



// ACCIONES DE ESTADO
appointmentRouter.patch("/:id/cancel", cancelAppointment);
appointmentRouter.patch("/:id/complete", completeAppointment);
appointmentRouter.patch("/:id/confirm", confirmAppointment); 
