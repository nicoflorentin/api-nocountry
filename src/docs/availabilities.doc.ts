/**
 * @swagger
 * tags:
 *   - name: Availabilities
 *     description: Gestión de Disponibilidad y Horarios de Doctores
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AvailabilityCreate:
 *       type: object
 *       required: [doctor_id, day_of_week, start_time, end_time, rest_start_time, rest_end_time, period_time]
 *       properties:
 *         doctor_id: { type: integer, description: ID del doctor asociado. }
 *         day_of_week: { type: string, enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday], description: Día de la semana. }
 *         start_time: { type: string, format: time, description: Hora de inicio de la jornada (HH:MM:SS). }
 *         end_time: { type: string, format: time, description: Hora de fin de la jornada (HH:MM:SS). }
 *         rest_start_time: { type: string, format: time, description: Hora de inicio del descanso (HH:MM:SS). }
 *         rest_end_time: { type: string, format: time, description: Hora de fin del descanso (HH:MM:SS). }
 *         period_time: { type: integer, description: Duración de cada slot de cita en minutos (ej. 30). }
 *       example:
 *         doctor_id: 5
 *         day_of_week: "monday"
 *         start_time: "09:00:00"
 *         end_time: "17:00:00"
 *         rest_start_time: "13:00:00"
 *         rest_end_time: "14:00:00"
 *         period_time: 30
 *
 *     AvailabilityResponse:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctor_id: { type: integer }
 *         day_of_week: { type: string }
 *         start_time: { type: string, format: time }
 *         end_time: { type: string, format: time }
 *         rest_start_time: { type: string, format: time }
 *         rest_end_time: { type: string, format: time }
 *         period_time: { type: integer }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *
 *     AvailabilityUpdate:
 *       allOf:
 *         - $ref: '#/components/schemas/AvailabilityCreate'
 *         - type: object
 *           description: Todos los campos son opcionales para la actualización parcial (PATCH).
 *
 *     TimeSlot:
 *       type: object
 *       properties:
 *         start: { type: string, format: time, example: "09:00:00" }
 *         end: { type: string, format: time, example: "09:30:00" }
 */

/**
 * @swagger
 * /api/availabilities:
 *   post:
 *     summary: Crea una nueva disponibilidad horaria para un doctor.
 *     tags: [Availabilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvailabilityCreate'
 *     responses:
 *       201:
 *         description: Disponibilidad creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailabilityResponse'
 *       400:
 *         description: Error de validación o lógica (ej. hora de fin anterior a la de inicio).
 *       404:
 *         description: Doctor no encontrado.
 *
 * /api/availabilities/bulk:
 *   post:
 *     summary: Crea múltiples disponibilidades horarias en una sola solicitud.
 *     tags: [Availabilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/AvailabilityCreate'
 *     responses:
 *       201:
 *         description: Disponibilidades creadas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AvailabilityResponse'
 *       404:
 *         description: Doctor no encontrado.
 *
 * /api/availabilities/doctor/{id}:
 *   get:
 *     summary: Obtiene todas las disponibilidades fijas de un doctor.
 *     tags: [Availabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del doctor.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de disponibilidades ordenadas por día y hora.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AvailabilityResponse'
 *       404:
 *         description: Doctor no encontrado.
 *
 * /api/availabilities/doctor/{id}/slots:
 *   get:
 *     summary: Genera la lista de todos los slots de tiempo posibles basados en la disponibilidad fija del doctor.
 *     tags: [Availabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del doctor.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objeto que mapea días de la semana a una lista de slots de inicio y fin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Mapeo de día de la semana a lista de slots.
 *               example:
 *                 monday: 
 *                   - start: "09:00:00"
 *                     end: "09:30:00"
 *                   - start: "14:00:00"
 *                     end: "14:30:00"
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TimeSlot'
 *       404:
 *         description: Doctor no encontrado.
 *
 * /api/availabilities/{id}:
 *   patch:
 *     summary: Actualiza parcialmente una disponibilidad horaria.
 *     tags: [Availabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la disponibilidad.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvailabilityUpdate'
 *     responses:
 *       200:
 *         description: Disponibilidad actualizada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailabilityResponse'
 *       404:
 *         description: Disponibilidad o Doctor no encontrados.
 *   delete:
 *     summary: Elimina una disponibilidad horaria.
 *     tags: [Availabilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la disponibilidad.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Eliminación exitosa (No Content).
 *       404:
 *         description: Disponibilidad no encontrada.
 */