import { Router } from "express";
import {
  loginValidation,
  logoutValidation,
  forgotPasswordValidation,
} from "./auth.validation";
import { validate } from "../../middlewares/validate";
import * as authController from "./auth.controller";
// import auth from "../../middlewares/auth";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/check-permissions";

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

export default router;
