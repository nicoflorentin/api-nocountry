import { Request, Response } from "express";
import { makeAppointmentService } from "../services/appointment";
import { AppointmentCreateSchema, AppointmentFilterSchema, AppointmentStatusUpdateSchema, AppointmentUpdateSchema } from "../validations/appointment";
import { AppointmentCreate, AppointmentStatus } from "../models/appointment";

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

