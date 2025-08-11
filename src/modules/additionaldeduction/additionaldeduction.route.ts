import express from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import * as additionalDeductionController from "./additionaldeduction.controller";
import {
  createAdditionalDeductionSchema,
  updateAdditionalDeductionSchema,
  getAdditionalDeductionByIdSchema,
} from "./additionaldeduction.validation";
import {
  CreateAdditionalDeductionInput,
  UpdateAdditionalDeductionInput,
  GetAdditionalDeductionByIdParams,
} from "./additionaldeduction.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreateAdditionalDeductionInput>(
      createAdditionalDeductionSchema
    ),
    additionalDeductionController.create
  )
  .get(auth(), additionalDeductionController.getAll);

router
  .route("/:id")
  .get(
    auth(),
    validate<GetAdditionalDeductionByIdParams, never, never>(
      getAdditionalDeductionByIdSchema
    ),
    additionalDeductionController.getById
  )
  .post(
    auth(),
    validate<
      GetAdditionalDeductionByIdParams,
      never,
      UpdateAdditionalDeductionInput
    >(updateAdditionalDeductionSchema),
    additionalDeductionController.update
  );

router
  .route("/remove/:id")
  .post(
    auth(),
    validate<GetAdditionalDeductionByIdParams, never, never>(
      getAdditionalDeductionByIdSchema
    ),
    additionalDeductionController.remove
  );

export default router;
