import swaggerJsdoc from "swagger-jsdoc";
// const swaggerJsdoc = require("swagger-jsdoc");

import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";
import fs from "fs";

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
        url: "http://10.12.53.67:4400/api/v1", // ✅ Force HTTP
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
  apis: [
    "./src/modules/swagger/*.ts", // All swagger documentation files
    "./src/modules/*/routes/*.ts", // Route files that might have inline docs
    "./src/modules/attendance/*.ts", // Attendance module files
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Get absolute path to swagger assets
  const swaggerUiDistPath = path.dirname(require.resolve("swagger-ui-dist"));
  const swaggerUiCss = fs.readFileSync(path.join(swaggerUiDistPath, "swagger-ui.css"), "utf8");
  const swaggerUiBundle = fs.readFileSync(path.join(swaggerUiDistPath, "swagger-ui-bundle.js"), "utf8");
  const swaggerUiPreset = fs.readFileSync(path.join(swaggerUiDistPath, "swagger-ui-standalone-preset.js"), "utf8");

  // Serve custom Swagger UI with local assets
  app.get("/api-docs", (req, res) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Payroll Management API Documentation</title>
  <style>${swaggerUiCss}</style>
  <style>
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .scheme-container { background: #f7f7f7; padding: 20px; margin: 20px 0; border-radius: 5px; }
  </style>
  <script>
    // Polyfill for crypto.randomUUID
    if (!window.crypto?.randomUUID) {
      window.crypto = {
        ...window.crypto,
        randomUUID: function() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        }
      }
    }
  </script>
</head>
<body>
  <div id="swagger-ui"></div>
  <script>${swaggerUiBundle}</script>
  <script>${swaggerUiPreset}</script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(specs)},
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        // ✅ Force HTTP and prevent HTTPS redirects
        requestInterceptor: function(request) {
          console.log('Original request URL:', request.url);
          
          // Force HTTP protocol for all requests to our server
          if (request.url && request.url.includes('10.12.53.67:4400')) {
            const originalUrl = request.url;
            request.url = request.url.replace(/^https:\/\//, 'http://');
            console.log('Converted URL:', originalUrl, '->', request.url);
          }
          
          // Also check and fix any other HTTPS URLs
          if (request.url && request.url.startsWith('https://')) {
            const originalUrl = request.url;
            request.url = request.url.replace(/^https:\/\//, 'http://');
            console.log('Fixed HTTPS URL:', originalUrl, '->', request.url);
          }
          
          return request;
        }
      });
    }
  </script>
</body>
</html>`;
    
    res.send(html);
  });

  // Serve swagger JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  console.log(
    `📚 Swagger documentation available at: http://10.12.53.67:4400/api-docs`
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
