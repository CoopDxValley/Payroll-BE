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
import { CreateCompanyInput, UpdateCompanyInput } from "./company.type";

const router = Router();

router.post(
  "/register",
  validate<never, never, CreateCompanyInput>(createCompanyValidation),
  registerCompany
);
router.get("/profile", auth(), getCompany);
router.post(
  "/update",
  auth(),
  upload.none(),
  validate<never, never, UpdateCompanyInput>(updateCompanyValidation),
  updateCompany
);

export default router;
