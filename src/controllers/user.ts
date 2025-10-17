import { Request, Response } from 'express';
import { makeUserService } from '../services/user';
import { MulterRequest } from '../types/express';
import { CurrentUser } from '../models/auth';

let userService: Awaited<ReturnType<typeof makeUserService>>;
(async () => {
  userService = await makeUserService();
})();

export const updateUserImage = async (req: Request, res: Response) => {
  try {
    const multerReq = req as MulterRequest; // casteo
    if (!multerReq.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = res.locals.user as CurrentUser;

    const result = await userService.updateUserImage(multerReq.file, user);
    return res.status(200).json({ result });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!userService) {
      throw new Error('User service not initialized');
    }

    const users = await userService.getAllUsers();
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const getUserByID = async (req: Request, res: Response) => {
  try {
    if (!userService) {
      throw new Error('User service not initialized');
    }

    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid id parameter' });
    }

    const user = await userService.getUserByID(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user by id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

