import { ApprovalStageStatus, RequestType } from "@prisma/client";
import { string, z } from "zod";

// Common types
const UUID = z.string().uuid("Invalid user ID");

// RequestType

const requestTypeEnum = z.enum([
  RequestType.ATTENDANCE,
  RequestType.EXPENSE,
  RequestType.PAYROLL,
  RequestType.PROGRAM,
]);

// Approval Rules
const AllOrAnyNRuleSchema = z.object({
  type: z.enum(["all", "anyN"]),
  required: z.number().int().min(1),
});

const WeightedRuleSchema = z.object({
  type: z.literal("weighted"),
  threshold: z.number().int().min(1),
  weights: z.record(z.string(), z.number().int().min(1)), // key = user name, value = weight
});

// Discriminated union of approvalRules
export const ApprovalRuleSchema = z.discriminatedUnion("type", [
  AllOrAnyNRuleSchema,
  WeightedRuleSchema,
]);

// --- New for like Workflow ---

// Role-based stage assignment
export const StageRoleSchema = z.object({
  roleId: z.string().uuid(),
});

const StageSchema = z.object({
  isParallel: z.boolean(),
  order: z.number().int(),
  approvalRules: ApprovalRuleSchema,
  employeeIds: z.array(UUID),
});

//

// Full request schema
export const createApprovalWorkflowSchema = z.object({
  name: z.string(),
  departmentId: z.string().uuid("Invalid department ID").optional(),
  requestType: requestTypeEnum,
  isFullyParallel: z.boolean(),
  stages: z.array(StageSchema),
  // employeeIds: z.array(UUID),
});

// Approval request creation schema (unchanged)
export const createRequestSchema = z.object({
  requestType: requestTypeEnum,
  moduleId: UUID,
});

// Delegation rule schema
export const DelegationRuleSchema = z.object({
  requestType: requestTypeEnum,
  fromEmployeeId: UUID,
  toEmployeeId: UUID,
});

// approval schema
export const approvalSchema = z.object({
  instanceId: UUID,
  action: z.enum([ApprovalStageStatus.APPROVED, ApprovalStageStatus.REJECTED]),
  comment: z.string().optional(),
  stageId: UUID,
});

// Comment action
export const ApprovalCommentSchema = z.object({
  instanceId: z.string().uuid(),
  comment: z.string().min(1),
});

// Delegation action
export const DelegationSchema = z.object({
  stageStatusId: z.string().uuid(),
  toEmployeeId: z.string().uuid(),
  reason: z.string().optional(),
});

// Escalation action
export const EscalationSchema = z.object({
  stageStatusId: z.string().uuid(),
  escalatedToId: z.string().uuid(),
  reason: z.string().optional(),
});

// Audit log query
export const AuditLogQuerySchema = z.object({
  instanceId: z.string().uuid(),
});
