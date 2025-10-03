// import { Request, Response, NextFunction } from "express";

// export const logger = (req: Request, res: Response, next: NextFunction) => {
//   const ip = req.ip || req.connection.remoteAddress;
//   console.log(`${ip} - [${new Date().toISOString()}] ${req.method} ${req.path}`);
//   next(); 
// };

import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint(); // Tiempo de alta resolución
  const ip = req.ip || req.socket.remoteAddress;

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000; // nanosegundos → ms
    console.log(
      `${ip} - [${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(2)} ms`
    );
  });

  next();
};
