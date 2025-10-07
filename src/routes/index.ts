import { Router } from "express";
import { user } from "./user";
import { auth } from "./auth";

export const router = Router();

router.use("/api/auth", auth);
router.use("/api/user", user);