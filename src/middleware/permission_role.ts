import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";

// Middleware factory para roles
export function permissionRoleMiddleware(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = res.locals.user as User;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}

