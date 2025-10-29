// src/repositories/doctor.ts

import { User } from "../models/user"
import mysql from "mysql2/promise"
import { getPool } from "../database/db_connection"
import { DoctorCreate, DoctorCreateByAdmin, DoctorResponse, DoctorUpdate } from "../models/doctor"
import { PatientResponse } from "../models/patient"
import { CurrentUser } from "../models/auth"

export interface DoctorRepository {
	getDoctorByID(id: number): Promise<DoctorResponse | null>
	// Se corrige la firma para incluir paginación (como en tu implementación)
	getAllDoctors(limit: number, page: number): Promise<{ doctors: DoctorResponse[], total: number }>
	// Se mantiene la firma para devolver el DoctorResponse completo
	createDoctor(doctor: DoctorCreate): Promise<DoctorResponse>
	// Se mantienen los demás métodos que no se modificaron
	getDoctorsBySpecialtyID(id: number, limit: number, page: number): Promise<{ doctors: DoctorResponse[], total: number }>
	getDoctorsByName(name: string): Promise<DoctorResponse[]>
	updateDoctor(doctorUpdate: DoctorUpdate): Promise<boolean>
	createDoctorByAdmin(doctorCreate: DoctorCreateByAdmin, hashedPassword: string): Promise<User>
	getPatientByID(id: number, userDoctor: CurrentUser): Promise<PatientResponse | null>
}

// Función de mapeo para simplificar la creación del objeto DoctorResponse
const mapDoctorRowToResponse = (row: any): DoctorResponse => ({
	id: row.id, // ID de la tabla doctors (d.id)
	firstName: row.first_name,
	lastName: row.last_name,
	email: row.email,
	createdAt: new Date(row.created_at),
	speciality: row.speciality, // Nombre de la especialidad (s.name)
	licenseNumber: row.license_number,
	urlImage: row.url_image,
	isActive: row.is_active,
	phone: row.phone,
	bio: row.bio,
	specialtyId: row.specialty_id
});


export async function makeDoctorRepository() {
	const pool = await getPool()

	const repository: DoctorRepository = {

		async getDoctorByID(id: number): Promise<DoctorResponse | null> {
			const conn = await pool.getConnection()
			try {
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT d.id, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at,
                    s.name as speciality, d.license_number, u.url_image, u.is_active, u.phone, d.bio
                    FROM doctors d
                    INNER JOIN users u ON d.user_id = u.id
                    INNER JOIN specialties s ON s.id = d.specialty_id
                    WHERE d.id = ?`,
					[id]
				)

				if (rows.length === 0) {
					return null
				}

				return mapDoctorRowToResponse(rows[0]);
			} catch (error) {
				console.error("Error in getMedicByID:", error)
				throw new Error("Failed to fetch medic by ID")
			} finally {
				conn.release();
			}
		},

		async getAllDoctors(limit: number, page: number): Promise<{ doctors: DoctorResponse[], total: number }> {
			const conn = await pool.getConnection()
			try {
				const offset = (page - 1) * limit;
				const [countResult] = await conn.execute<mysql.RowDataPacket[]>(
					'SELECT COUNT(*) as total FROM doctors d'
				);
				const total = countResult[0].total;

				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT d.id, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at,
                    s.name as speciality, d.specialty_id, d.license_number, u.url_image, u.is_active, u.phone, d.bio
                    FROM doctors d
                    INNER JOIN users u ON d.user_id = u.id
                    INNER JOIN specialties s ON s.id = d.specialty_id
                    LIMIT ? OFFSET ?`,
					[limit, offset]
				);

				const doctors = rows.map(mapDoctorRowToResponse);

				return {
					doctors,
					total
				};
			} catch (error) {
				console.error("Error in getAllMedics:", error)
				throw new Error("Failed to fetch medics")
			} finally {
				conn.release();
			}
		},

		async createDoctor(doctorCreate: DoctorCreate): Promise<DoctorResponse> {
			const conn = await pool.getConnection()
			const role: string = "medico";
			let doctorId: number | null = null;

			try {
				await conn.beginTransaction();

				// 1. Insertar USER
				const [resultUser] = await conn.execute<mysql.ResultSetHeader>(
					"INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)",
					[doctorCreate.firstName, doctorCreate.lastName, doctorCreate.email, doctorCreate.phone, doctorCreate.password, role]
				);
				const userId = resultUser.insertId;

				// 2. Verificar y obtener especialidad
				const [rowsSpeciality] = await conn.execute<mysql.RowDataPacket[]>(
					"SELECT id FROM specialties WHERE id = ?",
					[doctorCreate.specialityId]
				);

				if (rowsSpeciality.length === 0) {
					throw new Error('Speciality not found');
				}

				// 3. Insertar DOCTOR
				const [resultDoctor] = await conn.execute<mysql.ResultSetHeader>(
					"INSERT INTO doctors (user_id, specialty_id, license_number, bio) VALUES (?, ?, ?, ?)",
					[userId, doctorCreate.specialityId, doctorCreate.licenseNumber, doctorCreate.bio]
				);
				doctorId = resultDoctor.insertId; // Capturamos el ID del registro en 'doctors'

				await conn.commit();

				// 4. CONSULTA FINAL: Devolver el objeto DoctorResponse completo
				if (doctorId) {
					const createdDoctor = await repository.getDoctorByID(doctorId);
					if (!createdDoctor) {
						throw new Error('Failed to fetch created doctor record.');
					}
					return createdDoctor;
				}

				throw new Error('Failed to create doctor record.');

			} catch (error) {
				await conn.rollback();
				console.error('Error in createDoctor:', error);
				throw error;
			} finally {
				conn.release();
			}
		},


		async getPatientByID(id: number, userDoctor: CurrentUser): Promise<PatientResponse | null> {
			const conn = await pool.getConnection()
			try {
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT p.id, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at, u.url_image, u.is_active,
                    p.date_of_birth AS dateOfBirth, p.identification, p.type_identification, p.nationality, u.phone
                    FROM patients p
                    INNER JOIN users u ON p.user_id = u.id
                    INNER JOIN doctor_patients dp ON dp.patient_id = p.id
                    WHERE p.id = ? AND dp.doctor_id = ?`,
					[id, userDoctor.id]
				)

				if (rows.length === 0) {
					return null
				}

				// Mapeo simplificado (asumiendo que los campos de PatientResponse son camelCase)
				return {
					id: rows[0].id,
					user_id: rows[0].user_id,
					firstName: rows[0].first_name,
					lastName: rows[0].last_name,
					email: rows[0].email,
					urlImage: rows[0].url_image,
					isActive: rows[0].is_active,
					createdAt: new Date(rows[0].created_at),
					dateOfBirth: new Date(rows[0].dateOfBirth),
					gender: rows[0].gender,
					identification: rows[0].identification,
					typeIdentification: rows[0].type_identification,
					nationality: rows[0].nationality,
					phone: rows[0].phone
				}
			} catch (error) {
				console.error('Error in getPatientByID:', error)
				throw new Error('Failed to fetch patient')
			} finally {
				conn.release();
			}
		},

		async getDoctorsBySpecialtyID(id: number, limit: number, page: number): Promise<{ doctors: DoctorResponse[], total: number }> {
			const conn = await pool.getConnection()
			try {
				const offset = (page - 1) * limit;
				const [countResult] = await conn.execute<mysql.RowDataPacket[]>(
					'SELECT COUNT(*) as total FROM doctors d'
				);
				const total = countResult[0].total;

				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT d.id, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at,
                    s.name as speciality, d.specialty_id, d.license_number, u.url_image, u.is_active, u.phone, d.bio
                    FROM doctors d
                    INNER JOIN users u ON d.user_id = u.id
                    INNER JOIN specialties s ON s.id = d.specialty_id
                    WHERE d.specialty_id = ?
                    LIMIT ?
                    OFFSET ?`,
					[id, limit, offset]
				)

				const doctors = rows.map(mapDoctorRowToResponse);

				return {
					doctors,
					total
				};
			} catch (error) {
				console.error('Error in getDoctorsBySpecialtyID:', error)
				throw new Error('Failed to fetch doctors by specialty')
			} finally {
				conn.release();
			}
		},

		async getDoctorsByName(name: string): Promise<DoctorResponse[]> {
			const conn = await pool.getConnection()
			try {
				const searchTerm = `%${name}%`;
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT d.id, u.id as user_id, u.first_name, u.last_name, u.email, u.created_at,
                    s.name as speciality, d.specialty_id, d.license_number, u.url_image, u.is_active, u.phone, d.bio
                    FROM doctors d
                    INNER JOIN users u ON d.user_id = u.id
                    INNER JOIN specialties s ON s.id = d.specialty_id
                    WHERE u.first_name LIKE ? OR u.last_name LIKE ? OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
                    LIMIT 10`,
					[searchTerm, searchTerm, searchTerm]
				);

				return rows.map(mapDoctorRowToResponse)
			} catch (error) {
				console.error('Error in getDoctorsByName:', error)
				throw new Error('Failed to fetch doctors by name')
			} finally {
				conn.release();
			}
		},

		async updateDoctor(doctorUpdate: DoctorUpdate): Promise<boolean> {
			const conn = await pool.getConnection()
			try {
				const [rows] = await conn.execute<mysql.ResultSetHeader>(
					`UPDATE users u
                    INNER JOIN doctors d ON u.id = d.user_id
                    SET
                        u.first_name = ?,
                        u.last_name = ?,
                        d.specialty_id = ?,
                        d.bio = ?,
												u.phone = ?
                    WHERE
                        d.id = ?`,
					[doctorUpdate.firstName, doctorUpdate.lastName, doctorUpdate.specialityId, doctorUpdate.bio, doctorUpdate.phone, doctorUpdate.id]
				)

				if (rows.affectedRows === 0) {
					throw new Error('Failed to update doctor')
				}

				return true;
			} catch (error) {
				console.error('Error in updateDoctor:', error)
				throw error
			} finally {
				conn.release();
			}
		},

		async createDoctorByAdmin(doctorCreate: DoctorCreateByAdmin, hashedPassword: string): Promise<User> {
			const conn = await pool.getConnection()
			const role: string = "medico";
			try {
				await conn.beginTransaction();

				const [result] = await conn.execute<mysql.ResultSetHeader>(
					"INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)",
					[doctorCreate.firstName, doctorCreate.lastName, doctorCreate.email, doctorCreate.phone, hashedPassword, role]
				);

				const [newUser] = await conn.execute<mysql.RowDataPacket[]>(
					"SELECT * FROM users WHERE id = ?",
					[result.insertId]
				);

				if (newUser.length === 0) {
					throw new Error('Failed to create user');
				}

				const [rowsSpeciality] = await conn.execute<mysql.RowDataPacket[]>(
					"SELECT id FROM specialties WHERE id = ?",
					[doctorCreate.specialtyId]
				);

				if (rowsSpeciality.length === 0) {
					throw new Error('Speciality not found');
				}

				const [_] = await conn.execute<mysql.ResultSetHeader>(
					"INSERT INTO doctors (user_id, specialty_id, license_number, bio) VALUES (?, ?, ?, ?)",
					[newUser[0].id, doctorCreate.specialtyId, doctorCreate.licenseNumber, doctorCreate.bio]
				);

				await conn.commit();

				// Mapeo a User (ya que esta función es para la creación por admin)
				return {
					id: newUser[0].id,
					firstName: newUser[0].first_name,
					lastName: newUser[0].last_name,
					email: newUser[0].email,
					phone: newUser[0].phone,
					createdAt: new Date(newUser[0].created_at),
					password: newUser[0].password,
					role: newUser[0].role,
					isActive: newUser[0].is_active
				};
			} catch (error) {
				await conn.rollback();
				console.error('Error in createPatient:', error);
				throw error;
			} finally {
				conn.release();
			}
		},
	}

	return repository
}