import express from "express";

import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import pensionController from "./pension.controller";
import {
  UpdatePensionInput,
  CreatePensionInput,
  PensionParams,
} from "./pension.type";
import pensionValidation from "./pension.validation";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreatePensionInput>(pensionValidation.createPension),
    pensionController.createPension
  )
  .get(auth(), pensionController.getCompanyPension);

router.route("/default").get(auth(), pensionController.getDefaultPension);

router
  .route("/:ruleId")
  .post(
    auth(),
    validate<PensionParams, never, never>(pensionValidation.pensionParams),
    pensionController.removeCompanyPension
  )
  .get(
    auth(),
    validate<PensionParams, never, never>(pensionValidation.pensionParams),
    pensionController.fetchPensionById
  );

router
  .route("/rules/update/:ruleId")
  .post(
    auth(),
    validate<PensionParams, never, CreatePensionInput>(
      pensionValidation.createPension
    ),
    pensionController.update
  );

router
  .route("/rules/reset")
  .post(auth(), pensionController.resetCompanyPensionRules);

router
  .route("/assign/default")
  .post(auth(), pensionController.assignDefaultPensionFundsToCompany);

export default router;
