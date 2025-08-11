import { z } from "zod";
import {
  approvalCommentValidation,
  ApprovalRuleSchema,
  createRequestValidation,
  auditLogQueryValidation,
  delegationValidation,
  createDelegationRuleValidation,
  approvalValidation,
  createApprovalWorkflowValidation,
  getDepartmentApprovalWorkflowValidation,
  getApprovalWorkflowStageValidation,
} from "./approval.validation";

export type CreateApprovalWorkflowDto = z.infer<
  typeof createApprovalWorkflowValidation.body
>;

export type CreateRequestDto = z.infer<typeof createRequestValidation.body>;

export type ApprovalRules = z.infer<typeof ApprovalRuleSchema>;

export type ApprovalComment = z.infer<typeof approvalCommentValidation.body>;
export type Delegation = z.infer<typeof delegationValidation.body>;
export type AuditLogQuery = z.infer<typeof auditLogQueryValidation.query>;

export type CreateDelegationRuleDto = z.infer<
  typeof createDelegationRuleValidation.body
>;

export type approvalDto = z.infer<typeof approvalValidation.body>;

export type GetDepartmentApprovalWorkflowDto = z.infer<
  typeof getDepartmentApprovalWorkflowValidation.params
>;

// Get Approval Workflow Stage
export type GetApprovalWorkflowStageDto = z.infer<
  typeof getApprovalWorkflowStageValidation.params
>;
