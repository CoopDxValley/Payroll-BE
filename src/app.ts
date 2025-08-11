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
import { webcrypto } from "crypto";

const app = express();

// Trust proxy headers if behind reverse proxy
app.set("trust proxy", 1);

// Logging
if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

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
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": [
          "'self'",
          "unpkg.com",
          "blob:",
          "'unsafe-inline'",
          "https://infird.com", // ✅ Allow external scripts
          "http://10.12.53.67:4400", // ✅ Allow local HTTP
          "https://10.12.53.67:4400", // ✅ Allow local HTTPS
        ],
        "style-src": ["'self'", "unpkg.com", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "unpkg.com"],
        "connect-src": [
          "'self'",
          "http://10.12.53.67:4400",
          "https://10.12.53.67:4400",
          "http://localhost:*",
          "https://localhost:*",
          "http://*", // ✅ Allow all HTTP origins
          "https://*", // ✅ Allow all HTTPS origins
        ],
        "frame-src": ["'self'", "http://10.12.53.67:4400"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // ✅ Disable for HTTP origins
    crossOriginOpenerPolicy: false, // ✅ Disable for HTTP origins
    crossOriginResourcePolicy: false, // ✅ Disable for HTTP origins
    hsts: false,
  })
);

// ✅ Add crypto to global if missing
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

// ✅ Add crypto.randomUUID polyfill for older browsers
if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: function () {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    },
  } as any;
}

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

// ✅ API Routes
app.use("/api/v1", routes);

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./documents/newdoc"); // Path to your Swagger configuration fileconst swaggerUi = require("swagger-ui-express");
// const swaggerOptions = {
//   swaggerOptions: {
//     url: "http://localhost:6000/api-docs/swagger.json", // Update the URL to match your setup
//   },
// };

// app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
