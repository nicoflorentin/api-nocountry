import pool from "../database/db_connection";
import { User } from "../models/user";
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
  };
}