import { NextFunction, Request, Response } from "express";
import { getClaimsFromToken, TokenClaims } from "../utils/token";
import { makeUserRepository } from "../repositories/user";
import { makeAuthRepository } from "../repositories/auth";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const claims: TokenClaims | null = getClaimsFromToken(token);
    if (!claims) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const authRepo = await makeAuthRepository();
    const userId = typeof claims.id === "string" ? parseInt(claims.id, 10) : claims.id;
    const user = await authRepo.getCurrentUserByID(userId);
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    res.locals.user = user;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
