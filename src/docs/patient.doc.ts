/**
 * @swagger
 * tags:
 *   - name: Patients
 *     description: Operaciones de gestión de pacientes (CRUD) e Historial Médico
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     # --- Esquemas existentes de Patient (Create, Response, Update) ---
 *     PatientCreate:
 *       type: object
 *       required: [firstName, lastName, email, password, repeatPassword, dateOfBirth, gender, nationality, typeIdentification, identification]
 *       properties:
 *         firstName: { type: string, example: "John", description: "Nombre del paciente" }
 *         lastName: { type: string, example: "Doe", description: "Apellido del paciente" }
 *         phone: { type: string, example: "+5493876543210", description: "Teléfono (opcional)" }
 *         email: { type: string, format: email, example: "user@example.com" }
 *         password: { type: string, format: password, example: "MiContraseña123!" }
 *         repeatPassword: { type: string, format: password, example: "MiContraseña123!" }
 *         dateOfBirth: { type: string, format: date, example: "1990-01-01" }
 *         gender: { type: string, enum: [male, female, other], example: "male" }
 *         nationality: { type: string, example: "Argentina" }
 *         typeIdentification: { type: string, enum: [dni, cc, ci], example: "dni" }
 *         identification: { type: string, example: "12345678" }
 *
 *     PatientResponse:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         user_id: { type: integer }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         email: { type: string, format: email }
 *         urlImage: { type: string, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         dateOfBirth: { type: string, format: date }
 *         gender: { type: string, enum: [male, female, other] }
 *         typeIdentification: { type: string, enum: [dni, cc, ci] }
 *         identification: { type: string }
 *         nationality: { type: string }
 *         isActive: { type: boolean }
 *         phone: { type: string, nullable: true }
 *
 *     PatientUpdate:
 *       allOf:
 *         - $ref: '#/components/schemas/PatientCreate'
 *         - type: object
 *           description: Todos los campos son opcionales para la actualización parcial (PATCH).
 *           required: [] # Indica que ningún campo es estrictamente obligatorio en PATCH
 *           properties:
 *             # Sobreescribir propiedades para hacerlas opcionales si es necesario,
 *             # aunque allOf con un objeto vacío y descripción suele ser suficiente.
 *             password: { description: "No se actualiza por esta vía." }
 *             repeatPassword: { description: "No se actualiza por esta vía." }
 *
 *     # --- Nuevos Esquemas para Historial Médico ---
 *     HealthSummary:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         patient_id: { type: integer }
 *         summary_date: { type: string, format: date }
 *         temperature: { type: number, format: float, nullable: true }
 *         height: { type: number, format: float, nullable: true }
 *         weight: { type: number, format: float, nullable: true }
 *         systolic_pressure: { type: integer, nullable: true }
 *         diastolic_pressure: { type: integer, nullable: true }
 *         blood_type: { type: string, nullable: true, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *
 *     MedicalConsultationDetail:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         doctor_id: { type: integer }
 *         patient_id: { type: integer }
 *         appointment_id: { type: integer }
 *         reason_for_consultation: { type: string }
 *         description: { type: string, nullable: true }
 *         diagnosis: { type: string }
 *         instructions: { type: string, nullable: true }
 *         notes: { type: string, nullable: true }
 *         created_at: { type: string, format: date-time } # Fecha de la consulta
 *         updated_at: { type: string, format: date-time }
 *         appointment_day: { type: string, format: date, description: "(Del JOIN) Día de la cita asociada" }
 *         appointment_start_time: { type: string, format: time, description: "(Del JOIN) Hora de la cita asociada" }
 *         doctor_first_name: { type: string, description: "(Del JOIN) Nombre del doctor" }
 *         doctor_last_name: { type: string, description: "(Del JOIN) Apellido del doctor" }
 *
 *     MedicalHistoryResponse:
 *       type: object
 *       properties:
 *         patientId: { type: integer }
 *         healthSummaries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HealthSummary'
 *         consultationDetails:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MedicalConsultationDetail'
 */

// --- Documentación de Endpoints Existentes ---
/**
 * @swagger
 * /api/patient/create:
 *   post:
 *     summary: Crea un nuevo paciente
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientCreate'
 *     responses:
 *       201: # Cambiado a 201 Created
 *         description: Paciente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse' # Asumiendo que devuelve UserResponse
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Email o Identificación ya existen
 */

/**
 * @swagger
 * /api/patient:
 *   get:
 *     summary: Obtener lista paginada de pacientes
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatientResponse'
 *                 total:
 *                   type: integer
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/patient/search:
 *   get:
 *     summary: Obtener pacientes por nombre (primeros 10)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: [] # Añadido security
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         description: Nombre o apellido del paciente (mínimo 3 caracteres)
 *         schema:
 *           type: string
 *           minLength: 3
 *     responses:
 *       200:
 *         description: Pacientes encontrados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatientResponse'
 *       400:
 *         description: Parámetro 'name' inválido o muy corto
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /api/patient/{id}:
 *   get:
 *     summary: Obtener detalles de un paciente por ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del paciente
 *         schema:
 *           type: integer # Cambiado a integer si el ID es numérico
 *     responses:
 *       200:
 *         description: Detalles del paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/PatientResponse'
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 *   patch:
 *     summary: Actualiza la información parcial de un paciente
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del paciente a actualizar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatientUpdate'
 *     responses:
 *       200:
 *         description: Paciente actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patient:
 *                   $ref: '#/components/schemas/PatientResponse'
 *       400:
 *         description: Error de validación.
 *       401:
 *         description: No autorizado.
 *       404:
 *         description: Paciente no encontrado.
 *       409:
 *         description: Conflicto de datos (Email o Identificación).
 *       500:
 *         description: Error interno del servidor.
 *   delete:
 *     summary: Elimina un paciente (Lógica Pendiente)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: [] # Asumiendo que requiere auth
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del paciente a eliminar.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Paciente eliminado exitosamente (No Content).
 *       404:
 *         description: Paciente no encontrado.
 *       501:
 *         description: Funcionalidad no implementada.
 */

// --- NUEVA DOCUMENTACIÓN ENDPOINT HISTORIAL ---
/**
 * @swagger
 * /api/patient/{id}/medical-history:
 *   get:
 *     summary: Obtiene el historial médico completo de un paciente.
 *     description: Devuelve los resúmenes de salud y los detalles de consultas médicas. Requiere ser el propio paciente, un médico asignado (lógica pendiente) o un administrador.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del paciente.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial médico obtenido exitosamente. Las listas están ordenadas por fecha descendente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalHistoryResponse'
 *       401:
 *         description: No autenticado.
 *       403:
 *         description: Acceso denegado. No autorizado para ver este historial.
 *       404:
 *         description: Paciente no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */