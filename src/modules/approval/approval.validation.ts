import {
  createApprovalWorkflowSchema,
  createRequestSchema,
} from "../../dto/approval.dto";

export const createApprovalWorkflowValidation = {
  body: createApprovalWorkflowSchema,
};

export const createRequestValidation = {
  body: createRequestSchema,
};
