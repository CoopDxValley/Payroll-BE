import express from "express";
import taxslabController from "./taxslab.controller";
import taxslabValidation from "./taxslab.validation";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { CreateTaxslabInput, TaxslabParams } from "./taxslab.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreateTaxslabInput>(taxslabValidation.createTaxslab),
    taxslabController.createTaxslab
  )
  .get(auth(), taxslabController.getCompanyTaxRules);

router.route("/default").get(auth(), taxslabController.getDefaultTaxslab);

router
  .route("/:ruleId")
  .post(
    auth(),
    validate<TaxslabParams, never, never>(taxslabValidation.taxslabParams),
    taxslabController.removeCompanyTaxslab
  )
  .get(
    auth(),
    validate<TaxslabParams, never, never>(taxslabValidation.taxslabParams),
    taxslabController.fetchTaxslabById
  );

router
  .route("/:ruleId")
  .get(
    auth(),
    validate<TaxslabParams, never, never>(taxslabValidation.taxslabParams),
    taxslabController.fetchTaxslabById
  );

router
  .route("/taxslab/reset")
  .post(auth(), taxslabController.resetCompanyTaxslab);

router
  .route("/assign/default")
  .post(auth(), taxslabController.assignDefaultTaxRulesToCompany);

export default router;
