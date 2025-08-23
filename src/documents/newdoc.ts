const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ZUQUALLA HORTI CULTURE PLC",
      version: "1.0.0",
      description: "Payroll API Documentation",
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

module.exports = swaggerSpec;
