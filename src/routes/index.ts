import { Router } from "express";
import { user } from "./user";
import { auth } from "./auth";
import { patient } from "./patient";
import { doctor } from "./doctor";
import { availabiliyRouter } from "./availability"; 
import { specialty } from "./specialty";
import { appointmentRouter } from "./appointment"; 

export const router = Router();

// AUTENTICACIÓN
// Base: /api/auth
router.use("/api/auth", auth);

// USUARIOS
// Base: /api/user (Opcional, pero asumo que existe)
router.use("/api/user", user);

// PACIENTES
// Base: /api/patient
router.use("/api/patient", patient);

// DOCTORES
// Base: /api/doctor
router.use("/api/doctor", doctor);

// ESPECIALIDADES
// Base: /api/specialty
router.use("/api/specialty", specialty);

// DISPONIBILIDADES
// Base: /api/availabilities
router.use("/api/availabilities", availabiliyRouter);

// CITAS
// Base: /api/appointments
router.use("/api/appointments", appointmentRouter); 
