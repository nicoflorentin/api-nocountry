import { Router } from "express";
import { getUserByID } from "../controllers/user";

export const user = Router();

user.get("/:id", getUserByID);