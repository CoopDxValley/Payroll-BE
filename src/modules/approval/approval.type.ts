import { z } from "zod";
import {
  ApprovalRuleSchema,
  createApprovalWorkflowSchema,
  createRequestSchema,
} from "../../dto/approval.dto";

export type CreateApprovalWorkflowDto = z.infer<
  typeof createApprovalWorkflowSchema
>;

export type CreateRequestDto = z.infer<typeof createRequestSchema>;

export type ApprovalRules = z.infer<typeof ApprovalRuleSchema>;
