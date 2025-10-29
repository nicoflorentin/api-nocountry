import { User, UserCreate } from "../models/user";
import mysql from 'mysql2/promise';
import { getPool } from '../database/db_connection';
import { updateUserImage } from "../controllers/user";

export interface UserRepository {
  getUserByID(id: number): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
}

export async function makeUserRepository() {
  const pool = await getPool();
  const conn = await pool.getConnection();
  return {
    async getUserByID(id: number): Promise<User | null> {
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          "SELECT * FROM users WHERE id = ?",
          [id]
        );

        const user: User = {
          id: rows[0].id,
          firstName: rows[0].first_name,
          lastName: rows[0].last_name,
          email: rows[0].email,
          password: rows[0].password,
          role: rows[0].role,
          isActive: rows[0].is_active,
          urlImage: rows[0].url_image,
          phone: rows[0].phone,
          createdAt: rows[0].created_at,
          updatedAt: rows[0].updated_at
        }

        return user || null;
      } catch (error) {
        console.error('Error in getUserByID:', error);
        throw new Error('Failed to fetch user by ID');
      }
    },

    async getAllUsers(): Promise<User[]> {
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>("SELECT * FROM users");

        return (rows as any[]).map(row => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          password: row.password,
          role: row.role,
          isActive: row.is_active,
          urlImage: row.url_image,
          phone: row.phone,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      } catch (error) {
        console.error('Error in getAllUsers:', error);
        throw new Error('Failed to fetch users');
      }
    },

    async updateUserImage(url: string, userId: number): Promise<boolean | null> {
      try {
        const [result] = await conn.execute<mysql.ResultSetHeader>(
          "UPDATE users SET url_image = ? WHERE id = ?",
          [url, userId]
        );

        if (result.affectedRows === 0) {
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error in updateUserImage:', error);
        throw new Error('Failed to update user image');
      }
    },

    async updateState(id: number): Promise<boolean> {
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        "UPDATE users SET is_active = NOT is_active WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return result.affectedRows > 0;
    },
  
  }
}