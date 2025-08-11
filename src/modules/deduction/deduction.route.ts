import express from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import * as deductionController from "./deduction.controller";
import {
  createDeductionSchema,
  updateDeductionSchema,
  getDeductionByIdSchema,
} from "./deduction.validation";
import {
  CreateDeductionInput,
  UpdateDeductionInput,
  GetDeductionByIdParams,
} from "./deduction.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreateDeductionInput>({
      body: createDeductionSchema,
    }),
    deductionController.create
  )
  .get(auth(), deductionController.getAll);

router
  .route("/:id")
  .get(
    auth(),
    validate<GetDeductionByIdParams, never, never>({
      params: getDeductionByIdSchema,
    }),
    deductionController.getById
  )
  .post(
    auth(),
    validate<GetDeductionByIdParams, never, UpdateDeductionInput>({
      params: getDeductionByIdSchema,
      body: updateDeductionSchema,
    }),
    deductionController.update
  );

router.route("/remove/:id").post(
  auth(),
  validate<GetDeductionByIdParams, never, never>({
    params: getDeductionByIdSchema,
  }),
  deductionController.remove
);

export default router;
