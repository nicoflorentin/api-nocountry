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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: process.env.SERVER_URL || `https://www.nocountry.saltaget.com`,
      },
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
  },
  apis: [
    // include both TS (dev) and JS (built) files so swagger works in both envs
    path.join(__dirname, "./routes/**/*.ts"),
    path.join(__dirname, "./routes/**/*.js"),
    path.join(__dirname, "./docs/schemas/*.ts"),
    path.join(__dirname, "./docs/schemas/*.js"),
    // when compiled with rootDir="./" TS may emit files under dist/src/... so include those paths too
    path.join(__dirname, "./src/routes/**/*.js"),
    path.join(__dirname, "./src/docs/schemas/*.js")
  ],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

app.use(express.json());
app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
router.use('/api/hello', (req, res)=> {
  res.send('hello world')
})


export default app;