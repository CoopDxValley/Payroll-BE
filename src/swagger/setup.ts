import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config";

const router = Router();

// Serve Swagger documentation
router.use("/", swaggerUi.serve);
router.get(
  "/",
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Payroll API Documentation",
  })
);

// Serve raw swagger spec
router.get("/json", (_, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

export const setupSwagger = router;
