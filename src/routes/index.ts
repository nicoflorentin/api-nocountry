import { Router } from "express";
import { user } from "./user";

export const router = Router();

router.use("/api/user", user);