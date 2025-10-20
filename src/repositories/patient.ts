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
  return {
    async getPatientByID(id: number): Promise<PatientResponse | null> {
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          `SELECT p.id, p.gender, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at,
                  p.date_of_birth AS dateOfBirth, p.identification, p.type_identification, p.nationality
           FROM patients p
           INNER JOIN users u ON p.user_id = u.id
           WHERE p.id = ?`,
          [id]
        );

        if (rows.length === 0) {
          return null;
        }

        return {
          id: rows[0].id,
          user_id: rows[0].user_id,
          firstName: rows[0].first_name,
          lastName: rows[0].last_name,
          email: rows[0].email,
          createdAt: new Date(rows[0].created_at),
          dateOfBirth: new Date(rows[0].dateOfBirth),
          gender: rows[0].gender,
          identification: rows[0].identification,
          typeIdentification: rows[0].type_identification,
          nationality: rows[0].nationality
        };
      } catch (error) {
        console.error('Error in getPatientByID:', error);
        throw new Error('Failed to fetch patient by ID');
      }
    },

    async createPatient(patientCreate: PatientCreate): Promise<User> {
      const conn = await pool.getConnection();

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
          "INSERT INTO patients (user_id, date_of_birth, gender, identification, type_identification, nationality) VALUES (?, ?, ?, ?, ?, ?)",
          [newUser[0].id, patientCreate.dateOfBirth, patientCreate.gender, patientCreate.identification, patientCreate.typeIdentification, patientCreate.nationality]
        );

        await conn.commit();
        return newUser[0] as User;
      } catch (error) {
        await conn.rollback();
        console.error("Error al crear paciente en repositorio:", error) // 👈 Muestra el error original
        throw error;
      } finally {
        conn.release();
      }
    },

    async getAllPatients(): Promise<PatientResponse[]> {
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          `SELECT p.id, p.gender, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at,
                  p.date_of_birth AS dateOfBirth, p.identification, p.type_identification, p.nationality
           FROM patients p
           INNER JOIN users u ON p.user_id = u.id`
        );

        return (rows as any[]).map(row => ({
          id: row.id,
          user_id: row.user_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          createdAt: new Date(row.created_at),
          dateOfBirth: new Date(row.dateOfBirth),
          gender: row.gender,
          identification: row.identification,
          typeIdentification: row.type_identification,
          nationality: row.nationality
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