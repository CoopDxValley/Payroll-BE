import { Router } from "express";
import { validate } from "../../middlewares/validate";
import {
  createApprovalWorkflowValidation,
  createRequestValidation,
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
  getApprovalWorkflows,
  getDepartmentApprovalWorkflow,
} from "./approval.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/check-permissions";
import {
  approvalDto,
  CreateApprovalWorkflowDto,
  CreateDelegationRuleDto,
  CreateRequestDto,
} from "./approval.type";

const router = Router();

router.post(
  "/createWorkflow",
  auth(),
  // checkPermission("create_system_setting"),
  validate<never, never, CreateApprovalWorkflowDto>(
    createApprovalWorkflowValidation
  ),
  createWorkflow
);

router.post(
  "/createRequest",
  auth(),
  // checkPermission("create_system_setting"),
  validate<never, never, CreateRequestDto>(createRequestValidation),
  createRequest
);

router.post(
  "/createDelegation",
  auth(),
  // checkPermission("create_system_setting"),
  validate<never, never, CreateDelegationRuleDto>(
    createDelegationRuleValidation
  ),
  createDelegationRule
);

router.post(
  "/action",
  auth(),
  // checkPermission("approve_request"),
  validate<never, never, approvalDto>(approvalValidation),
  action
);

router.post(
  "/resubmit/:instanceId",
  auth(),
  // checkPermission("resubmit_request"),
  validate(resubmitApprovalValidation),
  resubmit
);

router.get(
  "/audit-log",
  auth(),
  // checkPermission("view_audit_log"),
  validate(auditLogQueryValidation),
  getAuditLog
);

router.get(
  "/instance/:id",
  auth(),
  // checkPermission("view_instance"),
  getInstanceDetails
);

router.get("/workflows", auth(), getApprovalWorkflows);

router.get("/workflows/:departmentId", auth(), getDepartmentApprovalWorkflow);

export default router;
