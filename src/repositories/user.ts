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
          createdAt: rows[0].created_at,
          updatedAt: rows[0].updated_at
        }

        return user || null;
      } catch (error) {
        console.error('Error in getUserByID:', error);
        throw new Error('Failed to fetch user by ID');
      }
    },

    // async createPatient(patientCreate: PatientCreate): Promise<User> {
    //   try {
    //     await conn.beginTransaction();

    //     const [result] = await conn.execute<mysql.ResultSetHeader>(
    //       "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
    //       [patientCreate.first_name, patientCreate.last_name, patientCreate.email, patientCreate.password]
    //     );
        
    //     const [newUser] = await conn.execute<mysql.RowDataPacket[]>(
    //       "SELECT * FROM users WHERE id = ?",
    //       [result.insertId]
    //     );

    //     if (newUser.length === 0) {
    //       throw new Error('Failed to create user');
    //     }

    //     const [_] = await conn.execute<mysql.ResultSetHeader>(
    //       "INSERT INTO patients (user_id, date_of_birth, gender, dni) VALUES (?, ?, ?, ?)",
    //       [newUser[0].id, patientCreate.date_of_birth, patientCreate.gender, patientCreate.dni]
    //     );
        
    //     await conn.commit();
    //     return newUser[0] as User;
    //   } catch (error) {
    //     await conn.rollback();
    //     console.error('Error in createPatient:', error);
    //     throw new Error('Error al crear usuario');
    //   } finally {
    //     conn.release();
    //   }
    // },

    // async updateUser(id: number, user: Partial<User>): Promise<User | null> {
    //   try {
    //     const fields = Object.keys(user).map(key => `${key} = ?`).join(', ');
    //     const values = [...Object.values(user), id];

    //     const [result] = await connection.execute<mysql.ResultSetHeader>(
    //       `UPDATE users SET ${fields} WHERE id = ?`,
    //       values
    //     );

    //     if (result.affectedRows === 0) {
    //       return null;
    //     }

    //     const [updatedUser] = await connection.execute<mysql.RowDataPacket[]>(
    //       "SELECT * FROM users WHERE id = ?",
    //       [id]
    //     );

    //     return updatedUser[0] as User;
    //   } catch (error) {
    //     console.error('Error in updateUser:', error);
    //     throw new Error('Failed to update user');
    //   }
    // },

    // async deleteUser(id: number): Promise<boolean> {
    //   try {
    //     const [result] = await connection.execute<mysql.ResultSetHeader>(
    //       "DELETE FROM users WHERE id = ?",
    //       [id]
    //     );
    //     return result.affectedRows > 0;
    //   } catch (error) {
    //     console.error('Error in deleteUser:', error);
    //     throw new Error('Failed to delete user');
    //   }
    // }
  };
}