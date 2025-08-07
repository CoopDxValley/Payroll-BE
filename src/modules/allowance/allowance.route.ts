import express from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import * as allowanceController from "./allowance.controller";
import {
  createAllowanceSchema,
  updateAllowanceSchema,
  getAllowanceByIdSchema,
} from "./allowance.validation";
import {
  CreateAllowanceInput,
  UpdateAllowanceInput,
  GetAllowanceByIdParams,
} from "./allowance.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreateAllowanceInput>({
      body: createAllowanceSchema,
    }),
    allowanceController.create
  )
  .get(auth(), allowanceController.getAll);

router
  .route("/:id")
  .get(
    auth(),
    validate<GetAllowanceByIdParams, never, never>({
      params: getAllowanceByIdSchema,
    }),
    allowanceController.getById
  )
  .post(
    auth(),
    validate<GetAllowanceByIdParams, never, UpdateAllowanceInput>({
      params: getAllowanceByIdSchema,
      body: updateAllowanceSchema,
    }),
    allowanceController.update
  );

router.route("/remove/:id").post(
  auth(),
  validate<GetAllowanceByIdParams, never, never>({
    params: getAllowanceByIdSchema,
  }),
  allowanceController.remove
);

export default router;
