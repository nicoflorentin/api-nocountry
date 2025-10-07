import pool from "../database/db_connection";
import { User, UserCreate, UserResponse } from "../models/user";
import { makeUserRepository } from "../repositories/user";

// let userRepository: Awaited<ReturnType<typeof makeUserRepository>>;

// (async () => {
//   userRepository = await makeUserRepository();
// })();

export async function makeUserService() {
  const userRepository = await makeUserRepository();

  return {
    async getUserByID(id: number): Promise<User | null> {
      const result = await userRepository.getUserByID(id)
      return result;
    },

    async createUser(createUser: UserCreate): Promise<UserResponse | null> {
      const user: User | null = await userRepository.createUser(createUser);
      
      if (user == null) {
        return null;
      }
      
      return user as UserResponse;
     },
  };
}