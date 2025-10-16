import { Router } from "express";
import { user } from "./user";
import { auth } from "./auth";
import { patient } from "./patient";
import { medic } from "./medic";

export const router = Router();

router.use("/api/auth", auth);
router.use("/api/user", user);
router.use("/api/patient", patient);
router.use("/api/medic", medic);