import pool from "../database/db_connection";
import { User, UserCreate, UserResponse } from "../models/user";
import { makeUserRepository } from "../repositories/user";
import { hashPassword } from "../utils/hash_password";

export async function makeUserService() {
  const userRepository = await makeUserRepository();

  return {
    async getUserByID(id: number): Promise<User | null> {
      const result = await userRepository.getUserByID(id)
      return result;
    },

    async createUser(createUser: UserCreate): Promise<UserResponse | null> {
      createUser.password = await hashPassword(createUser.password);

      const user: User | null = await userRepository.createUser(createUser);
      
      if (user == null) {
        return null;
      }
      
      const userResponse: UserResponse = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      };

      return userResponse;
     },
  };
}