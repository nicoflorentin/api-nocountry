import { Request, Response } from "express";
import { User, UserResponse } from "../models/user";
import { LoginCredentials, LoginSchema } from "../models/auth";
import { makeAuthService } from "../services/auth";

let authService: Awaited<ReturnType<typeof makeAuthService>>;

(async () => {
  authService = await makeAuthService();
})()

export const login = async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  const credentials: LoginCredentials = result.data as LoginCredentials;
  
  try {
    const token: string|null = await authService.login(credentials);
    if (!token) {
      return res.status(400).json({ error: "Credenciales incorrectas" });
    }
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const currentUser = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User;

    const userResponse: UserResponse = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      created_at: user.created_at
    };

    return res.status(200).json({ userResponse });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
