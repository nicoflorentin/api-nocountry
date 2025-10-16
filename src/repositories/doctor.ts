import { User } from "../models/user"
import mysql from "mysql2/promise"
import { getPool } from "../database/db_connection"
import { DoctorCreate, DoctorResponse } from "../models/doctor"

export interface DoctorRepository {
	getDoctorByID(id: number): Promise<DoctorResponse | null>
	getAllDoctors(): Promise<DoctorResponse[]>
	createDoctor(doctor: DoctorCreate): Promise<DoctorResponse>
}

export async function makeDoctorRepository() {
	const pool = await getPool()

	return {
		async getDoctorByID(id: number): Promise<DoctorResponse | null> {
			const conn = await pool.getConnection()
			try {
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT d.id, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at,
                  s.name as speciality, d.license_number
           FROM doctors d
           INNER JOIN users u ON d.user_id = u.id
           INNER JOIN specialties s ON s.id = d.specialty_id
           WHERE d.id = ?`,
					[id]
				)

				if (rows.length === 0) {
					return null
				}

				return {
					id: rows[0].id,
					firstName: rows[0].first_name,
					lastName: rows[0].last_name,
					email: rows[0].email,
					createdAt: new Date(rows[0].created_at),
					speciality: rows[0].speciality,
					licenseNumber: rows[0].license_number,
				}
			} catch (error) {
				console.error("Error in getMedicByID:", error)
				throw new Error("Failed to fetch medic by ID")
			}
		},

		async getAllDoctors(): Promise<DoctorResponse[]> {
			const conn = await pool.getConnection()
			try {
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT d.id, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at,
                  s.name as speciality, d.license_number
           FROM doctors d
           INNER JOIN users u ON d.user_id = u.id
           INNER JOIN specialties s ON s.id = d.specialty_id`
				)

				return rows.map((row) => ({
					id: row.id,
					firstName: row.first_name,
					lastName: row.last_name,
					email: row.email,
					createdAt: new Date(row.created_at),
					speciality: row.speciality,
					licenseNumber: row.license_number,
				}))
			} catch (error) {
				console.error("Error in getAllMedics:", error)
				throw new Error("Failed to fetch medics")
			}
		},

		async createDoctor(doctorCreate: DoctorCreate): Promise<User> {
			const conn = await pool.getConnection()
			try {
				await conn.beginTransaction();

				const [result] = await conn.execute<mysql.ResultSetHeader>(
					"INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
					[doctorCreate.firstName, doctorCreate.lastName, doctorCreate.email, doctorCreate.password]
				);

				const [newUser] = await conn.execute<mysql.RowDataPacket[]>(
					"SELECT * FROM users WHERE id = ?",
					[result.insertId]
				);

				if (newUser.length === 0) {
					throw new Error('Failed to create user');
				}

				const [rowsSpeciality] = await conn.execute<mysql.RowDataPacket[]>(
					"SELECT * FROM specialties WHERE id = ?",
					[doctorCreate.specialityId]
				);

				if (rowsSpeciality.length === 0) {
					throw new Error('Speciality not found');
				}

				const [_] = await conn.execute<mysql.ResultSetHeader>(
					"INSERT INTO doctors (user_id, specialty_id, license_number) VALUES (?, ?, ?)",
					[newUser[0].id, doctorCreate.specialityId, doctorCreate.licenseNumber]
				);

				await conn.commit();
				return {
					id: newUser[0].id,
					firstName: newUser[0].first_name,
					lastName: newUser[0].last_name,
					email: newUser[0].email,
					phone: newUser[0].phone,
					createdAt: new Date(newUser[0].created_at),
					password: newUser[0].password,
					role: newUser[0].role
				};
			} catch (error) {
				await conn.rollback();
				console.error('Error in createPatient:', error);
				throw new Error('Error al crear usuario');
			} finally {
				conn.release();
			}
		},
	}
}
