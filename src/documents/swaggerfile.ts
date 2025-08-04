import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payroll API Documentation",
      version: "3.0.0",
      description: "API documentation for the Payroll system",
    },
    servers: [
      {
        url: "http://10.12.53.67:4400/", // ✅ Correct API path
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.resolve(__dirname, "../swagger/all/*.ts")],
};
const swaggerDocs = swaggerJsdoc(options);
export { swaggerDocs };
export default swaggerUi;
