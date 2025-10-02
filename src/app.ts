import express from "express";
import morgan from "morgan";
import cors from "cors";
import { router } from "./routes";
import { initDB } from "./database/db_connection";

export const app = express();

// Inicializar la base de datos
initDB().catch(error => {
  console.error("Failed to initialize database:", error);
  process.exit(1); // Salir si no se puede inicializar la base de datos
});

// CORS primero
const corsOptions = {
  origin: [""],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
// app.use(express.json({ limit: "10mb" })); // Reducido de 50mb
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.use(cookieParser());

// Logging
app.use(morgan("dev"));
app.use(router)
// Test endpoint


export default app;