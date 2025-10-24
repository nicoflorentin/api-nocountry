import { User } from "../models/user";
import mysql from 'mysql2/promise';
import { getPool } from '../database/db_connection';
import { LoginCredentials } from "../validations/auth";
import { Patient } from "../models/patient";
import { Doctor } from "../models/doctor";
import { CurrentUser } from "../models/auth";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<User | null>;
  getUserPasswordById(userId: number): Promise<{ password: string } | null>;
}

export async function makeAuthRepository() {
  const pool = await getPool();
  return {
    async login(credentials: LoginCredentials): Promise<User | null> {
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          "SELECT * FROM users WHERE email = ?",
          [credentials.email]
        );
        return rows[0] as User || null;
      } catch (error) {
        console.error('Error in login:', error);
        throw new Error('Credenciales incorrectas');
      } finally {
        conn.release();
      }
    },

    async getCurrentUserByID(id: number): Promise<CurrentUser | null> {
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          "SELECT * FROM users WHERE id = ?",
          [id]
        );

        if (rows.length === 0) {
          return null;
        }

        const user: User = {
          id: rows[0].id,
          firstName: rows[0].first_name,
          lastName: rows[0].last_name,
          email: rows[0].email,
          role: rows[0].role,
          urlImage: rows[0].url_image,
          password: rows[0].password,
          phone: rows[0].phone,
          isActive: rows[0].is_active
        };

        let data: null | Patient | Doctor = null;

        switch (user.role) {
          case "admin":
            data = null;
            break;
          case "medico":
            const [rowsDoctor] = await conn.execute<mysql.RowDataPacket[]>(
              "SELECT d.id, d.license_number, d.bio, s.name FROM doctors as d INNER JOIN specialties as s ON d.specialty_id = s.id WHERE user_id = ?",
              [id]
            );

            if (rowsDoctor.length === 0) {
              return null;
            }

            data = {
              id: rowsDoctor[0].id,
              speciality: rowsDoctor[0].name, //revisar codigo
              licenseNumber: rowsDoctor[0].license_number,
              bio: rowsDoctor[0].bio
            }
            break;
          case "paciente":
            const [rowsPatient] = await conn.execute<mysql.RowDataPacket[]>(
              "SELECT * FROM patients WHERE user_id = ?",
              [id]
            );

            if (rowsPatient.length === 0) {
              return null;
            }

            data = {
              id: rowsPatient[0].id,
              dateOfBirth: rowsPatient[0].date_of_birth,
              identification: rowsPatient[0].identification,
              typeIdentification: rowsPatient[0].type_identification,
              nationality: rowsPatient[0].nationality,
              gender: rowsPatient[0].gender
            }
            break;
          default:
            throw new Error('Multiple users found with the same ID');
        }

        const currentUser: CurrentUser = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          phone: user.phone,
          urlImage: user.urlImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          data: data
        };

        return currentUser;
      } catch (error) {
        console.error('Error in getUserByID:', error);
        throw new Error('Failed to fetch user by ID');
      } finally {
        conn.release();
      }
    },

    async getUserPasswordById(userId: number): Promise<{ password: string } | null> {
      const conn = await pool.getConnection();
      try {
        // Seleccionamos solo la contraseña, lo que es más eficiente y seguro
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          "SELECT password FROM users WHERE id = ?",
          [userId]
        );
        // Devolvemos el hash y el ID del usuario (o solo el hash)
        return rows.length ? { password: rows[0].password } : null;
      } catch (error) {
        console.error('Error in getUserPasswordById:', error);
        throw new Error('Failed to fetch user password');
      } finally {
        conn.release();
      }
    },

    async updatePassword(userId: number, hashedPassword: string): Promise<boolean> {
      const conn = await pool.getConnection();
      try {
        const [result] = await conn.execute<mysql.ResultSetHeader>(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, userId]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        throw new Error('Failed to update password');
      } finally {
        conn.release();
      }
    },
  };
}
