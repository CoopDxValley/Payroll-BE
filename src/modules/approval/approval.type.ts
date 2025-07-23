import { z } from "zod";
import {
  ApprovalRuleSchema,
  createApprovalWorkflowSchema,
  createRequestSchema,
  ApprovalCommentSchema,
  DelegationSchema,
  EscalationSchema,
  AuditLogQuerySchema,
  DelegationRuleSchema,
  approvalSchema,
} from "../../dto/approval.dto";

export type CreateApprovalWorkflowDto = z.infer<
  typeof createApprovalWorkflowSchema
>;

export type CreateRequestDto = z.infer<typeof createRequestSchema>;

export type ApprovalRules = z.infer<typeof ApprovalRuleSchema>;

export type ApprovalComment = z.infer<typeof ApprovalCommentSchema>;
export type Delegation = z.infer<typeof DelegationSchema>;
export type Escalation = z.infer<typeof EscalationSchema>;
export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;

export type CreateDelegationRuleDto = z.infer<typeof DelegationRuleSchema>;

export type approvalDto = z.infer<typeof approvalSchema>;
