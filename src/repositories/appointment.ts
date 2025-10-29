import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise'; 
import { getPool } from '../database/db_connection';
import { AppointmentCreate, AppointmentDetailResponse, AppointmentResponse, AppointmentStatus, BlockSlotCreate, ConsultationType } from '../models/appointment';
import { ConsultationDetailCreate, HealthSummaryCreate, MedicalConsultationDetail, HealthSummary } from '../models/medical_history';

// Interfaz que define el contrato de la capa de acceso a datos.
export interface AppointmentRepository {
    createAppointment(data: AppointmentCreate): Promise<AppointmentResponse>;
    getAppointmentById(id: number): Promise<AppointmentResponse | null>;
    updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<boolean>;
    updateAppointment(id: number, data: Partial<AppointmentCreate>): Promise<AppointmentResponse | null>;
    deleteAppointment(id: number): Promise<boolean>;
    blockSlot(data: BlockSlotCreate): Promise<AppointmentResponse>;

    // Métodos complejos (Requerimientos)
    getAllByPatientId(patientId: number, status?: AppointmentStatus, limit?: number, page?: number): Promise<{ appointments: AppointmentDetailResponse[], total: number }>;
    getAllByDoctorId(doctorId: number, status?: AppointmentStatus, limit?: number, page?: number): Promise<{ appointments: AppointmentDetailResponse[], total: number }>;
    getUpcomingAppointment(patientId: number): Promise<AppointmentDetailResponse | null>;
    getUpcomingAppointmentForDoctor(doctorId: number): Promise<AppointmentDetailResponse | null>;
    getAvailableSlots(doctorId: number, day: string): Promise<AppointmentResponse[]>;
    isSlotBooked(doctorId: number, day: string, startTime: string): Promise<boolean>;

    getAppointmentDetailById(id: number): Promise<AppointmentDetailResponse | null>;
    getReservedAppointments(doctorId: number, day: string): Promise<AppointmentResponse[]>;
    getAppointmentsForDoctorByDay(doctorId: number, day: string): Promise<AppointmentDetailResponse[]>

    /**
     * @description Inserta los detalles de la consulta, opcionalmente el resumen de salud,
     * y marca la cita como completada dentro de una transacción.
     */
    completeConsultation(
        consultationData: ConsultationDetailCreate,
        summaryData?: HealthSummaryCreate | null
    ): Promise<MedicalConsultationDetail | null>;
}

// Función de mapeo para la respuesta detallada (JOINs)
const mapRowToAppointmentDetail = (row: RowDataPacket): AppointmentDetailResponse => ({
    id: row.id,
    availability_id: row.availability_id,
    doctor_id: row.doctor_id,
    patient_id: row.patient_id,
    day: row.day,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status as AppointmentStatus,
    consultation_type: row.consultation_type,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    // Propiedades del JOIN
    doctorFirstName: row.doctor_first_name,
    doctorLastName: row.doctor_last_name,
    patientFirstName: row.patient_first_name,
    patientLastName: row.patient_last_name,
    specialityName: row.speciality_name,
});

// Query base con todos los JOINs necesarios para los listados
const BASE_SELECT_QUERY = `
    SELECT
        a.*,
        du.first_name AS doctor_first_name,
        du.last_name AS doctor_last_name,
        pu.first_name AS patient_first_name,
        pu.last_name AS patient_last_name,
        s.name AS speciality_name
    FROM appointments a
    INNER JOIN doctors d ON a.doctor_id = d.id
    INNER JOIN users du ON d.user_id = du.id 
    INNER JOIN specialties s ON d.specialty_id = s.id
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users pu ON p.user_id = pu.id 
`;

export async function makeAppointmentRepository(): Promise<AppointmentRepository> {
    const pool = await getPool();

    const repository: AppointmentRepository = {

        // ---------------------- CREATE ----------------------
        async createAppointment(data: AppointmentCreate): Promise<AppointmentResponse> {
            const conn = await pool.getConnection();
            try {
                const query = `
                    INSERT INTO appointments
                    (availability_id, doctor_id, patient_id, day, start_time, end_time, consultation_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                const values = [
                    data.availability_id, data.doctor_id, data.patient_id,
                    data.day, data.start_time, data.end_time, data.consultation_type
                ];
                const [result] = await conn.execute<ResultSetHeader>(query, values);

                const created = await repository.getAppointmentById(result.insertId);
                if (!created) {
                    throw new Error('Failed to retrieve created appointment.');
                }
                return created;
            } catch (error) {
                console.error("Error creating appointment:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- GET BY ID (Simple) ----------------------
        async getAppointmentById(id: number): Promise<AppointmentResponse | null> {
            const conn = await pool.getConnection();
            try {
                const [rows] = await conn.execute<RowDataPacket[]>(
                    "SELECT * FROM appointments WHERE id = ?",
                    [id]
                );
                return rows.length ? (rows[0] as AppointmentResponse) : null;
            } catch (error) {
                console.error("Error getting appointment by ID:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- GET DETAIL BY ID  ----------------------
        async getAppointmentDetailById(id: number): Promise<AppointmentDetailResponse | null> {
            const conn = await pool.getConnection();
            try {
                const query = `${BASE_SELECT_QUERY} WHERE a.id = ?`;

                const [rows] = await conn.execute<RowDataPacket[]>(query, [id]);

                if (rows.length === 0) {
                    return null;
                }

                // Mapeamos el resultado a AppointmentDetailResponse
                return mapRowToAppointmentDetail(rows[0]);
            } catch (error) {
                console.error("Error fetching appointment detail by ID:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- LISTAR POR DOCTOR (Paginación y Estado) ----------------------
        async getAllByDoctorId(doctorId: number, status?: AppointmentStatus, limit: number = 10, page: number = 1): Promise<{ appointments: AppointmentDetailResponse[], total: number }> {
            const conn = await pool.getConnection();
            try {
                const offset = (page - 1) * limit;
                let whereClause = "WHERE a.doctor_id = ?";
                const values: any[] = [doctorId];

                if (status) {
                    whereClause += " AND a.status = ?";
                    values.push(status);
                }

                // Total Count
                const [countResult] = await conn.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM appointments a ${whereClause}`, values);
                const total = countResult[0].total;

                // Data Query (ordenado por fecha descendente)
                const query = `${BASE_SELECT_QUERY} ${whereClause} ORDER BY a.day DESC, a.start_time DESC LIMIT ? OFFSET ?`;

                const [rows] = await conn.execute<RowDataPacket[]>(query, [...values, limit, offset]);

                return {
                    appointments: rows.map(mapRowToAppointmentDetail),
                    total
                };
            } catch (error) {
                console.error("Error fetching appointments by doctor ID:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- LISTAR POR PACIENTE (Paginación y Estado) ----------------------
        async getAllByPatientId(patientId: number, status?: AppointmentStatus, limit: number = 10, page: number = 1): Promise<{ appointments: AppointmentDetailResponse[], total: number }> {
            const conn = await pool.getConnection();
            try {
                const offset = (page - 1) * limit;
                let whereClause = "WHERE a.patient_id = ?";
                const values: any[] = [patientId];

                if (status) {
                    whereClause += " AND a.status = ?";
                    values.push(status);
                }

                // Total Count
                const [countResult] = await conn.execute<RowDataPacket[]>(`SELECT COUNT(*) as total FROM appointments a ${whereClause}`, values);
                const total = countResult[0].total;

                // Data Query (ordenado por fecha descendente)
                const query = `${BASE_SELECT_QUERY} ${whereClause} ORDER BY a.day DESC, a.start_time DESC LIMIT ? OFFSET ?`;

                const [rows] = await conn.execute<RowDataPacket[]>(query, [...values, limit, offset]);

                return {
                    appointments: rows.map(mapRowToAppointmentDetail),
                    total
                };
            } catch (error) {
                console.error("Error fetching appointments by patient ID:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- PRÓXIMO TURNO (Paciente) ----------------------
        async getUpcomingAppointment(patientId: number): Promise<AppointmentDetailResponse | null> {
            const conn = await pool.getConnection();
            try {
                // Filtramos por citas no completadas (confirmado, cancelado) y fechas futuras
                const query = `
                    ${BASE_SELECT_QUERY}
                    WHERE a.patient_id = ?
                    AND a.status IN ('confirmado')
                    AND CONCAT(a.day, ' ', a.start_time) >= NOW()
                    ORDER BY a.day ASC, a.start_time ASC
                    LIMIT 1
                `;
                const [rows] = await conn.execute<RowDataPacket[]>(query, [patientId]);

                return rows.length ? mapRowToAppointmentDetail(rows[0]) : null;
            } catch (error) {
                console.error("Error fetching upcoming appointment:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- PRÓXIMO TURNO (DOCTOR) ----------------------
        async getUpcomingAppointmentForDoctor(doctorId: number): Promise<AppointmentDetailResponse | null> {
            const conn = await pool.getConnection();
            try {
                // Similar a getUpcomingAppointment, pero filtra por doctor_id
                const query = `
                    ${BASE_SELECT_QUERY}
                    WHERE a.doctor_id = ? 
                    AND a.status IN ('confirmado') 
                    AND CONCAT(a.day, ' ', a.start_time) >= NOW()
                    ORDER BY a.day ASC, a.start_time ASC
                    LIMIT 1
                `;
                const [rows] = await conn.execute<RowDataPacket[]>(query, [doctorId]);

                return rows.length ? mapRowToAppointmentDetail(rows[0]) : null;
            } catch (error) {
                console.error("Error fetching upcoming appointment for doctor:", error);
                throw error; // Propagar error
            } finally {
                conn.release();
            }
        },

        // ---------------------- UPDATE STATUS (Confirmar/Cancelar/Completar) ----------------------
        async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<boolean> {
            const conn = await pool.getConnection();
            try {
                const [result] = await conn.execute<ResultSetHeader>(
                    "UPDATE appointments SET status = ? WHERE id = ?",
                    [status, id]
                );
                return result.affectedRows > 0;
            } catch (error) {
                console.error("Error updating appointment status:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- UPDATE GENERAL ----------------------
        async updateAppointment(id: number, data: Partial<AppointmentCreate>): Promise<AppointmentResponse | null> {
            const conn = await pool.getConnection();
            try {
                const fields: string[] = [];
                const values: any[] = [];

                for (const [key, value] of Object.entries(data)) {
                    fields.push(`${key} = ?`);
                    values.push(value);
                }

                if (fields.length === 0) return repository.getAppointmentById(id);

                const updateQuery = `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`;
                const updateValues = [...values, id];

                const [result] = await conn.execute<ResultSetHeader>(updateQuery, updateValues);

                // Si la actualización es exitosa, devolvemos el objeto actualizado.
                return repository.getAppointmentById(id);
            } catch (error) {
                console.error("Error updating appointment:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- DELETE ----------------------
        async deleteAppointment(id: number): Promise<boolean> {
            const conn = await pool.getConnection();
            try {
                const [result] = await conn.execute<ResultSetHeader>(
                    "DELETE FROM appointments WHERE id = ?",
                    [id]
                );
                return result.affectedRows > 0;
            } catch (error) {
                console.error("Error deleting appointment:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- UTILIDADES DE LÓGICA ----------------------
        async isSlotBooked(doctorId: number, day: string, startTime: string): Promise<boolean> {
            const conn = await pool.getConnection();
            try {
                const [rows] = await conn.execute<RowDataPacket[]>(
                    `SELECT id FROM appointments
                      WHERE doctor_id = ? AND day = ? AND start_time = ? AND status IN ('confirmado', 'pendiente')`,
                    [doctorId, day, startTime]
                );
                return rows.length > 0;
            } catch (error) {
                console.error("Error checking slot booking:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- BLOCK SLOT ----------------------
        async blockSlot(data: BlockSlotCreate): Promise<AppointmentResponse> {
            const conn = await pool.getConnection();
            try {
                // Usaremos status 'confirmado' para que isSlotBooked lo detecte,
                // pero sin patient_id se interpreta como bloqueo.
                const status: AppointmentStatus = 'confirmado';
                // Tipo de consulta podría ser presencial por defecto o uno nuevo 'bloqueo'
                const consultation_type: ConsultationType = 'presencial';

                const query = `
                    INSERT INTO appointments 
                    (availability_id, doctor_id, patient_id, day, start_time, end_time, status, consultation_type) 
                    VALUES (?, ?, NULL, ?, ?, ?, ?, ?) 
                `; // patient_id es NULL
                const values = [
                    data.availability_id, data.doctor_id, data.day,
                    data.start_time, data.end_time, status, consultation_type
                    // Se podría añadir data.reason a un campo 'notes' si existiera
                ];
                const [result] = await conn.execute<ResultSetHeader>(query, values);

                const created = await repository.getAppointmentById(result.insertId);
                if (!created) {
                    throw new Error('Failed to retrieve created block slot.');
                }
                // Nota: Considerar añadir el 'reason' a la respuesta si se guarda en DB
                return created;
            } catch (error) {
                console.error("Error blocking slot:", error);
                throw error; // Propagar para manejo en capas superiores
            } finally {
                conn.release();
            }
        },

        async getReservedAppointments(doctorId: number, day: string): Promise<AppointmentResponse[]> {
            const conn = await pool.getConnection();
            try {
                const [rows] = await conn.execute<RowDataPacket[]>(
                    `SELECT * FROM appointments
                     WHERE doctor_id = ? AND day = ?
                     AND status IN ('confirmado', 'pendiente')
                     ORDER BY start_time ASC`,
                    [doctorId, day]
                );

                return rows.map(row => row as AppointmentResponse);
            } catch (error) {
                console.error("Error getting reserved appointments:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // ---------------------- CITAS POR DÍA (DOCTOR) ----------------------
        async getAppointmentsForDoctorByDay(doctorId: number, day: string): Promise<AppointmentDetailResponse[]> { // <-- Acepta 'day'
            const conn = await pool.getConnection();
            try {
                // Usamos el parámetro 'day' en lugar de CURDATE()
                const query = `
                ${BASE_SELECT_QUERY} 
                WHERE a.doctor_id = ? 
                AND a.day = ? 
                AND a.status IN ('confirmado', 'pendiente') 
                ORDER BY a.start_time ASC 
            `;

                const [rows] = await conn.execute<RowDataPacket[]>(query, [doctorId, day]); // <-- Pasar 'day'

                return rows.map(mapRowToAppointmentDetail);
            } catch (error) {
                console.error("Error fetching appointments for doctor by day:", error);
                throw error;
            } finally {
                conn.release();
            }
        },

        // Se mantiene la firma del contrato, pero la implementación usa getReservedAppointments
        async getAvailableSlots(doctorId: number, day: string): Promise<AppointmentResponse[]> {
            
            return repository.getReservedAppointments(doctorId, day);
        },

        // --- METODO DE COMPLETAR CONSULTA ---
        async completeConsultation(
            consultationData: ConsultationDetailCreate,
            summaryData?: HealthSummaryCreate | null
        ): Promise<MedicalConsultationDetail | null> {
            // 1. Obtener una conexión para la transacción
            const conn = await pool.getConnection();
            let createdConsultationDetailId: number | null = null;

            try {
                // 2. Iniciar transacción
                await conn.beginTransaction();

                // 3. Insertar en medical_consultations_detail
                const consultQuery = `
                    INSERT INTO medical_consultations_detail 
                    (doctor_id, patient_id, appointment_id, reason_for_consultation, description, diagnosis, instructions, notes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const consultValues = [
                    consultationData.doctor_id, consultationData.patient_id, consultationData.appointment_id,
                    consultationData.reason_for_consultation, consultationData.description, consultationData.diagnosis,
                    consultationData.instructions, consultationData.notes
                ];
                const [consultResult] = await conn.execute<ResultSetHeader>(consultQuery, consultValues);
                createdConsultationDetailId = consultResult.insertId; // Guardar el ID creado

                // 4. Insertar en health_summaries (si se proporcionaron datos)
                if (summaryData) {
                    const summaryQuery = `
                        INSERT INTO health_summaries 
                        (patient_id, summary_date, temperature, height, weight, systolic_pressure, diastolic_pressure, blood_type) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    const summaryValues = [
                        summaryData.patient_id, summaryData.summary_date, summaryData.temperature, summaryData.height,
                        summaryData.weight, summaryData.systolic_pressure, summaryData.diastolic_pressure, summaryData.blood_type
                    ];
                    await conn.execute<ResultSetHeader>(summaryQuery, summaryValues);
                }

                // 5. Actualizar el estado de la cita a 'completado'
                const updateAppointmentQuery = "UPDATE appointments SET status = ? WHERE id = ?";
                const [updateResult] = await conn.execute<ResultSetHeader>(updateAppointmentQuery, ['completado', consultationData.appointment_id]);

                // Verificar si la cita realmente se actualizó (opcional pero recomendado)
                if (updateResult.affectedRows === 0) {
                    throw new Error(`Appointment with ID ${consultationData.appointment_id} not found or status already updated.`);
                }

                // 6. Confirmar transacción
                await conn.commit();

                // 7. Obtener y devolver el detalle de consulta recién creado (opcional, pero útil)
                if (createdConsultationDetailId) {
                    // Necesitamos un método para obtener el detalle por su ID
                    // Por ahora, devolvemos un objeto básico o null
                    // TODO: Implementar getConsultationDetailById(id)
                    const [detailRows] = await conn.execute<MedicalConsultationDetail[]>(
                        "SELECT * FROM medical_consultations_detail WHERE id = ?",
                        [createdConsultationDetailId]
                    );
                    return detailRows.length > 0 ? detailRows[0] : null;
                }
                return null; // Si no se pudo obtener el ID

            } catch (error) {
                // 8. Si algo falla, deshacer todos los cambios
                await conn.rollback();
                console.error("Error completing consultation:", error);
                // Propagar el error para que el servicio lo maneje (ej. FK no encontrada, etc.)
                throw error;
            } finally {
                // 9. Liberar la conexión siempre
                conn.release();
            }
        },

    };

    return repository;
}

