// src/repositories/availability.ts

import { getPool } from "../database/db_connection"
import { AvailabilityCreate, AvailabilityResponse } from "../models/availability"
import mysql from "mysql2/promise"

// Función de ayuda para mapear una fila a AvailabilityResponse
const mapRow = (row: mysql.RowDataPacket): AvailabilityResponse => ({
	id: row.id,
	doctor_id: row.doctor_id,
	day_of_week: row.day_of_week,
	start_time: row.start_time,
	end_time: row.end_time,
	rest_start_time: row.rest_start_time,
	rest_end_time: row.rest_end_time,
	period_time: row.period_time,
	created_at: row.created_at,
	updated_at: row.updated_at,
})


export interface AvailabilityRepository {
	// CRUD Básico
	createAvailability(data: AvailabilityCreate): Promise<AvailabilityResponse>
	createBulkAvailabilities(data: AvailabilityCreate[]): Promise<AvailabilityResponse[]>
	updateAvailability(id: number, data: Partial<AvailabilityCreate>): Promise<AvailabilityResponse | null>
	deleteAvailability(id: number): Promise<boolean>
	getAvailabilityById(id: number): Promise<AvailabilityResponse | null>

	// Métodos específicos
	getAllByDoctorId(doctorId: number): Promise<AvailabilityResponse[]>
}

export async function makeAvailabilityRepository(): Promise<AvailabilityRepository> {
	const pool = await getPool()

	const repository: AvailabilityRepository = {

		// ---------------------- CREATE ----------------------
		async createAvailability(data: AvailabilityCreate): Promise<AvailabilityResponse> {
			const conn = await pool.getConnection()
			try {
				const insertQuery = `
                    INSERT INTO availabilities 
                    (doctor_id, day_of_week, start_time, end_time, rest_start_time, rest_end_time, period_time) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `
				const values = [
					data.doctor_id, data.day_of_week, data.start_time, data.end_time,
					data.rest_start_time, data.rest_end_time, data.period_time
				]

				const [result] = await conn.execute<mysql.ResultSetHeader>(insertQuery, values)

				const created = await repository.getAvailabilityById(result.insertId)
				if (!created) {
					throw new Error('Failed to retrieve created availability.')
				}
				return created
			} catch (error) {
				console.error("Error creating availability:", error)
				throw error
			} finally {
				conn.release()
			}
		},

		// ---------------------- CREATE BULK ----------------------
		async createBulkAvailabilities(data: AvailabilityCreate[]): Promise<AvailabilityResponse[]> {
			const conn = await pool.getConnection()
			const results: AvailabilityResponse[] = []
			try {
				await conn.beginTransaction()

				const insertQuery = `
                    INSERT INTO availabilities 
                    (doctor_id, day_of_week, start_time, end_time, rest_start_time, rest_end_time, period_time) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `
				for (const item of data) {
					const values = [
						item.doctor_id, item.day_of_week, item.start_time, item.end_time,
						item.rest_start_time, item.rest_end_time, item.period_time
					]
					const [result] = await conn.execute<mysql.ResultSetHeader>(insertQuery, values)

					const createdItem = await repository.getAvailabilityById(result.insertId)
					if (createdItem) {
						results.push(createdItem)
					}
				}
				await conn.commit()
				return results
			} catch (error) {
				await conn.rollback()
				console.error("Error creating bulk availabilities:", error)
				throw error
			} finally {
				conn.release()
			}
		},

		// ---------------------- GET BY ID ----------------------
		async getAvailabilityById(id: number): Promise<AvailabilityResponse | null> {
			const conn = await pool.getConnection()
			try {
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					"SELECT * FROM availabilities WHERE id = ?",
					[id]
				)
				return rows.length ? mapRow(rows[0]) : null
			} catch (error) {
				console.error("Error getting availability by ID:", error)
				throw error
			} finally {
				conn.release()
			}
		},

		// ---------------------- GET ALL BY DOCTOR ----------------------
		async getAllByDoctorId(doctorId: number): Promise<AvailabilityResponse[]> {
			const conn = await pool.getConnection()
			try {
				// Ordenamos por día de la semana (Lunes a Domingo) y luego por hora de inicio
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					"SELECT * FROM availabilities WHERE doctor_id = ? ORDER BY FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'), start_time ASC",
					[doctorId]
				)
				return rows.map(mapRow)
			} catch (error) {
				console.error("Error getting availabilities by doctor ID:", error)
				throw error
			} finally {
				conn.release()
			}
		},

		// ---------------------- UPDATE ----------------------
		async updateAvailability(id: number, data: Partial<AvailabilityCreate>): Promise<AvailabilityResponse | null> {
			const conn = await pool.getConnection()
			try {
				const fields: string[] = []
				const values: any[] = []

				// Mapeo dinámico de campos
				for (const [key, value] of Object.entries(data)) {
					fields.push(`${key} = ?`);
					values.push(value);
				}

				if (fields.length === 0) return repository.getAvailabilityById(id); 

				const updateQuery = `UPDATE availabilities SET ${fields.join(', ')} WHERE id = ?`;
				const updateValues = [...values, id];

				const [result] = await conn.execute<mysql.ResultSetHeader>(updateQuery, updateValues);

				if (result.affectedRows === 0) {
					return repository.getAvailabilityById(id); 
				}

				return repository.getAvailabilityById(id);
			} catch (error) {
				console.error("Error updating availability:", error);
				throw error;
			} finally {
				conn.release();
			}
		},

		// ---------------------- DELETE ----------------------
		async deleteAvailability(id: number): Promise<boolean> {
			const conn = await pool.getConnection()
			try {
				const [result] = await conn.execute<mysql.ResultSetHeader>(
					"DELETE FROM availabilities WHERE id = ?",
					[id]
				)
				return result.affectedRows > 0
			} catch (error) {
				console.error("Error deleting availability:", error)
				throw error
			} finally {
				conn.release()
			}
		},
	}

	return repository
}