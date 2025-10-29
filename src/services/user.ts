import { makeUserRepository } from "../repositories/user";
import { UserResponse } from "../models/user";
import { deleteImage, uploadImage } from "../utils/image";
import { CurrentUser } from "../models/auth";

export async function makeUserService() {
  const userRepository = await makeUserRepository();

  return {
    async updateUserImage(file: Express.Multer.File, user: CurrentUser): Promise<boolean> {
      const oldUrlImage = user.urlImage;

      const imageUrl = await uploadImage(file.path);

      const result = await userRepository.updateUserImage(imageUrl, user.id);

      if (!result) {
        return false;
      }

      if (oldUrlImage) {
        await deleteImage(oldUrlImage);
      }

      return result;
    },

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
    },

    async updateState(id: number): Promise<boolean> {
      return await userRepository.updateState(id);
    },
  
  };
}