import express from "express";
import swaggerUi, { swaggerDocs } from "./swaggerfile";

const router = express.Router();

// Serve Swagger UI with custom setup and request interceptor
router.get("/swagger-ui", (req, res) => {
  // Ensure all server URLs in the spec are HTTP
  const modifiedSpec = {
    ...swaggerDocs,
    servers: (swaggerDocs as any).servers?.map((server: any) => ({
      ...server,
      url: server.url.replace(/^https:\/\//, 'http://')
    })) || []
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Payroll API Documentation - Documents</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(modifiedSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
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
    };
  </script>
</body>
</html>`;

  res.send(html);
});

// Serve swagger JSON
router.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocs);
});

// Health check for documents
router.get("/health", (req, res) => {
  res.json({
    message: "Documents service is running",
    timestamp: new Date().toISOString(),
    service: "documents",
  });
});

export default router;
