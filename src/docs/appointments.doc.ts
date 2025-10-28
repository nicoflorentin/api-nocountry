/**
 * @swagger
 * tags:
 *   - name: Appointments
 *     description: Gestión de Citas Médicas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentCreate:
 *       type: object
 *       required: [availability_id, doctor_id, patient_id, day, start_time, end_time, consultation_type]
 *       properties:
 *         availability_id:
 *           type: integer
 *           example: 101
 *           description: "ID de la disponibilidad horaria del doctor"
 *         doctor_id:
 *           type: integer
 *           example: 5
 *           description: "ID del doctor"
 *         patient_id:
 *           type: integer
 *           example: 10
 *           description: "ID del paciente"
 *         day:
 *           type: string
 *           format: date
 *           example: "2025-11-15"
 *           description: "Fecha de la cita (YYYY-MM-DD)"
 *         start_time:
 *           type: string
 *           format: time
 *           example: "10:00:00"
 *           description: "Hora de inicio de la cita (HH:MM:SS)"
 *         end_time:
 *           type: string
 *           format: time
 *           example: "10:30:00"
 *           description: "Hora de fin de la cita (HH:MM:SS)"
 *         consultation_type:
 *           type: string
 *           enum: [virtual, presencial]
 *           example: "virtual"
 *           description: "Tipo de consulta"
 *       example:
 *         availability_id: 101
 *         doctor_id: 5
 *         patient_id: 10
 *         day: "2025-11-15"
 *         start_time: "10:00:00"
 *         end_time: "10:30:00"
 *         consultation_type: "virtual"
 *
 *     AppointmentResponse:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         availability_id: { type: integer }
 *         doctor_id: { type: integer }
 *         patient_id: { type: integer, nullable: true }
 *         day: { type: string, format: date }
 *         start_time: { type: string, format: time }
 *         end_time: { type: string, format: time }
 *         status: { $ref: '#/components/schemas/AppointmentStatus' }
 *         consultation_type: { type: string, enum: [virtual, presencial] }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *
 *     AppointmentDetailResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/AppointmentResponse'
 *         - type: object
 *           properties:
 *             doctorFirstName: { type: string }
 *             doctorLastName: { type: string }
 *             patientFirstName: { type: string, nullable: true }
 *             patientLastName: { type: string, nullable: true }
 *             specialityName: { type: string }
 *
 *     AppointmentUpdate:
 *       allOf:
 *         - $ref: '#/components/schemas/AppointmentCreate'
 *         - type: object
 *           description: Todos los campos son opcionales.
 *       example:
 *         day: "2025-11-16"
 *         consultation_type: "presencial"
 *
 *     AppointmentStatus:
 *       type: string
 *       enum: [confirmado, cancelado, completado]
 *       description: Estado de la cita.
 *
 *     TimeSlot:
 *       type: object
 *       properties:
 *         start: { type: string, format: time, example: "09:00:00" }
 *         end: { type: string, format: time, example: "09:30:00" }
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Crea una nueva cita (reserva un slot de tiempo).
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreate'
 *     responses:
 *       201:
 *         description: Cita creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Error de validación de campos.
 *       404:
 *         description: Doctor, Paciente o Disponibilidad no encontrados.
 *       409:
 *         description: Conflicto - El slot de tiempo ya está reservado (SLOT_ALREADY_BOOKED).
 */

/**
 * @swagger
 * /api/appointments/patient/{id}:
 *   get:
 *     summary: Obtiene el historial de citas de un paciente.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del paciente.
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         description: Filtra por el estado de la cita.
 *         schema:
 *           $ref: '#/components/schemas/AppointmentStatus'
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de citas ordenadas por fecha descendente (más recientes primero).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AppointmentDetailResponse'
 *                 total:
 *                   type: integer
 *       404:
 *         description: Paciente no encontrado.
 */

/**
 * @swagger
 * /api/appointments/doctor/{id}:
 *   get:
 *     summary: Obtiene el historial de citas de un doctor.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del doctor.
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         description: Filtra por el estado de la cita.
 *         schema:
 *           $ref: '#/components/schemas/AppointmentStatus'
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de citas ordenadas por fecha descendente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AppointmentDetailResponse'
 *                 total:
 *                   type: integer
 *       404:
 *         description: Doctor no encontrado.
 */

/**
 * @swagger
 * /api/appointments/upcoming/{patientId}:
 *   get:
 *     summary: Obtiene el próximo turno programado para un paciente.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         description: ID del paciente.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Próximo turno encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentDetailResponse'
 *       404:
 *         description: Paciente no encontrado o no hay citas próximas.
 */

/**
 * @swagger
 * /api/appointments/available/{doctorId}:
 *   get:
 *     summary: Genera la lista de slots de tiempo DISPONIBLES para un doctor en un día específico.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: doctorId
 *         in: path
 *         required: true
 *         description: ID del doctor.
 *         schema:
 *           type: integer
 *       - name: day
 *         in: query
 *         required: true
 *         description: Fecha para la cual buscar slots disponibles (formato YYYY-MM-DD).
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-11-15"
 *     responses:
 *       200:
 *         description: Lista de slots de tiempo disponibles (inicio y fin).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimeSlot'
 *       400:
 *         description: Parámetro 'day' inválido o faltante.
 *       404:
 *         description: Doctor no encontrado.
 */

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Obtiene los detalles completos de una cita específica por su ID.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cita a obtener.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalles completos de la cita.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentDetailResponse'
 *       404:
 *         description: Cita no encontrada.
 *   patch:
 *     summary: Actualiza campos parciales de una cita (excepto estado).
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cita.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentUpdate'
 *     responses:
 *       200:
 *         description: Cita actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Error de validación.
 *       404:
 *         description: Cita no encontrada.
 *   delete:
 *     summary: Elimina una cita.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cita a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cita eliminada exitosamente (No Content).
 *       404:
 *         description: Cita no encontrada.
 */

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Marca una cita como 'cancelada'.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cita cancelada.
 *       404:
 *         description: Cita no encontrada.
 */

/**
 * @swagger
 * /api/appointments/{id}/complete:
 *   patch:
 *     summary: Marca una cita como 'completada'.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cita marcada como completada.
 *       404:
 *         description: Cita no encontrada.
 */

/**
 * @swagger
 * /api/appointments/{id}/confirm:
 *   patch:
 *     summary: Marca una cita como 'confirmada'.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cita marcada como confirmada.
 *       404:
 *         description: Cita no encontrada.
 */