import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payroll SAAS API Documentation",
      version: "1.0.0",
      description: "Payroll SAAS API Documentation",
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["src/swagger/all/*.ts"], // Adjust based on your file extension
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
