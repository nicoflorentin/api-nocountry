import pool from "../database/db_connection";
import { User } from "../models/user";
import { makeUserRepository } from "../repositories/user";

const userRepository = makeUserRepository(pool);

export function makeUserService() {
  return {
    async getUserByID(id: number): Promise<User | null> {
      const result = await userRepository.getUserByID(id)
      return result;
    },
  };
}