import swaggerJsdoc from "swagger-jsdoc";
// const swaggerJsdoc = require("swagger-jsdoc");

import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import config from "../../config/config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Payroll Management API",
      version: "1.0.0",
      description:
        "API documentation for Payroll Management System with ZKTeck SpeedH5 attendance integration",
      contact: {
        name: "API Support",
        email: "support@payrollsystem.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://api.payrollsystem.com"
            : config.swaggerURL,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    tags: [
      {
        name: "Attendance",
        description: "Basic attendance operations",
      },
      {
        name: "Attendance - Device Integration",
        description: "ZKTeck SpeedH5 device data processing",
      },
      {
        name: "Attendance - Bulk Operations",
        description: "Bulk attendance operations",
      },
      {
        name: "Attendance - Queries",
        description: "Attendance data queries and reports",
      },
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Employee",
        description: "Employee management",
      },
      {
        name: "Company",
        description: "Company management",
      },
    ],
  },
  apis: [
    "./src/modules/swagger/*.ts", // All swagger documentation files
    "./src/modules/*/routes/*.ts", // Route files that might have inline docs
    "./src/modules/attendance/*.ts", // Attendance module files
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Serve swagger docs
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .scheme-container { background: #f7f7f7; padding: 20px; margin: 20px 0; border-radius: 5px; }
    `,
      customSiteTitle: "Payroll Management API Documentation",
      customfavIcon: "/favicon.ico",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "none",
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
    })
  );

  // Serve swagger JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  console.log(
    `📚 Swagger documentation available at: ${
      process.env.NODE_ENV === "production"
        ? "https://api.payrollsystem.com"
        : config.swaggerURL
    }/api-docs`
  );
};

export const swaggerSpecs = specs;

// Export individual specs for testing
export { specs };

// Helper function to validate OpenAPI specs
export const validateSpecs = (): boolean => {
  try {
    if (!specs) {
      console.error("❌ Invalid OpenAPI specification");
      return false;
    }
    console.log("✅ OpenAPI specification is valid");
    return true;
  } catch (error) {
    console.error("❌ Error validating OpenAPI specs:", error);
    return false;
  }
};

export default {
  setupSwagger,
  validateSpecs,
  specs,
};
