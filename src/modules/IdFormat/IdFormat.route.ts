import express from "express";
import * as controller from "./IdFormat.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import validations from "./IdFormat.validation";
import {
  CreateIdFormatInput,
  UpdateIdFormatBody,
  UpdateIdFormatParams,
} from "./IdFormat.type";

const router = express.Router();

router.post(
  "/",
  auth(),
  validate<never, never, CreateIdFormatInput>(validations.createIdFormat),
  controller.createIdFormat
);

router.get("/", auth(), controller.getAllCompanyIdFormats);

router.get("/active", auth(), controller.getActiveCompanyIdFormat);

router.post(
  "/:id",
  auth(),
  validate<UpdateIdFormatParams, never, UpdateIdFormatBody>(
    validations.updateIdFormat
  ),
  controller.updateIdFormat
);

router.post(
  "/remove/:id",
  auth(),
  validate<UpdateIdFormatParams, never, never>(validations.getOrDeleteIdFormat),
  controller.deleteIdFormat
);

export default router;
