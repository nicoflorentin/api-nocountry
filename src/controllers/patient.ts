import { Request, Response } from "express";
import { makePatientService, PatientService } from "../services/patient";
import { PatientCreateByAdminSchema, PatientCreateSchema, PatientUpdateSchema } from "../validations/patient";
import { PatientCreate, PatientCreateByAdmin, PatientResponse, PatientUpdate } from "../models/patient";
import { UserResponse } from "../models/user";
import { CurrentUser } from "../models/auth"; // Necesario para la autorización

let patientService: Awaited<ReturnType<typeof makePatientService>>;

; (async () => {
	patientService = await makePatientService();
})();

// Helper para obtener la instancia del servicio, asegurando que esté inicializada
const getService = (): PatientService => { 
	if (!patientService) {
		throw new Error("Patient service not initialized");
	}
	return patientService;
};

// Helper centralizado para manejo de errores específico de paciente
const handlePatientServiceError = (res: Response, error: any) => {
	console.error("❌ Error processing patient request:", error); 

	// Manejo de errores de negocio lanzados explícitamente desde el servicio
	if (error instanceof Error) {
		if (error.message.includes("not found")) {
			// Si el error contiene "not found", devuelve 404
			return res.status(404).json({ error: error.message });
		}
	}

	// Manejo de errores específicos de MySQL (ej. duplicados)
	if (error.code === "ER_DUP_ENTRY") { // Código de error de MySQL para entrada duplicada
		if (error.message.includes("email")) {
			// Si el error menciona 'email', es un email duplicado
			return res.status(409).json({ error: "El email ya está registrado." }); // 409 Conflict
		} else if (error.message.includes("type_identification") || error.message.includes("identification")) {
			// Si el error menciona 'identification', es una identificación duplicada
			return res.status(409).json({ error: "La identificación ya está registrada." }); // 409 Conflict
		}
	}

	// Respuesta genérica para cualquier otro tipo de error no manejado específicamente
	return res.status(500).json({ error: "Internal server error" });
};

// --- CONTROLADORES ---

/**
 * @description Controlador para crear un nuevo paciente (registro normal).
 */
export const createPatient = async (req: Request, res: Response) => {
	// 1. Validar el cuerpo de la solicitud usando el esquema Zod
	const result = PatientCreateSchema.safeParse(req.body);
	if (!result.success) {
		// Si la validación falla, devuelve 400 Bad Request con los errores formateados
		return res.status(400).json({ errors: result.error.format() });
	}
	try {
		// 2. Si la validación es exitosa, llama al servicio para crear el paciente
		//    result.data ya tiene el tipo inferido PatientCreate
		const user = await getService().createPatient(result.data);
		// 3. Devuelve 201 Created con el usuario creado (o UserResponse)
		return res.status(201).json({ user });
	} catch (error: any) {
		// 4. Si el servicio lanza un error, lo maneja el helper centralizado
		return handlePatientServiceError(res, error);
	}
};

/**
 * @description Controlador para obtener una lista paginada de todos los pacientes.
 */
export const getAllPatients = async (req: Request, res: Response) => {
	try {
		// 1. Obtener parámetros de paginación de la query string (con valores por defecto)
		const limit = parseInt(req.query.limit as string) || 10;
		const page = parseInt(req.query.page as string) || 1;

		// 2. Llamar al servicio para obtener los pacientes y el total
		const { patients, total } = await getService().getAllPatients(limit, page);

		// (Opcional) Calcular totalPages 
		const totalPages = Math.ceil(total / limit);
		const response: PaginatedResponse<PatientResponse> = { data: patients, metadata: { total, page, limit, totalPages } };
		return res.status(200).json(response);

		// 3. Devolver 200 OK con la lista de pacientes y el total
		//return res.status(200).json({ patients, total, });
	} catch (error) {
		// 4. Manejar errores con el helper
		return handlePatientServiceError(res, error);
	}
};

/**
 * @description Controlador para obtener los detalles de un paciente por su ID.
 */
export const getPatientByID = async (req: Request, res: Response) => {
	try {
		// 1. Extraer el ID del paciente de los parámetros de la URL
		const { id } = req.params;
		// 2. Llamar al servicio para obtener el paciente
		const patient = await getService().getPatientByID(id);
		// 3. Devolver 200 OK con los detalles del paciente
		return res.status(200).json({ patient });
	} catch (error) {
		// 4. Manejar errores (incluyendo el 404 "Patient not found" lanzado por el servicio)
		return handlePatientServiceError(res, error);
	}
};

/**
 * @description Controlador para buscar pacientes por nombre.
 */
export const getPatientsByName = async (req: Request, res: Response) => {
	try {
		// 1. Obtener el parámetro 'name' de la query string
		const { name } = req.query;
		// 2. Validar que 'name' sea un string y tenga longitud mínima
		if (typeof name !== "string" || name.length < 3) {
			return res.status(400).json({ error: "El parámetro 'name' debe tener al menos 3 caracteres." });
		}
		// 3. Llamar al servicio para buscar pacientes
		const patients = await getService().getPatientsByName(name);
		// 4. Devolver 200 OK con la lista de pacientes encontrados
		return res.status(200).json({ patients });
	} catch (error) {
		// 5. Manejar errores
		return handlePatientServiceError(res, error);
	}
};

/**
 * @description Controlador para crear un paciente por un administrador (sin contraseña inicial).
 */
export const createPatientByAdmin = async (req: Request, res: Response) => {
	// 1. Validar el cuerpo de la solicitud con el esquema específico de admin
	const result = PatientCreateByAdminSchema.safeParse(req.body);
	if (!result.success) {
		return res.status(400).json({ errors: result.error.format() });
	}
	try {
		// 2. Llamar al servicio para crear el paciente (el servicio genera contraseña y envía email)
		const user = await getService().createPatientByAdmin(result.data);
		// 3. Devolver 201 Created con el UserResponse
		return res.status(201).json({ user });
	} catch (error: any) {
		// 4. Manejar errores (ej. email duplicado)
		return handlePatientServiceError(res, error);
	}
};

/**
 * @description Controlador para actualizar parcialmente la información de un paciente.
 */
export const updatePatient = async (req: Request, res: Response) => {
	// 1. Validar el cuerpo de la solicitud con el esquema de actualización parcial
	const result = PatientUpdateSchema.safeParse(req.body);
	if (!result.success) {
		// Si falla, devuelve 400 con errores
		return res.status(400).json({ errors: result.error.format() });
	}
	try {
		// 2. Extraer el ID del paciente de la URL
		const { id } = req.params;
		// 3. Llamar al servicio para actualizar el paciente
		const updatedPatient = await getService().updatePatient(id, result.data);
		// 4. Devolver 200 OK con el paciente actualizado
		return res.status(200).json({ patient: updatedPatient });

	} catch (error: any) {
		// 5. Manejar errores (ej. 404 si el paciente no existe, 409 si hay duplicados)
		return handlePatientServiceError(res, error);
	}
};

/**
 * @description Controlador para eliminar un paciente (Lógica pendiente en servicio/repo).
 */
export const deletePatient = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		// Implementar deletePatient en el servicio y repositorio
		// await getService().deletePatient(id); // Llamada al servicio (pendiente)

		// --- Placeholder ---
		console.warn("deletePatient service logic not implemented yet."); // Advertencia en consola
		return res.status(204).send(); // Simula éxito con 204 No Content
		// --- Fin Placeholder ---
	} catch (error) {
		// Manejar errores si la eliminación falla o el paciente no existe
		return handlePatientServiceError(res, error);
	}
};

// ---------------------- GET MEDICAL HISTORY ----------------------
/**
 * @description Maneja la solicitud GET para obtener el historial médico de un paciente.
 * Realiza la autorización antes de llamar al servicio.
 */
export const getMedicalHistoryController = async (req: Request, res: Response) => {
	try {
		// 1. Extraer ID del paciente de los parámetros de la URL
		const { id } = req.params;
		const patientId = Number(id);

		// 2. Lógica de Autorización 
		const currentUser = res.locals.user as CurrentUser; // Obtener usuario del middleware auth
		if (!currentUser) {
			// Verificación extra por si acaso
			return res.status(401).json({ error: "No autenticado." });
		}

		let authorized = false;
		// Admin siempre autorizado
		if (currentUser.role === 'admin') {
			authorized = true;
			// Paciente autorizado solo si pide su propio historial
		} else if (currentUser.role === 'paciente') {
			// Obtener detalles del paciente para verificar el user_id asociado
			const patientDetails = await getService().getPatientByID(id);
			// Comparar el user_id del paciente con el ID del usuario logueado
			if (patientDetails && patientDetails.user_id === currentUser.id) {
				authorized = true;
			}
		}
		// else if (currentUser.role === 'medico') { 
		//     // Lógica pendiente para verificar si es médico asignado al paciente
		//     // const isAssigned = await doctorRepository.isDoctorAssignedToPatient(currentUser.data?.id, patientId); 
		//     // if (isAssigned) authorized = true;
		// }

		// Si después de las verificaciones no está autorizado, devolver 403 Forbidden
		if (!authorized) {
			return res.status(403).json({ error: "Acceso denegado. No tienes permiso para ver este historial médico." });
		}

		// 3. Llamar al servicio para obtener el historial
		const medicalHistory = await getService().getMedicalHistory(id);

		// 4. Enviar la respuesta exitosa (200 OK) con el historial
		return res.status(200).json(medicalHistory);

	} catch (error) {
		// 5. Manejar errores (ej. Paciente no encontrado 404, error interno 500)
		return handlePatientServiceError(res, error);
	}
};


