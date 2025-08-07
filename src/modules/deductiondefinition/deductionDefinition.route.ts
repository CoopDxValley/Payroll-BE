import express from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import * as deductionDefinitionController from "./deductiondefinition.controller";
import {
  createDeductionDefinitionSchema,
  updateDeductionDefinitionSchema,
  getDeductionDefinitionByIdSchema,
} from "./deductiondefinition.validation";
import {
  CreateDeductionDefinitionInput,
  UpdateDeductionDefinitionInput,
  GetDeductionDefinitionByIdParams,
} from "./deductiondefinition.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreateDeductionDefinitionInput>({
      body: createDeductionDefinitionSchema,
    }),
    deductionDefinitionController.create
  )
  .get(auth(), deductionDefinitionController.getAll);

router
  .route("/:id")
  .get(
    auth(),
    validate<GetDeductionDefinitionByIdParams, never, never>({
      params: getDeductionDefinitionByIdSchema,
    }),
    deductionDefinitionController.getById
  )
  .post(
    auth(),
    validate<
      GetDeductionDefinitionByIdParams,
      never,
      UpdateDeductionDefinitionInput
    >({
      params: getDeductionDefinitionByIdSchema,
      body: updateDeductionDefinitionSchema,
    }),
    deductionDefinitionController.update
  );

router.route("/remove/:id").post(
  auth(),
  validate<GetDeductionDefinitionByIdParams, never, never>({
    params: getDeductionDefinitionByIdSchema,
  }),
  deductionDefinitionController.remove
);

export default router;
