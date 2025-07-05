import { RequestType } from "@prisma/client";
import { z } from "zod";

// Common types
const UUID = z.string().uuid("Invalid user ID");

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
const ApprovalRuleSchema = z.discriminatedUnion("type", [
  AllOrAnyNRuleSchema,
  WeightedRuleSchema,
]);

// Stage schema
const StageSchema = z.object({
  isParallel: z.boolean(),
  order: z.number().int(),
  approvalRules: ApprovalRuleSchema,
});

// Full request schema
export const createApprovalWorkflowSchema = z.object({
  name: z.string(),
  departmentId: z.string().uuid("Invalid department ID").optional(),
  requestType: z
    .enum([
      RequestType.ATTENDANCE,
      RequestType.EXPENSE,
      RequestType.PAYROLL,
      RequestType.PROGRAM,
    ])
    .default(RequestType.ATTENDANCE),
  isFullyParallel: z.boolean(),
  stages: z.array(StageSchema),
  employeeIds: z.array(UUID),
});
