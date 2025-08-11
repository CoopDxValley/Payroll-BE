


import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config";
import path from "path";
import fs from "fs";

export const setupSwagger = Router();

// Get absolute path to swagger assets
const swaggerUiDistPath = path.dirname(require.resolve("swagger-ui-dist"));
const swaggerUiCss = fs.readFileSync(path.join(swaggerUiDistPath, "swagger-ui.css"), "utf8");
const swaggerUiBundle = fs.readFileSync(path.join(swaggerUiDistPath, "swagger-ui-bundle.js"), "utf8");
const swaggerUiPreset = fs.readFileSync(path.join(swaggerUiDistPath, "swagger-ui-standalone-preset.js"), "utf8");

// Serve Swagger UI with self-hosted assets
setupSwagger.use("/", swaggerUi.serve);
setupSwagger.get("/", (req, res) => {
  const html = 
  `  <!DOCTYPE html>
    <html>
    <head>
      <title>Payroll API Documentation</title>
      <style>${swaggerUiCss}</style>
      <style>.swagger-ui .topbar { display: none }</style>
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
            spec: ${JSON.stringify(swaggerSpec)},
            dom_id: '#swagger-ui',
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout",
            supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
            docExpansion: 'none',
            filter: true,
            showRequestHeaders: true
          });
        }
      </script>
    </body>
    </html>
  ;`
  res.send(html);
});	