import express from "express";
import morgan from "morgan";
import cors from "cors";
import { router } from "./routes";
import { initDB } from "./database/db_connection";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { logger } from "./middleware/logger";

export const app = express();

// Inicializar la base de datos
initDB().catch(error => {
  console.error("Failed to initialize database:", error);
  process.exit(1); // Salir si no se puede inicializar la base de datos
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0", 
    info: {
      title: "API de No Country",
      version: "1.0.0",
      description: "Documentación generada con Swagger para Express",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
  },
  apis: [
    path.join(__dirname, "./routes/**/*.ts"),
    path.join(__dirname, "./routes/**/*.js")
  ],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

// Middleware
app.use(logger); 

// Logging
app.use(morgan("dev"));
app.use(router)
// Test endpoint


export default app;