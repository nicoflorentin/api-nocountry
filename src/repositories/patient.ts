import { User, UserCreate } from "../models/user";
import mysql from 'mysql2/promise';
import { getPool } from '../database/db_connection';
import { PatientCreate, PatientResponse } from "../models/patient";

export interface PacientRepository {
  getPatientByID(id: number): Promise<PatientResponse | null>;
  getAllPatients(): Promise<PatientResponse[]>;
  createPatient(patient: PatientCreate): Promise<PatientResponse>;
  updatePatient(id: number, patient: Partial<PatientResponse>): Promise<PatientResponse | null>;
  deletePatient(id: number): Promise<boolean>;
}

export async function makePatientRepository() {
  const pool = await getPool();
  const conn = await pool.getConnection(); 
  return {
    async getPatientByID(id: number): Promise<PatientResponse | null> {
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
                  p.date_of_birth AS dateOfBirth, p.dni, p.gender
           FROM users u
           INNER JOIN patients p ON p.user_id = u.id
           WHERE u.id = ?`,
          [id]
        );

        if (rows.length === 0) {
          return null;
        }

        return {
          id: rows[0].id,
          firstName: rows[0].first_name,
          lastName: rows[0].last_name,
          email: rows[0].email,
          createdAt: new Date(rows[0].created_at),
          dateOfBirth: new Date(rows[0].dateOfBirth),
          gender: rows[0].gender,
          dni: rows[0].dni
        };
      } catch (error) {
        console.error('Error in getPatientByID:', error);
        throw new Error('Failed to fetch patient by ID');
      }
    },

    async createPatient(patientCreate: PatientCreate): Promise<User> {
      try {
        await conn.beginTransaction();

        const [result] = await conn.execute<mysql.ResultSetHeader>(
          "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
          [patientCreate.firstName, patientCreate.lastName, patientCreate.email, patientCreate.password]
        );
        
        const [newUser] = await conn.execute<mysql.RowDataPacket[]>(
          "SELECT * FROM users WHERE id = ?",
          [result.insertId]
        );

        if (newUser.length === 0) {
          throw new Error('Failed to create user');
        }

        const [_] = await conn.execute<mysql.ResultSetHeader>(
          "INSERT INTO patients (user_id, date_of_birth, gender, dni) VALUES (?, ?, ?, ?)",
          [newUser[0].id, patientCreate.dateOfBirth, patientCreate.gender, patientCreate.dni]
        );
        
        await conn.commit();
        return newUser[0] as User;
      } catch (error) {
        await conn.rollback();
        console.error('Error in createPatient:', error);
        throw new Error('Error al crear usuario');
      } finally {
        conn.release();
      }
    },

    async getAllPatients(): Promise<PatientResponse[]> {
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
                  p.date_of_birth AS dateOfBirth, p.dni, p.gender
           FROM users u
           INNER JOIN patients p ON p.user_id = u.id`
        );

        return (rows as any[]).map(row => ({
          id: row.id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          createdAt: new Date(row.created_at),
          dateOfBirth: new Date(row.dateOfBirth),
          gender: row.gender,
          dni: row.dni
          // patient specific fields are available on row but repository returns User shape; include if needed elsewhere
        }));
      } catch (error) {
        console.error('Error in getAllPatients:', error);
        throw new Error('Failed to fetch patients');
      }
    },

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