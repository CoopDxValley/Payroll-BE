import { Router } from "express";

import { validate } from "../../middlewares/validate";
import { createCompanyValidation } from "./company.validation";
import { registerCompany } from "./company.controller";

const router = Router();

router.post("/register", validate(createCompanyValidation), registerCompany);

export default router;
