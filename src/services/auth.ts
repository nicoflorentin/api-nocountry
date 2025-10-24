import { LoginCredentials } from "../validations/auth";
import { makeAuthRepository } from "../repositories/auth";
import { verifyPassword } from "../utils/hash_password";
import { generateToken, TokenClaims } from "../utils/token";
import { compare } from 'bcrypt';
import { hashPassword } from "../utils/hash_password";

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

    async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
      // Obtener la contraseña hasheada actual del usuario
      const user = await authRepository.getUserPasswordById(userId);

      if (!user || !user.password) {
        throw new Error("User not found or password not set");
      }

      //Verificar la contraseña actual 
      const isMatch = await compare(currentPassword, user.password);
      if (!isMatch) {
        // Lanzar un error específico de negocio que el Controller pueda traducir a 401/403
        throw new Error("CURRENT_PASSWORD_MISMATCH");
      }

      // Hashear la nueva contraseña
      const newHashedPassword = await hashPassword(newPassword);

      // Actualizar en el repositorio
      const success = await authRepository.updatePassword(userId, newHashedPassword);

      if (!success) {
        throw new Error("Failed to persist password change");
      }

      return success;
    },
  };
}