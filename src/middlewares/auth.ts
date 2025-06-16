import passport from "passport";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";
import { NextFunction, Request, Response } from "express";
import { AuthUser } from "../types/express";

const verifyCallback =
  (
    req: any,
    resolve: (value?: unknown) => void,
    reject: (reason?: unknown) => void
  ) =>
  async (err: unknown, user: AuthUser | false, info: unknown) => {
    // console.log("err--", err);
    // console.log("user--", user);
    // console.log("info--", info);
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    }
    req.user = user;

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

// const auth = () => async (req: Request, res: Response, next: NextFunction) => {
//   return new Promise((resolve, reject) => {
//     passport.authenticate(
//       "jwt",
//       { session: false },
//       verifyCallback(req, resolve, reject)
//     )(req, res, next);
//   })
//     .then(() => {
//       if (!req.user) {
//         throw new Error('User not authenticated');
//       }
//       next();
//     })
//     .catch((err) => next(err));
// };
export default auth;
