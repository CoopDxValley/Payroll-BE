import { z } from "zod";

import { ApprovalStageStatus, RequestType } from "@prisma/client";

// Common types
export const UUID = z.string().uuid("Invalid user ID");

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

const StageSchema = z.object({
  isParallel: z.boolean(),
  order: z.number().int(),
  approvalRules: ApprovalRuleSchema,
  employeeIds: z.array(UUID),
});

export const createApprovalWorkflowValidation = {
  body: z.object({
    name: z.string(),
    departmentId: z.string().uuid("Invalid department ID").optional(),
    requestType: requestTypeEnum,
    isFullyParallel: z.boolean(),
    stages: z.array(StageSchema),
  }),
};

export const createRequestValidation = {
  body: z.object({
    requestType: requestTypeEnum,
    moduleId: UUID,
  }),
};

export const createDelegationRuleValidation = {
  body: z.object({
    requestType: requestTypeEnum,
    fromEmployeeId: UUID,
    toEmployeeId: UUID,
  }),
};

export const approvalCommentValidation = {
  body: z.object({
    instanceId: UUID,
    comment: z.string().min(1),
  }),
};

export const approvalValidation = {
  body: z.object({
    instanceId: UUID,
    action: z.enum([
      ApprovalStageStatus.APPROVED,
      ApprovalStageStatus.REJECTED,
    ]),
    comment: z.string().optional(),
    stageId: UUID,
  }),
};

export const delegationValidation = {
  body: z.object({
    stageStatusId: UUID,
    toEmployeeId: UUID,
    reason: z.string().optional(),
  }),
};

export const auditLogQueryValidation = {
  query: z.object({
    instanceId: UUID,
  }),
};

export const resubmitApprovalValidation = {
  body: z.object({
    reason: z.string().optional(),
  }),
  params: z.object({
    instanceId: UUID,
  }),
};
