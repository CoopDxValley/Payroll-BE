import {
  createApprovalWorkflowSchema,
  createRequestSchema,
  ApprovalCommentSchema,
  DelegationSchema,
  EscalationSchema,
  AuditLogQuerySchema,
  DelegationRuleSchema,
} from "../../dto/approval.dto";

export const createApprovalWorkflowValidation = {
  body: createApprovalWorkflowSchema,
};

export const createRequestValidation = {
  body: createRequestSchema,
};

export const createDelegationRuleValidation = {
  body: DelegationRuleSchema,
};

export const approvalCommentValidation = {
  body: ApprovalCommentSchema,
};

export const delegationValidation = {
  body: DelegationSchema,
};

export const escalationValidation = {
  body: EscalationSchema,
};

export const auditLogQueryValidation = {
  query: AuditLogQuerySchema,
};
