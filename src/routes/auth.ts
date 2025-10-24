import { Router } from "express";
import { currentUser, login, changePassword } from "../controllers/auth";
import { authMiddleware } from "../middleware/auth";

export const auth = Router();

auth.post("/login", login);
auth.get("/current_user", authMiddleware, currentUser);
auth.patch("/change_password", authMiddleware, changePassword);