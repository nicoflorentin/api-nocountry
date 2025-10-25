import mysql from 'mysql2/promise';
import { getPool } from '../database/db_connection';
import { SpecialtyResponse } from "../models/specialty";

export interface SpecialtyRepository {
  getAllSpecialties(): Promise<SpecialtyResponse[]>;
}

export async function makeSpecialtyRepository() {
  const pool = await getPool();
  return {
    async getAllSpecialties(): Promise<SpecialtyResponse[]> {
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          "SELECT id, name FROM specialties ORDER BY name ASC",
        );

        return (rows as any[]).map(row => ({
          id: row.id,
          name: row.name
        }));
      } catch (error) {
        console.error('Error in getUserByID:', error);
        throw new Error('Failed to fetch user by ID');
      } finally {
        conn.release();
      }
    },
  };
}