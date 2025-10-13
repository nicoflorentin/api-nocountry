import { User } from "../models/user";
import mysql from 'mysql2/promise';
import { getPool } from '../database/db_connection';
import { LoginCredentials } from "../validations/auth";
import { Patient } from "../models/patient";
import { Doctor } from "../models/doctor";
import { CurrentUser } from "../models/auth";

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

    async getCurrentUserByID(id: number): Promise<CurrentUser | null> {
      try {
        const [rows] = await connection.execute<mysql.RowDataPacket[]>(
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
          password: rows[0].password
        };

        let data: null | Patient | Doctor = null;

        switch (user.role) {
          case "admin":
            data = null;
            break;
          case "doctor":
            const [rowsDoctor] = await connection.execute<mysql.RowDataPacket[]>(
              "SELECT d.id, d.license_number, d.bio, s.name FROM doctors as d INNER JOIN specialties as s ON d.specialty_id = s.id WHERE user_id = ?",
              [id]
            );

            if (rowsDoctor.length === 0) {
              return null;
            }

            data = {
              id: rowsDoctor[0].id,
              specialty: rowsDoctor[0].name, //revisar codigo
              licenseNumber: rowsDoctor[0].license_number,
              bio: rowsDoctor[0].bio
            }
            break;
          case "paciente":
            const [rowsPatient] = await connection.execute<mysql.RowDataPacket[]>(
              "SELECT * FROM patients WHERE user_id = ?",
              [id]
            );

            if (rowsPatient.length === 0) {
              return null;
            }

            data = {
              id: rowsPatient[0].id,
              dateOfBirth: rowsPatient[0].date_of_birth,
              dni: rowsPatient[0].dni,
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
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          data: data
        };

        return currentUser;
      } catch (error) {
        console.error('Error in getUserByID:', error);
        throw new Error('Failed to fetch user by ID');
      }
    },
  };
}