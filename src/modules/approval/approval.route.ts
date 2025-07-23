import { Router } from "express";
import { validate } from "../../middlewares/validate";
import {
  createApprovalWorkflowValidation,
  createRequestValidation,
  // approvalCommentValidation,
  // delegationValidation,
  // escalationValidation,
  auditLogQueryValidation,
  createDelegationRuleValidation,
  approvalValidation,
  resubmitApprovalValidation,
} from "./approval.validation";
import {
  createRequest,
  createWorkflow,
  action,
  getAuditLog,
  getInstanceDetails,
  createDelegationRule,
  resubmit,
} from "./approval.controller";
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

router.post(
  "/createDelegation",
  // auth(),
  // checkPermission("create_system_setting"),
  validate(createDelegationRuleValidation),
  createDelegationRule
);

router.post(
  "/action",
  // auth(),
  // checkPermission("approve_request"),
  validate(approvalValidation),
  action
);

router.post(
  "/resubmit/:instanceId",
  // auth(),
  // checkPermission("resubmit_request"),
  validate(resubmitApprovalValidation),
  resubmit
);

router.get(
  "/audit-log",
  // auth(),
  // checkPermission("view_audit_log"),
  validate(auditLogQueryValidation),
  getAuditLog
);

router.get(
  "/instance/:id",
  // auth(),
  // checkPermission("view_instance"),
  getInstanceDetails
);

export default router;
