import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payroll API Documentation",
      version: "1.0.0",
      description: "API documentation for the Payroll system",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "API v1",
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
  apis: ["./src/swagger/all/*.ts"], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
