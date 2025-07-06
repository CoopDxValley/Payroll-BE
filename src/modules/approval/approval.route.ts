import { Router } from "express";
import { validate } from "../../middlewares/validate";
import {
  createApprovalWorkflowValidation,
  createRequestValidation,
} from "./approval.validation";
import { createRequest, createWorkflow } from "./approval.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";

const router = Router();

router.post(
  "/createWorkflow",
  // auth(),
  // checkPermission("create_system_setting"),
  validate(createApprovalWorkflowValidation),
  createWorkflow
);

router.post(
  "/createRequest",
  // auth(),
  // checkPermission("create_system_setting"),
  validate(createRequestValidation),
  createRequest
);

export default router;
