import express from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import * as additionalPayController from "./additionalpay.controller";
import {
  createAdditionalPaySchema,
  updateAdditionalPaySchema,
  getAdditionalPayByIdSchema,
} from "./additionalpay.validation";
import {
  CreateAdditionalPayInput,
  UpdateAdditionalPayInput,
  GetAdditionalPayByIdParams,
} from "./additionalpay.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, CreateAdditionalPayInput>(createAdditionalPaySchema),
    additionalPayController.create
  )
  .get(auth(), additionalPayController.getAll);

router
  .route("/:id")
  .get(
    auth(),
    validate<GetAdditionalPayByIdParams, never, never>(
      getAdditionalPayByIdSchema
    ),
    additionalPayController.getById
  )
  .post(
    auth(),
    validate<GetAdditionalPayByIdParams, never, UpdateAdditionalPayInput>(
      updateAdditionalPaySchema
    ),
    additionalPayController.update
  );

router
  .route("/remove/:id")
  .post(
    auth(),
    validate<GetAdditionalPayByIdParams, never, never>(
      getAdditionalPayByIdSchema
    ),
    additionalPayController.remove
  );

export default router;
