import { getPool } from "../database/db_connection"
import { AvailabilityResponse, AvailabilityUpdatePayload } from "../models/availability"
import mysql from "mysql2/promise"

export interface AvailabilityRepository {
	getAllAvailabilities(): Promise<AvailabilityResponse[]>
	getAvailabilitiesByDoctorID(id: number): Promise<AvailabilityResponse>
	updateAvailability(id: number, dayOfWeek: string, availability: AvailabilityUpdatePayload): Promise<AvailabilityResponse>
}

export async function makeAvailabilityRepository(): Promise<AvailabilityRepository> {
	const pool = await getPool()

	return {
		async getAllAvailabilities(): Promise<AvailabilityResponse[]> {
			const conn = await pool.getConnection()
			try {
				const [availabilityRows] = await conn.query<mysql.RowDataPacket[]>("SELECT * FROM availabilities")

				return availabilityRows.map(
					({
						id,
						doctor_id,
						day_of_week,
						start_time,
						end_time,
						rest_start_time,
						rest_end_time,
						period_duration,
						created_at,
						updated_at,
					}) => ({
						id,
						doctor_id,
						day_of_week,
						start_time,
						end_time,
						rest_start_time,
						rest_end_time,
						period_duration,
						created_at,
						updated_at,
					})
				)
			} catch (error) {
				console.error("❌ Error in getAllAvailabilities repository:", error)
				throw new Error("Failed to fetch availabilities from database")
			} finally {
				conn.release()
			}
		},

		async getAvailabilitiesByDoctorID(doctorId: number): Promise<AvailabilityResponse> {
			const conn = await pool.getConnection()
			try {
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT id, doctor_id, day_of_week, start_time, end_time,   
              rest_start_time, rest_end_time, period_time, created_at  
       FROM availabilities  
       WHERE doctor_id = ?`,
					[doctorId]
				)

				return {
					id: rows[0].id,
					doctor_id: rows[0].doctor_id,
					day_of_week: rows[0].day_of_week,
					start_time: rows[0].start_time,
					end_time: rows[0].end_time,
					rest_start_time: rows[0].rest_start_time,
					rest_end_time: rows[0].rest_end_time,
					period_duration: rows[0].period_time,
					created_at: new Date(rows[0].created_at),
				}
			} catch (error) {
				console.error("Error in getAvailabilitiesByDoctorID:", error)
				throw new Error("Failed to fetch availabilities by doctor")
			} finally {
				conn.release()
			}
		},

		async updateAvailability(
			doctorId: number,
			dayOfWeek: string,
			update: AvailabilityUpdatePayload
		): Promise<AvailabilityResponse> {
			const conn = await pool.getConnection()
			try {
				const [result] = await conn.execute<mysql.ResultSetHeader>(
					`UPDATE availabilities     
       SET start_time = ?, end_time = ?,    
           rest_start_time = ?, rest_end_time = ?, period_time = ?    
       WHERE doctor_id = ? AND day_of_week = ?`,
					[
						update.startTime,
						update.endTime,
						update.restStartTime,
						update.restEndTime,
						update.periodTime,
						doctorId,
						dayOfWeek,
					]
				)

				if (result.affectedRows === 0) {
					throw new Error("Availability not found for this doctor and day")
				}

				// Obtener el registro actualizado
				const [rows] = await conn.execute<mysql.RowDataPacket[]>(
					`SELECT * FROM availabilities   
       WHERE doctor_id = ? AND day_of_week = ?`,
					[doctorId, dayOfWeek]
				)

				return {
					id: rows[0].id,
					doctor_id: rows[0].doctor_id,
					day_of_week: rows[0].day_of_week,
					start_time: rows[0].start_time,
					end_time: rows[0].end_time,
					rest_start_time: rows[0].rest_start_time,
					rest_end_time: rows[0].rest_end_time,
					period_duration: rows[0].period_time,
					created_at: new Date(rows[0].created_at),
				}
			} catch (error) {
				console.error("Error updating availability:", error)
				throw error
			} finally {
				conn.release()
			}
		},
	}
}
