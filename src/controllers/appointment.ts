import { Request, Response } from "express";
import { makeAppointmentService } from "../services/appointment";
import { AppointmentCreateSchema, AppointmentFilterSchema, AppointmentStatusUpdateSchema, AppointmentUpdateSchema } from "../validations/appointment";
import { AppointmentCreate, AppointmentStatus } from "../models/appointment";
import { BlockSlotCreateSchema } from "../validations/appointment"; 
import { BlockSlotCreate } from "../models/appointment";
import { CompleteConsultationPayloadSchema } from "../validations/medical_history"; 
import { CompleteConsultationPayload } from "../models/medical_history";
import { UserResponse } from "../models/user";
import { CurrentUser } from "../models/auth"; 

// Variable para almacenar la instancia del servicio
let appointmentService: Awaited<ReturnType<typeof makeAppointmentService>>;

// Inicialización asíncrona del servicio
; (async () => {
    appointmentService = await makeAppointmentService();
})();

// Función auxiliar para obtener la instancia del servicio de forma segura
const getService = () => {
    if (!appointmentService) {
        throw new Error("Appointment service not initialized");
    }
    return appointmentService;
};

// Función centralizada para manejar errores del servicio y traducirlos a respuestas HTTP
const handleServiceError = (res: Response, error: any) => {
    console.error("Error processing appointment request:", error); // Loggear el error para debugging

    // 1. Manejo de errores de negocio (errores lanzados intencionalmente desde el servicio)
    if (error instanceof Error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ error: error.message }); // 404 para recursos no encontrados
        }
        if (error.message === "SLOT_ALREADY_BOOKED") {
            return res.status(409).json({ error: "El slot de tiempo seleccionado ya está reservado." }); // 409 para conflictos (slot ocupado)
        }
        // Puedes añadir más manejo de errores de negocio aquí
    }

    // 2. Manejo de errores específicos de Base de Datos (Errores de MySQL)
    if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
        // Error de Foreign Key: uno de los IDs referenciados no existe
        const fk_message = error.sqlMessage || ''; // Mensaje de error de MySQL
        let specificError = "Uno de los recursos asociados (Doctor, Paciente o Disponibilidad) no fue encontrado."; // Mensaje genérico

        // Intentar dar un mensaje más específico basado en la columna FK
        if (fk_message.includes('availability_id')) {
            specificError = "El ID de disponibilidad (availability_id) no existe.";
        } else if (fk_message.includes('doctor_id')) {
            specificError = "El ID del doctor (doctor_id) no existe.";
        } else if (fk_message.includes('patient_id')) {
            specificError = "El ID del paciente (patient_id) no existe.";
        }
        return res.status(404).json({ error: specificError }); // Usamos 404 porque un recurso relacionado no se encontró
    }

    // 3. Respuesta de fallback para cualquier otro tipo de error (inesperado)
    return res.status(500).json({ error: "Internal server error" }); // 500 para errores internos
};

// --- CONTROLADORES PARA LAS RUTAS ---

// ---------------------- CREATE ----------------------
export const createAppointment = async (req: Request, res: Response) => {
    // Validar el cuerpo de la solicitud con Zod
    const result = AppointmentCreateSchema.safeParse(req.body);
    if (!result.success) {
        // Si la validación falla, devolver 400 con los errores
        return res.status(400).json({ errors: result.error.issues });
    }
    try {
        // Extraer los datos validados
        const data: AppointmentCreate = result.data as AppointmentCreate;
        // Llamar al servicio para crear la cita
        const created = await getService().createAppointment(data);
        // Devolver 201 Created con la cita creada
        return res.status(201).json(created);
    } catch (error) {
        // Usar el manejador centralizado para errores
        return handleServiceError(res, error);
    }
};

// ---------------------- GET BY ID ----------------------
export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Obtener el ID de la URL
        // Llamar al servicio para obtener los detalles de la cita
        const appointment = await getService().getAppointmentById(id);
        // Devolver 200 OK con la cita encontrada
        return res.status(200).json(appointment);
    } catch (error) {
        // Usar el manejador centralizado para errores (manejará el 404 si no se encuentra)
        return handleServiceError(res, error);
    }
};

// ---------------------- GET UPCOMING ----------------------
export const getUpcomingAppointment = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params; // Obtener el ID del paciente de la URL
        // Llamar al servicio para obtener la próxima cita
        const appointment = await getService().getUpcomingAppointment(patientId);

        if (!appointment) {
            // Si no hay citas próximas, devolver 404
            return res.status(404).json({ error: "No hay citas próximas programadas." });
        }
        // Devolver 200 OK con la cita encontrada
        return res.status(200).json(appointment);
    } catch (error) {
        // Usar el manejador centralizado
        return handleServiceError(res, error);
    }
};

// ---------------------- GET UPCOMING (DOCTOR) ----------------------
export const getUpcomingAppointmentForDoctor = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params; // Obtener el ID del doctor de la URL
        // Llamar al servicio para obtener la próxima cita del doctor
        const appointment = await getService().getUpcomingAppointmentForDoctor(doctorId);

        if (!appointment) {
            // Si no hay citas próximas, devolver 404
            return res.status(404).json({ error: "No hay citas próximas programadas." });
        }
        // Devolver 200 OK con la cita encontrada
        return res.status(200).json(appointment);
    } catch (error) {
        // Usar el manejador centralizado
        return handleServiceError(res, error);
    }
};

// ---------------------- GET LISTS (Doctor & Patient) ----------------------
export const getAllAppointmentsByDoctor = async (req: Request, res: Response) => {
    // Validar los query parameters (status, page, limit) con Zod
    const filterResult = AppointmentFilterSchema.safeParse(req.query);
    if (!filterResult.success) {
        return res.status(400).json({ errors: filterResult.error.issues });
    }
    try {
        const { id } = req.params; // ID del doctor
        const { status, limit, page } = filterResult.data; // Filtros validados

        // Llamar al servicio para obtener la lista paginada y filtrada
        const data = await getService().getAllByDoctorId(id, status, limit, page);
        // Devolver 200 OK con los resultados
        return res.status(200).json(data);
    } catch (error) {
        return handleServiceError(res, error);
    }
};

export const getAllAppointmentsByPatient = async (req: Request, res: Response) => {
    // Validar query parameters
    const filterResult = AppointmentFilterSchema.safeParse(req.query);
    if (!filterResult.success) {
        return res.status(400).json({ errors: filterResult.error.issues });
    }
    try {
        const { id } = req.params; // ID del paciente
        const { status, limit, page } = filterResult.data; // Filtros validados

        // Llamar al servicio
        const data = await getService().getAllByPatientId(id, status, limit, page);
        // Devolver 200 OK
        return res.status(200).json(data);
    } catch (error) {
        return handleServiceError(res, error);
    }
};

// ---------------------- GET AVAILABLE SLOTS ----------------------
export const getAvailableSlotsController = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params; // ID del doctor
        const { day } = req.query; // Fecha en formato YYYY-MM-DD

        // Validar que 'day' sea una fecha válida y esté presente
        if (!day || typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
            return res.status(400).json({ error: "Parámetro 'day' es requerido y debe estar en formato YYYY-MM-DD." });
        }

        // Llamar al servicio para generar los slots disponibles
        const availableSlots = await getService().generateAvailableSlots(doctorId, day);

        // Devolver 200 OK con la lista de slots
        return res.status(200).json(availableSlots);
    } catch (error) {
        // Manejar errores como "Doctor not found"
        return handleServiceError(res, error);
    }
};

// ---------------------- UPDATE GENERAL ----------------------
export const updateAppointment = async (req: Request, res: Response) => {
    // Validar el cuerpo de la solicitud (parcial)
    const updateResult = AppointmentUpdateSchema.safeParse(req.body);
    if (!updateResult.success) {
        return res.status(400).json({ errors: updateResult.error.issues });
    }
    try {
        const { id } = req.params; // ID de la cita a actualizar
        // Llamar al servicio para actualizar
        const updated = await getService().updateAppointment(id, updateResult.data);
        // Devolver 200 OK con la cita actualizada
        return res.status(200).json(updated);
    } catch (error) {
        return handleServiceError(res, error);
    }
};

// ---------------------- STATUS ACTIONS ----------------------
// Función de fábrica para crear controladores de actualización de estado
const updateStatusAction = (status: AppointmentStatus) => {
    return async (req: Request, res: Response) => {
        try {
            const { id } = req.params; // ID de la cita
            // Llamar al servicio para actualizar solo el estado
            await getService().updateAppointmentStatus(id, status);
            // Devolver 200 OK con un mensaje de éxito
            return res.status(200).json({ message: `Cita marcada como '${status}'.` });
        } catch (error) {
            return handleServiceError(res, error);
        }
    };
};

// Crear controladores específicos para cada acción de estado
export const cancelAppointment = updateStatusAction('cancelado');
export const completeAppointment = updateStatusAction('completado');
export const confirmAppointment = updateStatusAction('confirmado');
export const markAppointmentAsNoShow = updateStatusAction('ausente');

// ---------------------- DELETE ----------------------
export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // ID de la cita a eliminar
        // Llamar al servicio para eliminar
        await getService().deleteAppointment(id);
        // Devolver 204 No Content (respuesta estándar para DELETE exitoso)
        return res.status(204).send();
    } catch (error) {
        return handleServiceError(res, error);
    }
};

// ---------------------- BLOCK SLOT ----------------------
export const blockSlotController = async (req: Request, res: Response) => {
    const result = BlockSlotCreateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }
    try {
        // Lógica de Autorización: ¿Quién puede bloquear? (Médico sí mismo o Admin)
        const currentUser = res.locals.user; // Asumiendo middleware de auth
        const data: BlockSlotCreate = result.data as BlockSlotCreate;

        if (currentUser.role !== 'admin' && currentUser.id !== data.doctor_id) {
            // Si no es admin y no es el mismo doctor intentando bloquear su propio slot
            return res.status(403).json({ error: "Acceso denegado. Solo puedes bloquear tu propia disponibilidad o ser administrador." });
        }

        const blockedSlot = await getService().blockSlot(data);
        return res.status(201).json(blockedSlot); // 201 Created
    } catch (error) {
        // Reutilizar handleServiceError para 409 (SLOT_ALREADY_BOOKED) y 404 (Doctor/Availability not found)
        return handleServiceError(res, error);
    }
};

// ---------------------- GET APPOINTMENTS FOR DOCTOR BY DAY ----------------------
export const getAppointmentsForDoctorByDayController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // doctorId
        const { day } = req.query; // Obtener fecha del query param

        // Validar que 'day' se proporcionó y tiene formato YYYY-MM-DD
        if (!day || typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
            return res.status(400).json({ error: "Parámetro 'day' es requerido y debe estar en formato YYYY-MM-DD." });
        }

        const appointments = await getService().getAppointmentsForDoctorByDay(id, day);

        // Devolver array vacío si no hay citas, no es error.
        return res.status(200).json(appointments);
    } catch (error) {
        return handleServiceError(res, error);
    }
};

// --- NUEVO CONTROLADOR PARA COMPLETAR CONSULTA ---
/**
 * @description Maneja la solicitud POST para registrar los detalles de una consulta completada,
 * opcionalmente un resumen de salud, y marcar la cita como 'completada'.
 */
export const completeConsultationController = async (req: Request, res: Response) => {
    // 1. Validar el payload completo usando el esquema Zod
    const result = CompleteConsultationPayloadSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }

    try {
        // 2. Lógica de Autorización: ¿Quién puede completar una consulta?
        //    Normalmente, solo el doctor asignado a la cita o un administrador.
        const currentUser = res.locals.user as CurrentUser;
        if (!currentUser) {
            return res.status(401).json({ error: "No autenticado." });
        }

        const payload: CompleteConsultationPayload = result.data;
        const consultationData = payload.consultation;

        // Verificar si el usuario logueado es el doctor de la consulta o un admin
        let authorized = false;
        if (currentUser.role === 'admin') {
            authorized = true;
        } else if (currentUser.role === 'medico') {
            // pendiente: obtener el doctor_id del currentUser.id
            // Simplificación temporal: Asumir que el payload incluye el doctor_id correcto y confiamos en el front-end
            console.warn("Autorización para completar consulta necesita verificación de doctor_id vs currentUser.")
            authorized = true; // Placeholder 

        }

        if (!authorized) {
            return res.status(403).json({ error: "Acceso denegado. Solo el doctor asignado o un administrador pueden completar esta consulta." });
        }

        // 3. Llamar al servicio para procesar la finalización de la consulta
        const createdConsultationDetail = await getService().completeConsultationService(payload);

        // 4. Enviar respuesta exitosa (201 Created o 200 OK)
        return res.status(201).json(createdConsultationDetail);

    } catch (error) {
        // 5. Manejar errores (404 Cita no encontrada, 409 Estado incorrecto, etc.)
        return handleServiceError(res, error);
    }
};
