// import { z } from "zod";

// import { ApprovalStageStatus, RequestType } from "@prisma/client";

// // Common types
// export const UUID = z.string().uuid("Invalid user ID");

// // RequestType
// const requestTypeEnum = z.enum([
//   RequestType.ATTENDANCE,
//   RequestType.EXPENSE,
//   RequestType.PAYROLL,
//   RequestType.PROGRAM,
// ]);

// // Approval Rules
// const AllOrAnyNRuleSchema = z.object({
//   type: z.enum(["all", "anyN"]),
//   required: z.number().int().min(1),
// });

// const WeightedRuleSchema = z.object({
//   type: z.literal("weighted"),
//   threshold: z.number().int().min(1),
//   weights: z.record(z.string(), z.number().int().min(1)), // key = user name, value = weight
// });

// // Discriminated union of approvalRules
// export const ApprovalRuleSchema = z.discriminatedUnion("type", [
//   AllOrAnyNRuleSchema,
//   WeightedRuleSchema,
// ]);

// const StageSchema = z.object({
//   isParallel: z.boolean(),
//   order: z.number().int(),
//   approvalRules: ApprovalRuleSchema,
//   employeeIds: z.array(UUID),
// });

// export const createApprovalWorkflowValidation = {
//   body: z.object({
//     name: z.string(),
//     departmentId: z.string().uuid("Invalid department ID").optional(),
//     requestType: requestTypeEnum,
//     isFullyParallel: z.boolean(),
//     stages: z.array(StageSchema),
//   }),
// };

// export const createRequestValidation = {
//   body: z.object({
//     requestType: requestTypeEnum,
//     moduleId: UUID,
//   }),
// };

// export const createDelegationRuleValidation = {
//   body: z.object({
//     requestType: requestTypeEnum,
//     fromEmployeeId: UUID,
//     toEmployeeId: UUID,
//   }),
// };

// export const approvalCommentValidation = {
//   body: z.object({
//     instanceId: UUID,
//     comment: z.string().min(1),
//   }),
// };

// export const approvalValidation = {
//   body: z.object({
//     instanceId: UUID,
//     action: z.enum([
//       ApprovalStageStatus.APPROVED,
//       ApprovalStageStatus.REJECTED,
//     ]),
//     comment: z.string().optional(),
//     stageId: UUID,
//   }),
// };

// export const delegationValidation = {
//   body: z.object({
//     stageStatusId: UUID,
//     toEmployeeId: UUID,
//     reason: z.string().optional(),
//   }),
// };

// export const auditLogQueryValidation = {
//   query: z.object({
//     instanceId: UUID,
//   }),
// };

// export const resubmitApprovalValidation = {
//   body: z.object({
//     reason: z.string().optional(),
//   }),
//   params: z.object({
//     instanceId: UUID,
//   }),
// };

import { z } from "zod";

import { ApprovalStageStatus, RequestType } from "@prisma/client";
import {
  safeName,
  safeNameRegex,
  safeOptionalText,
  safeText,
  unique,
  UUID,
} from "../../validations/security";

// export const UUID = z.string().uuid("Invalid user ID");

// const safeNameRegex = /^[a-zA-Z0-9 .,_-]+$/;
// const safeName = z
//   .string()
//   .trim()
//   .min(1, "Name is required")
//   .max(100, "Name too long")
//   .regex(safeNameRegex, "Invalid characters");

// const stripControlChars = (s: string) =>
//   s.replace(/[\u0000-\u001F\u007F]/g, " "); // remove control chars

// const safeText = z
//   .string()
//   .min(1, "Text is required")
//   .max(1000, "Text too long")
//   .transform((s) => stripControlChars(s.trim()));

// const safeOptionalText = z
//   .string()
//   .max(1000, "Text too long")
//   .transform((s) => stripControlChars(s.trim()))
//   .optional();

// // Utilities
// const unique = <T, K extends keyof any>(arr: T[], by?: (v: T) => K) => {
//   const set = new Set<K>();
//   for (const v of arr) {
//     const k = by ? by(v) : (v as unknown as K);
//     if (set.has(k)) return false;
//     set.add(k);
//   }
//   return true;
// };

// RequestType
const requestTypeEnum = z.enum([
  RequestType.ATTENDANCE,
  RequestType.EXPENSE,
  RequestType.PAYROLL,
  RequestType.PROGRAM,
]);

// Approval Rules
const AllOrAnyNRuleSchema = z
  .object({
    type: z.enum(["all", "anyN"]),
    required: z.number().int().min(1),
  })
  .strict();

const WeightedRuleSchema = z
  .object({
    type: z.literal("weighted"),
    threshold: z.number().int().min(1),
    // key = user name, value = weight
    weights: z.record(z.string(), z.number().int().min(1)),
  })
  .strict()
  .superRefine((val, ctx) => {
    // Validate keys to be "safe names"
    for (const key of Object.keys(val.weights)) {
      if (!safeNameRegex.test(key) || key.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid weight key '${key}'`,
          path: ["weights", key],
        });
      }
    }
    const total = Object.values(val.weights).reduce((a, b) => a + b, 0);
    if (val.threshold > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Threshold cannot exceed total available weight",
        path: ["threshold"],
      });
    }
  });

// Union of approvalRules (cannot use discriminatedUnion due to superRefine on WeightedRuleSchema)
export const ApprovalRuleSchema = z.union([
  AllOrAnyNRuleSchema,
  WeightedRuleSchema,
]);

const StageSchema = z
  .object({
    isParallel: z.boolean(),
    order: z.number().int().min(0),
    approvalRules: ApprovalRuleSchema,
    employeeIds: z
      .array(UUID)
      .nonempty("At least one approver is required")
      .max(100, "Too many approvers"),
  })
  .strict()
  .superRefine((stage, ctx) => {
    // Ensure employeeIds are unique
    if (!unique(stage.employeeIds)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate employee IDs in a stage",
        path: ["employeeIds"],
      });
    }

    // Validate rules vs employee count
    if (stage.approvalRules.type === "all") {
      if (stage.approvalRules.required !== stage.employeeIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "For 'all' type, required must equal number of approvers",
          path: ["approvalRules", "required"],
        });
      }
    }
    if (stage.approvalRules.type === "anyN") {
      if (stage.approvalRules.required > stage.employeeIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required cannot exceed number of approvers",
          path: ["approvalRules", "required"],
        });
      }
    }
  });

export const createApprovalWorkflowValidation = {
  body: z
    .object({
      name: safeName,
      departmentId: z.string().uuid("Invalid department ID").optional(),
      requestType: requestTypeEnum,
      isFullyParallel: z.boolean(),
      stages: z
        .array(StageSchema)
        .nonempty("At least one stage is required")
        .max(50, "Too many stages")
        .superRefine((stages, ctx) => {
          // unique stage order
          if (!unique(stages, (s) => s.order)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Stage order values must be unique",
              path: ["stages"],
            });
          }
        }),
    })
    .strict(),
};

export const createRequestValidation = {
  body: z
    .object({
      requestType: requestTypeEnum,
      moduleId: UUID,
    })
    .strict(),
};

export const createDelegationRuleValidation = {
  body: z
    .object({
      requestType: requestTypeEnum,
      fromEmployeeId: UUID,
      toEmployeeId: UUID,
    })
    .strict(),
};

export const approvalCommentValidation = {
  body: z
    .object({
      instanceId: UUID,
      comment: safeText,
    })
    .strict(),
};

export const approvalValidation = {
  body: z
    .object({
      instanceId: UUID,
      action: z.enum([
        ApprovalStageStatus.APPROVED,
        ApprovalStageStatus.REJECTED,
      ]),
      comment: safeOptionalText,
      stageId: UUID,
    })
    .strict(),
};

export const delegationValidation = {
  body: z
    .object({
      stageStatusId: UUID,
      toEmployeeId: UUID,
      reason: safeOptionalText,
    })
    .strict(),
};

export const auditLogQueryValidation = {
  query: z
    .object({
      instanceId: UUID,
    })
    .strict(),
};

export const resubmitApprovalValidation = {
  body: z
    .object({
      reason: safeOptionalText,
    })
    .strict(),
  params: z
    .object({
      instanceId: UUID,
    })
    .strict(),
};

export const getDepartmentApprovalWorkflowValidation = {
  params: z
    .object({
      departmentId: UUID,
    })
    .strict(),
};

export const getApprovalWorkflowStageValidation = {
  params: z
    .object({
      workflowId: UUID,
    })
    .strict(),
};
