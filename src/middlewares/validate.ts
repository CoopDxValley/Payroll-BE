import httpStatus from "http-status";
import ApiError from "../utils/api-error";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// Define SchemaObject type
type SchemaObject = {
  body?: { parse: (input: any) => any };
  query?: { parse: (input: any) => any };
  params?: { parse: (input: any) => any };
};

export const validate =
  (schema: SchemaObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      return next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const details = err.errors.map((issue) => ({
          message: issue.message,
          path: issue.path.join("."),
        }));

        return next(
          new ApiError(
            httpStatus.BAD_REQUEST,
            "Validation Error",
            false,
            details
          )
        );
      }

      // For non-Zod errors
      return next(err);
    }
  };
