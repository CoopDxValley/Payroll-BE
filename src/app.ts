import path from "path";
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import httpStatus from "http-status";
import routes from "./routes/v1";
import { jwtStrategy } from "./config/passport";
import ApiError from "./utils/api-error";
import { errorConverter, errorHandler } from "./middlewares/error";
import config from "./config/config";
import morgan from "./config/morgan";
import xssMiddleware from "./middlewares/xss";
import { loginLimiter } from "./middlewares/rate-limiter";
import httpSmugglingMiddleware from "./middlewares/http-smuggler";

const app = express();

// Trust proxy headers if behind reverse proxy
// app.set("trust proxy", 1);

// Logging
if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// http smuggling
app.use(httpSmugglingMiddleware());

// Helmet Security Headers
app.use(helmet());

// Request body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// XSS Protection
app.use(xssMiddleware());

// Compression
app.use(compression());

// CORS Setup
app.use(
  cors({
    origin: [
      "http://10.12.53.67:4400",
      "http://localhost:3000",
      "https://zuqualla.coopbankoromiasc.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "../Uploads")));

// Passport JWT auth
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// Limit repeated failed requests to auth endpoints
// if (config.env === "production") {
//   app.use("/api/v1/auth", loginLimiter);
// }

// API Routes
app.use("/api/v1", routes);

// Swagger UI
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./documents/newdoc");

app.use(
  "/api/api-docs",
  (req, res, next) => {
    res.removeHeader("Strict-Transport-Security");
    res.setHeader(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// 404 for unmatched routes
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// Error converters/handlers
app.use(errorConverter);
app.use(errorHandler);

export default app;
