// import httpStatus from "http-status";
// import ApiError from "../utils/api-error";
// import { NextFunction, Request, Response } from "express";
// import { ZodError } from "zod";

// // Define SchemaObject type
// type SchemaObject = {
//   body?: { parse: (input: any) => any };
//   query?: { parse: (input: any) => any };
//   params?: { parse: (input: any) => any };
// };

// export const validate =
//   (schema: SchemaObject) =>
//   (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (schema.body) {
//         req.body = schema.body.parse(req.body);
//       }
//       // if (schema.query) {
//       //   req.query = schema.query.parse(req.query);
//       // }
//       if (schema.query) {
//         // Don't overwrite req.query — store parsed query separately
//         (req as any).validatedQuery = schema.query.parse(req.query);
//       }
//       if (schema.params) {
//         req.params = schema.params.parse(req.params);
//       }
//       return next();
//     } catch (err: any) {
//       if (err instanceof ZodError) {
//         console.log("Zod validation error:", err.errors);
//         const details = err.errors.map((issue) => ({
//           message: issue.message,
//           path: issue.path.join("."),
//         }));

//         return next(
//           new ApiError(
//             httpStatus.BAD_REQUEST,
//             "Validation Error",
//             false,
//             details
//           )
//         );
//       }

//       // For non-Zod errors
//       return next(err);
//     }
//   };

import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";
import ApiError from "../utils/api-error";
import { AuthEmployee } from "../modules/auth/auth.type";
import { deepSanitize, ensureStrict } from "../validations/security";

// Define a generic request type for better type safety
export interface CustomRequest<
  TParams = unknown,
  TQuery = unknown,
  TBody = unknown
> extends Request<TParams, any, TBody> {
  validatedQuery?: TQuery; // Store parsed query separately
  employee?: AuthEmployee;
}

// Define SchemaObject type with generics
type SchemaObject<TParams = any, TQuery = any, TBody = any> = {
  body?: z.ZodSchema<TBody>;
  query?: z.ZodSchema<TQuery>;
  params?: z.ZodSchema<TParams>;
};

export const validate =
  <TParams = unknown, TQuery = unknown, TBody = unknown>(
    schema: SchemaObject<TParams, TQuery, TBody>
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate and assign params
      if (schema.params) {
        const s = ensureStrict(schema.params);
        (req as CustomRequest<TParams, TQuery, TBody>).params = s.parse(
          deepSanitize(req.params)
        );
      }

      // Validate and assign query (store separately to avoid overwriting req.query)
      if (schema.query) {
        const s = ensureStrict(schema.query);
        (req as CustomRequest<TParams, TQuery, TBody>).validatedQuery = s.parse(
          deepSanitize(req.query)
        );
      }

      // Validate and assign body
      if (schema.body) {
        const s = ensureStrict(schema.body);
        (req as CustomRequest<TParams, TQuery, TBody>).body = s.parse(
          deepSanitize(req.body)
        );
      }

      return next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        console.log("Zod validation error:", err.errors);
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

      // For non-Zod errors, pass to Express error handler
      return next(err);
    }
  };

// export validate;
