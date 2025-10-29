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
 *         start: 
 *           type: string
 *           format: time
 *           example: "09:00:00"
 *         end: 
 *           type: string
 *           format: time
 *           example: "09:30:00"
 *       description: Representa un slot de tiempo disponible.
 *       example:
 *         start: "09:00:00"
 *         end: "09:30:00"
 * 
 *     BlockSlotCreate:
 *       type: object
 *       required: [availability_id, doctor_id, day, start_time, end_time]
 *       properties:
 *         availability_id:
 *           type: integer
 *           example: 150
 *           description: "ID de la disponibilidad horaria del doctor"
 *         doctor_id:
 *           type: integer
 *           example: 5
 *           description: "ID del doctor"
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
 *         reason:
 *           type: string
 *           example: "El paciente canceló la cita."
 *           description: "Motivo por el cual se bloquea el slot."
 *       example:
 *         availability_id: 150
 *         doctor_id: 5
 *         day: "2025-11-15"
 *         start_time: "10:00:00"
 *         end_time: "10:30:00"
 *         reason: "El paciente no se presentó a la cita."
 * 
 *     ConsultationData:
 *       type: object
 *       required: [doctor_id, patient_id, appointment_id, reason_for_consultation, diagnosis]
 *       properties:
 *         doctor_id:
 *           type: integer
 *           example: 5
 *           description: "ID del doctor que realiza la consulta"
 *         patient_id:
 *           type: integer
 *           example: 10
 *           description: "ID del paciente"
 *         appointment_id:
 *           type: integer
 *           example: 100
 *           description: "ID de la cita médica"
 *         reason_for_consultation:
 *           type: string
 *           example: "Dolor de cabeza persistente y mareos"
 *           description: "Motivo de la consulta médica"
 *         description:
 *           type: string
 *           example: "El paciente reporta dolores de cabeza tipo punzada en la sien derecha, 3 veces por semana, acompañados de náuseas ocasionales. Empezaron hace 2 meses."
 *           description: "Descripción detallada de los síntomas"
 *         diagnosis:
 *           type: string
 *           example: "Migraña crónica con aura visual."
 *           description: "Diagnóstico médico realizado por el doctor"
 *         instructions:
 *           type: string
 *           example: "Tomar Sumatriptán 50mg al inicio del aura. Evitar desencadenantes conocidos (estrés, falta de sueño). Llevar diario de cefaleas."
 *           description: "Instrucciones para el paciente"
 *         notes:
 *           type: string
 *           example: "Se descarta cefalea tensional por características del dolor. Se solicitan estudios de neuroimagen si no hay mejoría en 1 mes. Próximo control en 4 semanas."
 *           description: "Notas adicionales del doctor"
 *
 *     SummaryData:
 *       type: object
 *       required: [patient_id, summary_date]
 *       properties:
 *         patient_id:
 *           type: integer
 *           example: 10
 *           description: "ID del paciente"
 *         summary_date:
 *           type: string
 *           format: date
 *           example: "2025-10-29"
 *           description: "Fecha del resumen médico (debe coincidir o ser cercano al día de la cita)"
 *         temperature:
 *           type: number
 *           format: float
 *           example: 36.8
 *           description: "Temperatura corporal en grados Celsius"
 *         height:
 *           type: number
 *           format: float
 *           example: 175.0
 *           description: "Altura del paciente en centímetros"
 *         weight:
 *           type: number
 *           format: float
 *           example: 78.5
 *           description: "Peso del paciente en kilogramos"
 *         systolic_pressure:
 *           type: integer
 *           example: 125
 *           description: "Presión arterial sistólica"
 *         diastolic_pressure:
 *           type: integer
 *           example: 82
 *           description: "Presión arterial diastólica"
 *         blood_type:
 *           type: string
 *           example: "O+"
 *           description: "Tipo de sangre del paciente"
 *
 *     CompleteConsultationPayload:
 *       type: object
 *       required: [consultation, summary]
 *       properties:
 *         consultation:
 *           $ref: '#/components/schemas/ConsultationData'
 *         summary:
 *           $ref: '#/components/schemas/SummaryData'
 *       example:
 *         consultation:
 *           doctor_id: 5
 *           patient_id: 10
 *           appointment_id: 100
 *           reason_for_consultation: "Dolor de cabeza persistente y mareos"
 *           description: "El paciente reporta dolores de cabeza tipo punzada en la sien derecha, 3 veces por semana, acompañados de náuseas ocasionales. Empezaron hace 2 meses."
 *           diagnosis: "Migraña crónica con aura visual."
 *           instructions: "Tomar Sumatriptán 50mg al inicio del aura. Evitar desencadenantes conocidos (estrés, falta de sueño). Llevar diario de cefaleas."
 *           notes: "Se descarta cefalea tensional por características del dolor. Se solicitan estudios de neuroimagen si no hay mejoría en 1 mes. Próximo control en 4 semanas."
 *         summary:
 *           patient_id: 10
 *           summary_date: "2025-10-29"
 *           temperature: 36.8
 *           height: 175.0
 *           weight: 78.5
 *           systolic_pressure: 125
 *           diastolic_pressure: 82
 *           blood_type: "O+"
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
 * /api/appointments/upcoming/doctor/{doctorId}:
 *   get:
 *     summary: Obtiene el próximo turno programado para un doctor.
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
 *     responses:
 *       200:
 *         description: Próximo turno encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentDetailResponse'
 *       404:
 *         description: Doctor no encontrado o no hay citas próximas.
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


/**
 * @swagger
 * /api/appointments/{id}/no-show:
 *   patch:
 *     summary: Marca una cita como 'ausente'.
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
 *         description: Cita marcada como no presentada.
 *       404:
 *         description: Cita no encontrada.
 */



/**
 * @swagger
 * /api/appointments/block-slot:
 *   post:
 *     summary: Bloquea un slot de cita.
 *     description: Bloquea un slot de cita para un doctor en una fecha y hora específicas.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockSlotCreate'
 *     responses:
 *       201:
 *         description: Slot bloqueado exitosamente. Devuelve el registro creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Error de validación.
 *       403:
 *         description: Acceso denegado (no autorizado para bloquear).
 *       404:
 *         description: Doctor o Disponibilidad no encontrados.
 *       409:
 *         description: Conflicto - El slot ya está ocupado (por cita o bloqueo).
 */


/**
 * @swagger
 * /api/appointments/doctor/{id}/by-day:
 *   get:
 *     summary: Obtiene las citas programadas para un doctor en un día específico.
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
 *       - name: day
 *         in: query
 *         required: true
 *         description: Fecha para la cual buscar citas (formato YYYY-MM-DD).
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-11-15"
 *     responses:
 *       200:
 *         description: Lista de citas del día especificado, ordenadas por hora de inicio ascendente. Devuelve array vacío si no hay citas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AppointmentDetailResponse'
 *       400:
 *         description: Parámetro 'day' inválido o faltante.
 *       404:
 *         description: Doctor no encontrado.
 */


/**
 * @swagger
 * /api/appointments/{id}/complete-consultation:
 *   post:
 *     summary: Completa una consulta médica.
 *     description: Registra la finalización de una consulta médica con todos los detalles clínicos y el resumen de signos vitales del paciente.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cita médica a completar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteConsultationPayload'
 *     responses:
 *       200:
 *         description: Consulta médica completada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Consulta completada exitosamente"
 *                 appointment:
 *                   $ref: '#/components/schemas/AppointmentResponse'
 *       400:
 *         description: Error de validación de datos.
 *       404:
 *         description: Cita no encontrada.
 */
