import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Router } from "express";
import path from "path";

// 1. Define las opciones de configuración de Swagger JSDoc
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
    // 2. Rutas para buscar los comentarios JSDoc
    apis: [
        // Usamos path.resolve para rutas absolutas más seguras
        path.resolve(__dirname, '../routes/**/*.ts'),
        path.resolve(__dirname, '../routes/**/*.js'),
        path.resolve(__dirname, './*.ts'), 
        path.resolve(__dirname, './*.js'),
        path.resolve(__dirname, './schemas/*.ts'),
        path.resolve(__dirname, './schemas/*.js'),
        // Si la compilación emite bajo dist/src, también incluimos esas rutas si es necesario
        path.resolve(__dirname, '../src/routes/**/*.js'),
        path.resolve(__dirname, '../src/docs/schemas/*.js'),
    ],
};

// 3. Genera la especificación de Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// 4. Crea un Router de Express para montar la documentación
const swaggerRouter = Router();

// Monta el middleware de Swagger UI en la ruta /api-docs
swaggerRouter.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. Exporta el Router configurado
export { swaggerRouter };