import { User, UserCreate } from "../models/user";
import mysql from 'mysql2/promise';
import { getPool } from '../database/db_connection';

export interface UserRepository {
  getUserByID(id: number): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
}

export async function makeUserRepository() {
  const connection = await getPool();
  return {
    async getUserByID(id: number): Promise<User | null> {
      try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
          "SELECT * FROM users WHERE id = ?",
          [id]
        );
        return rows[0] as User || null;
      } catch (error) {
        console.error('Error in getUserByID:', error);
        throw new Error('Failed to fetch user by ID');
      }
    },

    async getAllUsers(): Promise<User[]> {
      try {
        const [rows] = await connection.query<mysql.RowDataPacket[]>(
          "SELECT * FROM users"
        );
        return rows as User[];
      } catch (error) {
        console.error('Error in getAllUsers:', error);
        throw new Error('Failed to fetch users');
      }
    },

    async createUser(user: UserCreate): Promise<User> {
      try {
        const [result] = await connection.execute<mysql.ResultSetHeader>(
          "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
          [user.firstName, user.lastName, user.email, user.password]
        );
        
        const [newUser] = await connection.execute<mysql.RowDataPacket[]>(
          "SELECT * FROM users WHERE id = ?",
          [result.insertId]
        );
        
        return newUser[0] as User;
      } catch (error) {
        console.error('Error in createUser:', error);
        throw new Error('Failed to create user');
      }
    },

    async updateUser(id: number, user: Partial<User>): Promise<User | null> {
      try {
        const fields = Object.keys(user).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(user), id];

        const [result] = await connection.execute<mysql.ResultSetHeader>(
          `UPDATE users SET ${fields} WHERE id = ?`,
          values
        );

        if (result.affectedRows === 0) {
          return null;
        }

        const [updatedUser] = await connection.execute<mysql.RowDataPacket[]>(
          "SELECT * FROM users WHERE id = ?",
          [id]
        );

        return updatedUser[0] as User;
      } catch (error) {
        console.error('Error in updateUser:', error);
        throw new Error('Failed to update user');
      }
    },

    async deleteUser(id: number): Promise<boolean> {
      try {
        const [result] = await connection.execute<mysql.ResultSetHeader>(
          "DELETE FROM users WHERE id = ?",
          [id]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.error('Error in deleteUser:', error);
        throw new Error('Failed to delete user');
      }
    }
  };
}