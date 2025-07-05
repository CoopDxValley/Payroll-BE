import httpStatus from "http-status";
import * as workflowService from "./approval.service";
import { CreateApprovalWorkflowDto } from "./approval.type";
import { AuthEmployee } from "../auth/auth.type";
import catchAsync from "../../utils/catch-async";

export const createWorkflow = catchAsync(async (req, res) => {
  const input: CreateApprovalWorkflowDto = req.body;
  const user = req.user as AuthEmployee;
  const companyId = "3e3e40d8-6fc8-451b-acb3-6d491db3e160";

  const workflow = await workflowService.createWorkflow({
    ...input,
    companyId: user ? user.companyId : companyId,
  });

  res
    .status(httpStatus.CREATED)
    .send({ message: "Department created", data: workflow });
});
