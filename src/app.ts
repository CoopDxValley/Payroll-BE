import path from "path";
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import httpStatus from "http-status";
// import { createBullBoard } from "@bull-board/api";
// import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
// import { ExpressAdapter } from "@bull-board/express";
import routes from "./routes/v1";
import { jwtStrategy } from "./config/passport";
import ApiError from "./utils/api-error";
import { errorConverter, errorHandler } from "./middlewares/error";
import config from "./config/config";
import morgan from "./config/morgan";
// import { smsQueue } from "./queues";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/new-doc";

// const serverAdapter = new ExpressAdapter();
// serverAdapter.setBasePath("/ui");

// createBullBoard({
//   queues: [new BullMQAdapter(smsQueue)],
//   serverAdapter,
// });

// serverAdapter.setBasePath("/admin/queues");

const app = express();
app.set("trust proxy", 1);
if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// app.use("/admin/queues", serverAdapter.getRouter());

app.use(helmet());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(compression());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*name", cors());

app.use((req, res, next) => {
  res.removeHeader("Cross-Origin-Opener-Policy");
  res.removeHeader("Origin-Agent-Cluster");
  // res.removeHeader("Strict-Transport-Security");
  // res.setHeader(
  //   "Content-Security-Policy",
  //   "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  // );

  next();
});

app.use(
  "/api/api-docs",
  (req: Request, res: Response, next: NextFunction) => {
    res.removeHeader?.("Strict-Transport-Security");
    res.setHeader?.(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
    );
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// app.use("/api/v1/api-docs", (req, res, next) => {
//   res.removeHeader("Strict-Transport-Security");
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
//   );
//   next();
// }, swaggerUi);

//     res.setHeader(
//       "Content-Security-Policy",
//       "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
//     );
//     next();
//   },
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerSpec)
// );

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// v1 api routes
app.use("/api/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
