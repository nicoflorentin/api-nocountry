import { getPool } from "../database/db_connection"
import { AvailabilityResponse } from "../models/availability"
import mysql from "mysql2/promise"

export interface AvailabilityRepository {
	getAllAvailabilities(): Promise<AvailabilityResponse[]>
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
						period_time,
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
						period_time,
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
	}
}
