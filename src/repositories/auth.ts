import { User } from "../models/user";
import mysql from 'mysql2/promise';
import { getPool } from '../database/db_connection';
import { LoginCredentials } from "../models/auth";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<User | null>;
}

export async function makeAuthRepository() {
  const connection = await getPool();
  return {
    async login(credentials: LoginCredentials): Promise<User | null> {
      try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
          "SELECT * FROM users WHERE email = ?",
          [credentials.email]
        );
        return rows[0] as User || null;
      } catch (error) {
        console.error('Error in login:', error);
        throw new Error('Credenciales incorrectas');
      }
    },
  };
}