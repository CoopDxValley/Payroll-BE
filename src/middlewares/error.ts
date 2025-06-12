import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import config from "../config/config";
import logger from "../config/logger";
import ApiError from "../utils/api-error";
import { Prisma } from "@prisma/client";

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.details);
  }

  next(error);
};

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;
  if (config.env === "production" && !err.isOperational) {
    statusCode = httpStatus.BAD_REQUEST;
    message = httpStatus[httpStatus.BAD_REQUEST];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    details,
    ...(config.env === "development" && { stack: err.stack }),
  };

  if (config.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
