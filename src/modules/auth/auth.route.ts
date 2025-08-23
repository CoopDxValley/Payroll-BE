import { Router } from "express";
import {
  loginValidation,
  logoutValidation,
  forgotPasswordValidation,
  logoutSchema,
} from "./auth.validation";
import { CustomRequest, validate } from "../../middlewares/validate";
import * as authController from "./auth.controller";
// import auth from "../../middlewares/auth";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/check-permissions";
import { LogoutEmployeeInput } from "./auth.type";

const router = Router();

router.post("/login", validate(loginValidation), authController.login);
router.post("/logout", validate(logoutValidation), authController.logout);
router.get("/me", auth(), authController.me);
router.post(
  "/resetPassword",
  auth(),
  validate(loginValidation),
  authController.resetPassword
);
router.post(
  "/forgotPassword",
  auth(),
  checkPermission("create_system_setting"),
  validate(forgotPasswordValidation),
  authController.forgotPassword
);

router.post(
  "/refresh/accessToken",
  // auth(),
  validate<CustomRequest<never, never, LogoutEmployeeInput>>({
    body: logoutSchema,
  }),
  authController.refreshTokens
);

export default router;
