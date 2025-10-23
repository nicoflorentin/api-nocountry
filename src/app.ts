import express from "express";
import morgan from "morgan";
import cors from "cors";
import { router } from "./routes";
import { initDB } from "./database/db_connection";
import { swaggerRouter } from "./docs/swagger";
import { logger } from "./middleware/logger";

export const app = express();

// Inicializar la base de datos
initDB().catch(error => {
  console.error("Failed to initialize database:", error);
  process.exit(1); // Salir si no se puede inicializar la base de datos
});

app.use(express.json());
app.use(swaggerRouter);

// CORS primero
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",");
// const corsOptions = {
//   origin: allowedOrigins,
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"],
// };
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback) => {
    if (!origin) return callback(null, true); // permitir requests sin origin (Postman, etc)
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: Origin not allowed"));
    }
  },
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
router.use('/api/hello', (req, res) => {
  res.send('hello world')
})


export default app;