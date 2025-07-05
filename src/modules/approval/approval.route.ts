import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { createApprovalWorkflowValidation } from "./approval.validation";
import { createWorkflow } from "./approval.controller";
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

export default router;
