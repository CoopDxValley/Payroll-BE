// import { Request, Response, NextFunction } from "express";

// /**
//  * A higher-order function that wraps an async function to catch any errors
//  * and pass them to the next middleware.
//  *
//  * @param {Function} fn - The async function to wrap.
//  * @returns {Function} - A new function that catches errors from the original function.
//  */
// const catchAsync = (
//   fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
// ) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     fn(req, res, next).catch(next);
//   };
// };

// export default catchAsync;

// catchAsync.ts
import { Request, Response, NextFunction } from "express";

// Define a generic type for the async function
type AsyncController<T extends Request = Request> = (
  req: T,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * A higher-order function that wraps an async function to catch any errors
 * and pass them to the next middleware.
 *
 * @param fn - The async function to wrap, with a generic request type.
 * @returns A new function that catches errors from the original function.
 */
const catchAsync = <T extends Request>(fn: AsyncController<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req as T, res, next).catch(next);
  };
};

export default catchAsync;
