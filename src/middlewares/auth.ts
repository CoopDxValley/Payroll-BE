import passport from "passport";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";
import { NextFunction, Request, Response } from "express";
import { AuthEmployee } from "../modules/auth/auth.type";

const verifyCallback =
  (
    req: any,
    resolve: (value?: unknown) => void,
    reject: (reason?: unknown) => void
  ) =>
  async (err: unknown, employee: AuthEmployee, info: unknown) => {
    if (err || info || !employee) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    }
    req.employee = employee;
    resolve();
  };

const auth = () => async (req: Request, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyCallback(req, resolve, reject)
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

export default auth;
