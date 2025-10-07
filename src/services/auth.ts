import { LoginCredentials } from "../models/auth";
import { makeAuthRepository } from "../repositories/auth";
import { verifyPassword } from "../utils/hash_password";
import { generateToken, TokenClaims } from "../utils/token";

export async function makeAuthService() {
  const authRepository = await makeAuthRepository();

  return {
    async login(credentials: LoginCredentials): Promise<string | null> {
      const user = await authRepository.login(credentials)

      if (!user) {
        return null;
      }

      if (!await verifyPassword(credentials.password, user.password)) {
        return null; 
      }

      const claims: TokenClaims = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      return generateToken(claims);
    },
  };
}