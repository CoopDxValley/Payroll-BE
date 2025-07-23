import { Router } from "express";

import { validate } from "../../middlewares/validate";
import {
  createCompanyValidation,
  updateCompanyValidation,
} from "./company.validation";
import {
  getCompany,
  registerCompany,
  updateCompany,
} from "./company.controller";
import auth from "../../middlewares/auth";
import { upload } from "../../config/multer";

const router = Router();

router.post("/register", validate(createCompanyValidation), registerCompany);
router.get("/profile", auth(), getCompany);
router.post(
  "/update",
  auth(),
  upload.none(),
  validate(updateCompanyValidation),
  updateCompany
);

export default router;
