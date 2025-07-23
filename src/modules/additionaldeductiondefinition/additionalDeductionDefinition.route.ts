import express from "express";
// import validate from "../../middlewares/validate";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";
// import additionalDeductionDefinitionValidation from "../../validations/additionalDeductionDefinition.validation";
import additionalDeductionDefinitionController from "./additionalDeductionDefinition.controller";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_payroll_setting"),
    // validate(additionalDeductionDefinitionValidation.create),
    additionalDeductionDefinitionController.create
  )
  .get(
    auth(),
    // checkPermission("view_payroll_setting"),
    additionalDeductionDefinitionController.getAll
  );

router
  .route("/:id")
  .get(
    auth(),
    // validate(additionalDeductionDefinitionValidation.getById),
    additionalDeductionDefinitionController.getById
  )
  .post(
    auth(),
    // validate(additionalDeductionDefinitionValidation.update),
    additionalDeductionDefinitionController.update
  );

router
  .route("/delete/:id")
  .post(
    auth(),
    // validate(additionalDeductionDefinitionValidation.getById),
    additionalDeductionDefinitionController.remove
  );

export default router;
