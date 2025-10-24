import { User, UserCreate } from "../models/user";
import mysql from 'mysql2/promise';
import { getPool } from '../database/db_connection';
import { PatientCreate, PatientCreateByAdmin, PatientResponse,PatientUpdate } from "../models/patient";
import { createPatientByAdmin } from "../controllers/patient";


export interface PacientRepository {
  getPatientByID(id: number): Promise<PatientResponse | null>;
  getAllPatients(): Promise<PatientResponse[]>;
  createPatient(patient: PatientCreate): Promise<PatientResponse>;
  //updatePatient(id: number, patient: Partial<PatientResponse>): Promise<PatientResponse | null>;
  updatePatient(id: number, patientUpdate: PatientUpdate): Promise<PatientResponse | null>;
  deletePatient(id: number): Promise<boolean>;
}

export async function makePatientRepository() {
  const pool = await getPool();
  return {
    async getPatientByID(id: number): Promise<PatientResponse | null> {
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          `SELECT p.id, p.gender, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at, u.url_image, u.is_active,
                  p.date_of_birth AS dateOfBirth, p.identification, p.type_identification, p.nationality, u.phone
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
          urlImage: rows[0].url_image,
          createdAt: new Date(rows[0].created_at),
          dateOfBirth: new Date(rows[0].dateOfBirth),
          gender: rows[0].gender,
          identification: rows[0].identification,
          typeIdentification: rows[0].type_identification,
          nationality: rows[0].nationality,
          isActive: rows[0].is_active,
          phone: rows[0].phone
        };
      } catch (error) {
        console.error('Error in getPatientByID:', error);
        throw new Error('Failed to fetch patient by ID');
      } finally {
        conn.release();
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

    async getAllPatients(limit: number, page: number): Promise<{patients: PatientResponse[], total: number}> {
      const conn = await pool.getConnection();
      try {
        const offset = (page - 1) * limit;

        // Get total count
        const [countResult] = await conn.execute<mysql.RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM patients p'
        );
        const total = countResult[0].total;

        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          `SELECT p.id, p.gender, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at, u.url_image, u.is_active,
                  p.date_of_birth AS dateOfBirth, p.identification, p.type_identification, p.nationality, u.phone
           FROM patients p
           INNER JOIN users u ON p.user_id = u.id
           LIMIT ?
           OFFSET ? 
           `, [limit, offset]
        );

        const patients = (rows as any[]).map(row => ({
          id: row.id,
          user_id: row.user_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          urlImage: row.url_image,
          createdAt: new Date(row.created_at),
          dateOfBirth: new Date(row.dateOfBirth),
          gender: row.gender,
          identification: row.identification,
          typeIdentification: row.type_identification,
          nationality: row.nationality,
          isActive: row.is_active,
          phone: row.phone
        }));

        return {
          patients,
          total
        };
      } catch (error) {
        console.error('Error in getAllPatients:', error);
        throw new Error('Failed to fetch patients');
      } finally {
        conn.release();
      }
    },

    async getPatientsByName(name: string): Promise<PatientResponse[]> {
      const conn = await pool.getConnection()
      try {
        const searchTerm = `%${name}%`;
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          `SELECT p.id, p.gender, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at, u.url_image, u.is_active,
          p.date_of_birth AS dateOfBirth, p.identification, p.type_identification, p.nationality, u.phone
          FROM patients p
          INNER JOIN users u ON p.user_id = u.id
          WHERE u.first_name LIKE ? OR u.last_name LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
          LIMIT 10`,
          [searchTerm, searchTerm, searchTerm]
        );

        return (rows as any[]).map(row => ({
          id: row.id,
          user_id: row.user_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          urlImage: row.url_image,
          createdAt: new Date(row.created_at),
          dateOfBirth: new Date(row.dateOfBirth),
          gender: row.gender,
          identification: row.identification,
          typeIdentification: row.type_identification,
          nationality: row.nationality,
          isActive: row.is_active,
          phone: row.phone
        }))
      } catch (error) {
        console.error('Error in getPatientsByName:', error)
        throw new Error('Failed to fetch patients by name')
      } finally {
        conn.release();
      }
    },

    async createPatientByAdmin(patientCreate: PatientCreateByAdmin, hashedPassword: string): Promise<User> {
      const conn = await pool.getConnection();

      try {
        await conn.beginTransaction();

        const [result] = await conn.execute<mysql.ResultSetHeader>(
          "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
          [patientCreate.firstName, patientCreate.lastName, patientCreate.email, hashedPassword]
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

        const user: User = {
          id: newUser[0].id,
          firstName: newUser[0].first_name,
          lastName: newUser[0].last_name,
          email: newUser[0].email,
          urlImage: newUser[0].url_image,
          createdAt: new Date(newUser[0].created_at),
          isActive: newUser[0].is_active,
          phone: newUser[0].phone,
          password: newUser[0].password,
          role: newUser[0].role
        }

        return user;
      } catch (error) {
        await conn.rollback();
        console.error("Error al crear paciente en repositorio:", error) // 👈 Muestra el error original
        throw error;
      } finally {
        conn.release();
      }
    },

    async updatePatient(id: number, patientUpdate: PatientUpdate): Promise<PatientResponse | null> {
      const conn = await pool.getConnection();

      //Separar campos de Users y Patients
      const userFields: Record<string, any> = {};
      const patientFields: Record<string, any> = {};

      // Mapeo de camelCase a snake_case para SQL
      const userKeys = ['firstName', 'lastName', 'email', 'phone', 'urlImage', 'isActive'];
      const patientKeys = ['dateOfBirth', 'gender', 'identification', 'typeIdentification', 'nationality'];

      for (const [key, value] of Object.entries(patientUpdate)) {
        if (value === undefined) continue; 

        if (userKeys.includes(key)) {
          // Convertir a snake_case para la tabla users
          const sqlKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          userFields[sqlKey] = value;
        } else if (patientKeys.includes(key)) {
          // Convertir a snake_case para la tabla patients
          const sqlKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          patientFields[sqlKey] = value;
        }
      }

      if (Object.keys(userFields).length === 0 && Object.keys(patientFields).length === 0) {
        // No hay campos para actualizar, pero devolvemos el registro actual.
        return this.getPatientByID(id);
      }

      try {
        await conn.beginTransaction();

        // Obtener user_id del patient
        const [patientRow] = await conn.execute<mysql.RowDataPacket[]>(
          "SELECT user_id FROM patients WHERE id = ?", [id]
        );

        if (patientRow.length === 0) {
          await conn.rollback();
          return null; 
        }
        const userId = patientRow[0].user_id;

        // Actualizar la tabla users (si hay campos)
        if (Object.keys(userFields).length > 0) {
          const userSetClause = Object.keys(userFields).map(key => `${key} = ?`).join(', ');
          const userValues = Object.values(userFields);

          await conn.execute(
            `UPDATE users SET ${userSetClause} WHERE id = ?`,
            [...userValues, userId]
          );
        }

        // Actualizar la tabla patients (si hay campos)
        if (Object.keys(patientFields).length > 0) {
          const patientSetClause = Object.keys(patientFields).map(key => `${key} = ?`).join(', ');
          const patientValues = Object.values(patientFields);

          await conn.execute(
            `UPDATE patients SET ${patientSetClause} WHERE id = ?`,
            [...patientValues, id]
          );
        }

        await conn.commit();

        // Devolver el paciente actualizado (usando el método ya existente)
        return this.getPatientByID(id);

      } catch (error) {
        await conn.rollback();
        console.error('Error al actualizar paciente:', error);
        
        throw error;
      } finally {
        conn.release();
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