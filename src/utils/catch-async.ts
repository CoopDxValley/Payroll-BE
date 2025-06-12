import { Request, Response, NextFunction } from "express";

/**
 * A higher-order function that wraps an async function to catch any errors
 * and pass them to the next middleware.
 *
 * @param {Function} fn - The async function to wrap.
 * @returns {Function} - A new function that catches errors from the original function.
 */
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
