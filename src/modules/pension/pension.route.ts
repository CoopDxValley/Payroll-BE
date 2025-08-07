import express from "express";
import providentFundController from "./pension.controller";
import providentFundValidation from "./pension.validation";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { CreatePensionInput, PensionParams } from "./pension.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreatePensionInput>(
      providentFundValidation.createPension
    ),
    providentFundController.createPension
  )
  .get(auth(), providentFundController.getCompanyPension);

router.route("/default").get(auth(), providentFundController.getDefaultPension);

router
  .route("/:ruleId")
  .post(
    auth(),
    validate<PensionParams, never, never>(
      providentFundValidation.pensionParams
    ),
    providentFundController.removeCompanyPension
  )
  .get(
    auth(),
    validate<PensionParams, never, never>(
      providentFundValidation.pensionParams
    ),
    providentFundController.fetchPensionById
  );

router
  .route("/:ruleId")
  .get(
    auth(),
    validate<PensionParams, never, never>(
      providentFundValidation.pensionParams
    ),
    providentFundController.fetchPensionById
  );

router
  .route("/tax/reset")
  .post(auth(), providentFundController.resetCompanyPensionRules);

router
  .route("/assign/default")
  .post(auth(), providentFundController.assignDefaultPensionFundsToCompany);

export default router;
