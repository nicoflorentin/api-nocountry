import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración inicial sin base de datos específica
const initialConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // port: parseInt(process.env.DB_PORT || '3306')
};

const DB_NAME = process.env.DB_NAME || 'nocountry';

// Función para crear la base de datos y las tablas
async function initializeDatabase() {
  try {
    // Crear una conexión inicial sin base de datos específica
    const initialPool = mysql.createPool(initialConfig);

    // Crear la base de datos si no existe
    await initialPool.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    console.log(`Database ${DB_NAME} checked/created successfully`);

    // Cerrar la conexión inicial
    await initialPool.end();

    // Crear el pool final con la base de datos seleccionada
    const pool = mysql.createPool({
      ...initialConfig,
      database: DB_NAME
    });

    // Definir las tablas
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
          license_number VARCHAR(50) NOT NULL,
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `,
      doctor_specialties: `
        CREATE TABLE IF NOT EXISTS doctor_specialties (
          id INT PRIMARY KEY AUTO_INCREMENT,
          doctor_id INT NOT NULL,
          specialty_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id),
          FOREIGN KEY (specialty_id) REFERENCES specialties(id),
          UNIQUE (doctor_id, specialty_id)
        )
      `,
      patients: `
        CREATE TABLE IF NOT EXISTS patients (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          date_of_birth DATE NOT NULL,
          gender ENUM('male','female','other') DEFAULT 'other',
          dni VARCHAR(20) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
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
      // plantear esto day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday'), en vez de day
      availabilities: `
        CREATE TABLE IF NOT EXISTS availabilities (
          id INT PRIMARY KEY AUTO_INCREMENT,
          doctor_id INT NOT NULL,
          day DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
        )
      `,
      blocked_availabilities: `
        CREATE TABLE IF NOT EXISTS blocked_availabilities (
          id INT PRIMARY KEY AUTO_INCREMENT,
          doctor_id INT NOT NULL,
          day DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          reason VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
        )
      `,
      appointments: `
        CREATE TABLE IF NOT EXISTS appointments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          doctor_id INT NOT NULL,
          patient_id INT NOT NULL,
          day DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          status ENUM('pendiente','confirmado','cancelado','completado') DEFAULT 'pendiente',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (doctor_id) REFERENCES doctors(id),
          FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
      `,
      medical_consultations: `
        CREATE TABLE IF NOT EXISTS medical_consultations (
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

      // REVISAR OPCIONAL

      // prescriptions: `
      //   CREATE TABLE IF NOT EXISTS prescriptions (
      //     id INT PRIMARY KEY AUTO_INCREMENT,
      //     doctor_id INT NOT NULL,
      //     patient_id INT NOT NULL,
      //     appointment_id INT NOT NULL,
      //     medication VARCHAR(255) NOT NULL,
      //     dosage VARCHAR(255) NOT NULL,
      //     instructions VARCHAR(255) NOT NULL,
      //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      //   )`,
      // Agrega más tablas aquí si es necesario
    };

    // Crear las tablas
    for (const [tableName, query] of Object.entries(tables)) {
      await pool.query(query);
      console.log(`Table ${tableName} checked/created successfully`);
    }

    return pool;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Exportar la función de inicialización
export const initDB = initializeDatabase;

// Pool inicial temporal
let pool: mysql.Pool;

export const getPool = async () => {
  if (!pool) {
    pool = await initializeDatabase();
  }
  return pool;
};

export const testConnection = async () => {
  try {
    const connection = await (await getPool()).getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return false;
  }
};

