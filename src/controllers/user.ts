import { Request, Response } from "express";
import { makeUserService } from "../services/user";
import { User } from "../models/user";

const userService = makeUserService();

export const getUserByID = async (req: Request, res: Response) => {
  const id = req.params.id;
  
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Valid numeric Id is required" });
  }

  try {
    const user: User|null = await userService.getUserByID(Number(id));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
