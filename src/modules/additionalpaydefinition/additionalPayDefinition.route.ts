import express from "express";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/check-permissions";
import { validate } from "../../middlewares/validate";
import additionalPayDefinitionValidation from "../additionaldeductiondefinition/additionalDeductionDefinition.validation";
import additionalPayDefinitionController from "./additionalPayDefinition.controller";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_payroll_setting"),
    validate(additionalPayDefinitionValidation.create),
    additionalPayDefinitionController.create
  )
  .get(
    auth(),
    // checkPermission("view_payroll_setting"),
    additionalPayDefinitionController.getAll
  );

router
  .route("/:id")
  .get(
    auth(),
    validate(additionalPayDefinitionValidation.getById),
    additionalPayDefinitionController.getById
  )
  .post(
    auth(),
    validate(additionalPayDefinitionValidation.update),
    additionalPayDefinitionController.update
  );

router
  .route("/delete/:id")
  .post(
    auth(),
    validate(additionalPayDefinitionValidation.getById),
    additionalPayDefinitionController.remove
  );

export default router;
