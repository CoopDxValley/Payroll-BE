import express from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import * as allowanceDefinitionController from "./allowanceDefinition.controller";
import {
  createAllowanceDefinitionSchema,
  updateAllowanceDefinitionSchema,
  getAllowanceDefinitionByIdSchema,
} from "./allowanceDefinition.validation";
import {
  CreateAllowanceDefinitionInput,
  UpdateAllowanceDefinitionInput,
  GetAllowanceDefinitionByIdParams,
} from "./allowanceDefinition.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreateAllowanceDefinitionInput>({
      body: createAllowanceDefinitionSchema,
    }),
    allowanceDefinitionController.create
  )
  .get(auth(), allowanceDefinitionController.getAll);

router
  .route("/:id")
  .get(
    auth(),
    validate<GetAllowanceDefinitionByIdParams, never, never>({
      params: getAllowanceDefinitionByIdSchema,
    }),
    allowanceDefinitionController.getById
  )
  .post(
    auth(),
    validate<
      GetAllowanceDefinitionByIdParams,
      never,
      UpdateAllowanceDefinitionInput
    >({
      params: getAllowanceDefinitionByIdSchema,
      body: updateAllowanceDefinitionSchema,
    }),
    allowanceDefinitionController.update
  );

router.route("/remove/:id").post(
  auth(),
  validate<GetAllowanceDefinitionByIdParams, never, never>({
    params: getAllowanceDefinitionByIdSchema,
  }),
  allowanceDefinitionController.remove
);

export default router;
