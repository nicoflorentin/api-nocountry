import express from "express";
import morgan from "morgan";
import cors from "cors";

const app = express();

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

export default app;