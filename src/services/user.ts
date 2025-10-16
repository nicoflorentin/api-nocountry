import { makeUserRepository } from "../repositories/user";
import { UserResponse } from "../models/user";

export async function makeUserService() {
  const userRepository = await makeUserRepository();

  return {
    async getAllUsers(): Promise<UserResponse[]> {
      const users = await userRepository.getAllUsers();
      return users.map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        createdAt: u.createdAt
      }));
    }
    ,
    async getUserByID(id: number): Promise<UserResponse | null> {
      const user = await userRepository.getUserByID(id);
      if (!user) return null;
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      };
    }
  };
}