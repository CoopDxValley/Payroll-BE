import express from "express";
import providentFundController from "./providentFund.controller";
import providentFundValidation from "./providentFund.validation";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  CreateProvidentFundInput,
  ProvidentFundParams,
} from "./providentFund.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreateProvidentFundInput>(
      providentFundValidation.createProvidentFund
    ),
    providentFundController.createProvidentFund
  )
  .get(auth(), providentFundController.getCompanyProvidentFund);

router
  .route("/default")
  .get(auth(), providentFundController.getDefaultProvidentFund);

router
  .route("/:ruleId")
  .post(
    auth(),
    validate<ProvidentFundParams, never, never>(
      providentFundValidation.providentFundParams
    ),
    providentFundController.removeCompanyProvidentFund
  )
  .get(
    auth(),
    validate<ProvidentFundParams, never, never>(
      providentFundValidation.providentFundParams
    ),
    providentFundController.fetchProvidentFundById
  );

router
  .route("/:ruleId")
  .get(
    auth(),
    validate<ProvidentFundParams, never, never>(
      providentFundValidation.providentFundParams
    ),
    providentFundController.fetchProvidentFundById
  );

router
  .route("/tax/reset")
  .post(auth(), providentFundController.resetCompanyProvidentFundRules);

router
  .route("/assign/default")
  .post(auth(), providentFundController.assignDefaultProvidentFundsToCompany);

export default router;
