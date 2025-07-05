import { z } from "zod";
import { createApprovalWorkflowSchema } from "../../dto/approval.dto";

export type CreateApprovalWorkflowDto = z.infer<
  typeof createApprovalWorkflowSchema
>;
