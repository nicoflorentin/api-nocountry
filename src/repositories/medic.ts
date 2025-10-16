import { User } from "../models/user"
import mysql from "mysql2/promise"
import { getPool } from "../database/db_connection"
import { MedicCreate, MedicResponse } from "../models/medic"

export interface MedicRepository {
	getMedicByID(id: number): Promise<MedicResponse | null>
	getAllMedics(): Promise<MedicResponse[]>
	createMedic(medic: MedicCreate): Promise<MedicResponse>
}

export async function makeMedicRepository() {
	const pool = await getPool()
	const conn = await pool.getConnection()

	return {
		async getMedicByID(id: number): Promise<MedicResponse | null> {
			try {
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
                  s.name as speciality, d.license_number
           FROM users u
           INNER JOIN doctors d ON d.user_id = u.id
           INNER JOIN specialties s ON s.id = d.specialty_id
           WHERE u.id = ?
           AND u.role = 'medico'`,
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

		async getAllMedics(): Promise<MedicResponse[]> {
			try {
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
                  s.name as speciality, d.license_number
           FROM users u
           INNER JOIN doctors d ON d.user_id = u.id
           INNER JOIN specialties s ON s.id = d.specialty_id
           WHERE u.role = 'medico'`
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
	}
}
