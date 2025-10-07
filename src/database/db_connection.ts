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
  queueLimit: 0
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
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(255) DEFAULT("paciente") NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `
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

export default getPool;
