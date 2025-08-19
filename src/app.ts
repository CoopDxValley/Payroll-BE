import path from "path";
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import { webcrypto } from "crypto";
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

const app = express();

// Trust proxy headers if behind reverse proxy
// app.set("trust proxy", 1);

// Logging
if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// ✅ Helmet Security Headers
app.use(helmet());

// ✅ Request body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// XSS Protection
app.use(xssMiddleware());

// ✅ Compression
app.use(compression());

// ✅ CORS Setup (Single, Global)
app.use(
  cors({
    origin: "*", // or 'http://10.12.53.67:4400' if you want to restrict it
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Request-ID"],
    credentials: false,
    maxAge: 86400,
  })
);


// ✅ Helmet Security Headers
app.use(helmet());

// ✅ Request body parsers
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Compression
app.use(compression());

// ✅ Static file serving
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ✅ Passport JWT auth
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/api/v1/auth", loginLimiter);
}

// ✅ API Routes
app.use("/api/v1", routes);

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./documents/newdoc"); // Path to your Swagger configuration fileconst swaggerUi = require("swagger-ui-express");

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

// ✅ 404 for unmatched routes
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// ✅ Error converters/handlers
app.use(errorConverter);
app.use(errorHandler);

export default app;
