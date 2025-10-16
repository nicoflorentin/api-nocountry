import { Router } from "express";
import { user } from "./user";
import { auth } from "./auth";
import { patient } from "./patient";
import { doctor } from "./doctor";

export const router = Router();

router.use("/api/auth", auth);
router.use("/api/user", user);
router.use("/api/patient", patient);
router.use("/api/doctor", doctor);