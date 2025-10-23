import mysql from "mysql2/promise"
import dotenv from "dotenv"
import { hashPassword } from "../utils/hash_password"
import { genericPassword } from "../utils/generic_pass"
import { sendEmailCreateUser } from "../utils/email"

dotenv.config()

const initialConfig = {
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	port: parseInt(process.env.DB_PORT || "3306"),
}

const DB_NAME = process.env.DB_NAME || "nocountry"
const ADMIN_FIRST_NAME = process.env.ADMIN_FIRST_NAME
const ADMIN_LAST_NAME = process.env.ADMIN_LAST_NAME
const ADMIN_PHONE = process.env.ADMIN_PHONE
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_IS_ACTIVE = process.env.ADMIN_IS_ACTIVE === "true" // Convertir a booleano
const ADMIN_ROLE = process.env.ADMIN_ROLE

async function createDefaultAdmin(pool: mysql.Pool) {
	if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_ROLE) {
		console.warn(
			"⚠️ Advertencia: Variables de entorno de administrador incompletas. Se omitirá la creación del admin por defecto."
		)
		return
	}

	try {
		const [rows] = await pool.query<mysql.RowDataPacket[]>("SELECT id FROM users WHERE email = ?", [ADMIN_EMAIL])

		if (rows.length === 0) {
			const hashedPassword = await hashPassword(ADMIN_PASSWORD)
      // const password = genericPassword();
			// const hashedPassword = await hashPassword(password)

			const insertQuery = `
        INSERT INTO users 
        (first_name, last_name, phone, email, password, is_active, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
			const values = [
				ADMIN_FIRST_NAME,
				ADMIN_LAST_NAME,
				ADMIN_PHONE,
				ADMIN_EMAIL,
				hashedPassword,
				ADMIN_IS_ACTIVE,
				ADMIN_ROLE,
			];

			await pool.query(insertQuery, values)

      // const name = `${ADMIN_FIRST_NAME} ${ADMIN_LAST_NAME}`
      // const email = ADMIN_EMAIL

      // await sendEmailCreateUser(name, email, password)
			console.log("✅ Usuario administrador por defecto creado exitosamente.")
		} else {
			console.log("ℹ️ El usuario administrador por defecto ya existe. No se creó.")
		}
	} catch (error) {
		console.error("❌ Error al crear el usuario administrador por defecto:", error)
	}
}

async function createSpecialities(pool: mysql.Pool) {
  try {

    const specialities = [
      { name: "cardiología", description: "Especialidad de cardiología" },
      { name: "pediatría", description: "Especialidad de pediatría" },
      { name: "neurología", description: "Especialidad de neurología" },
      { name: "oncología", description: "Especialidad de oncología" },
      { name: "ginecología", description: "Especialidad de ginecología" },
    ];
    
    for (const speciality of specialities) {
      const { name, description } = speciality;
      const insertQuery = `
      INSERT IGNORE INTO specialties (name, description)
      VALUES (?, ?)
      `;
      const values = [name, description];
      await pool.query(insertQuery, values);
    }
  } catch (error) {
    console.error("❌ Error al crear las especialidades:", error);
  }
}

async function initializeDatabase() {
	try {
		const initialPool = mysql.createPool(initialConfig)

		await initialPool.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`)
		console.log(`Database ${DB_NAME} checked/created successfully`)

		await initialPool.end()

		const pool = mysql.createPool({
			...initialConfig,
			database: DB_NAME,
		})

		const tables = {
			users: `
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          url_image VARCHAR(255),
          is_active BOOLEAN DEFAULT FALSE,
          last_login TIMESTAMP NULL,
          role ENUM('paciente','medico','admin') NOT NULL DEFAULT 'paciente',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `,
			specialties: `
        CREATE TABLE IF NOT EXISTS specialties (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL UNIQUE,
          description VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
			doctors: `
            CREATE TABLE IF NOT EXISTS doctors (
              id INT PRIMARY KEY AUTO_INCREMENT,
              user_id INT NOT NULL,
              specialty_id INT NOT NULL,
              license_number VARCHAR(50) NOT NULL UNIQUE,
              bio TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id),
              FOREIGN KEY (specialty_id) REFERENCES specialties(id)
            )
          `,
			patients: `
        CREATE TABLE IF NOT EXISTS patients (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          date_of_birth DATE NOT NULL,
          gender ENUM('male','female','other') NOT NULL,
          nationality VARCHAR(50) NOT NULL,
          type_identification ENUM('dni','ci','cc') NOT NULL,
          identification VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE (type_identification, identification)
          )
          `,
			health_summaries: `
        CREATE TABLE IF NOT EXISTS health_summaries (
          id INT PRIMARY KEY AUTO_INCREMENT,
          patient_id INT NOT NULL,
          summary_date DATE NOT NULL,
          temperature DECIMAL(4,1),
          height DECIMAL(5,2),
          weight DECIMAL(5,2),
          systolic_pressure INT,
          diastolic_pressure INT,
          blood_type ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id)
      )`,
			doctor_patients: `
        CREATE TABLE IF NOT EXISTS doctor_patients (
          id INT PRIMARY KEY AUTO_INCREMENT,
          doctor_id INT NOT NULL,
          patient_id INT NOT NULL,
          status ENUM('activo','inactivo') DEFAULT 'activo',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id),
          FOREIGN KEY (patient_id) REFERENCES patients(id),
          UNIQUE (doctor_id, patient_id)
        )
      `,
			availabilities: `
        CREATE TABLE IF NOT EXISTS availabilities (
          id INT PRIMARY KEY AUTO_INCREMENT,
          doctor_id INT NOT NULL,
          day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday'),
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          rest_start_time TIME NOT NULL,
          rest_end_time TIME NOT NULL,
          period_time INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
        )
      `,
			appointments: `
        CREATE TABLE IF NOT EXISTS appointments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          availability_id INT NOT NULL,
          doctor_id INT NOT NULL,
          patient_id INT,
          day DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          status ENUM('confirmado','cancelado','completado') DEFAULT 'confirmado',
          consultation_type ENUM('virtual','presencial') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id),
          FOREIGN KEY (patient_id) REFERENCES patients(id),
          FOREIGN KEY (availability_id) REFERENCES availabilities(id)
        )
      `,
			medical_consultations_detail: `
        CREATE TABLE IF NOT EXISTS medical_consultations_detail (
          id INT PRIMARY KEY AUTO_INCREMENT,
          doctor_id INT NOT NULL,
          patient_id INT NOT NULL,
          appointment_id INT NOT NULL,
          reason_for_consultation VARCHAR(255) NOT NULL,
          description TEXT,
          diagnosis TEXT NOT NULL,
          instructions TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id),
          FOREIGN KEY (patient_id) REFERENCES patients(id),
          FOREIGN KEY (appointment_id) REFERENCES appointments(id)
        )
      `,
			attached_documentation: `
        CREATE TABLE IF NOT EXISTS attached_documentation (
          id INT PRIMARY KEY AUTO_INCREMENT,
          doctor_id INT NOT NULL,
          patient_id INT NOT NULL,
          appointment_id INT NOT NULL,
          url_attached_documentation VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
          FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
        )`,
		}

		for (const [tableName, query] of Object.entries(tables)) {
			await pool.query(query)
			console.log(`Table ${tableName} checked/created successfully`)
		}

		await createDefaultAdmin(pool)

    await createSpecialities(pool)

		return pool
	} catch (error) {
		console.error("Error initializing database:", error)
		throw error
	}
}

let pool: mysql.Pool
let initializingPromise: Promise<mysql.Pool> | null = null

export const getPool = async () => {
	if (pool) {
		return pool
	}

	// Si hay una inicialización en curso, esperamos a que termine.
	if (initializingPromise) {
		return initializingPromise
	}

	// No hay pool ni inicialización, creamos la promesa.
	console.log("⚙️ Iniciando la configuración de la base de datos...")
	initializingPromise = initializeDatabase()

	try {
		// Espera a que termine la inicialización y asigna el pool.
		pool = await initializingPromise
		return pool
	} catch (error) {
		// Si falla la inicialización, limpia el candado y re-lanza el error.
		initializingPromise = null
		throw error
	}
}

export const initDB = getPool // Usar getPool como función de inicialización principal

export const testConnection = async () => {
	try {
		const connection = await (await getPool()).getConnection()
		console.log("Database connection successful")
		connection.release()
		return true
	} catch (error) {
		console.error("Error connecting to the database:", error)
		return false
	}
}
