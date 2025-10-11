import { makeUserRepository } from "../repositories/user";

export async function makeUserService() {
  const userRepository = await makeUserRepository();

  return null;
}