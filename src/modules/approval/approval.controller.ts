import httpStatus from "http-status";
import * as workflowService from "./approval.service";
import { CreateApprovalWorkflowDto, CreateRequestDto } from "./approval.type";
import { AuthEmployee } from "../auth/auth.type";
import catchAsync from "../../utils/catch-async";

export const createWorkflow = catchAsync(async (req, res) => {
  const input: CreateApprovalWorkflowDto = req.body;
  const user = req.user as AuthEmployee;
  const companyId = "3e3e40d8-6fc8-451b-acb3-6d491db3e160"; //TODO: delete this line and use user.companyId instead

  const workflow = await workflowService.createWorkflow({
    ...input,
    companyId: user ? user.companyId : companyId,
  });

  res
    .status(httpStatus.CREATED)
    .send({ message: "Workflow created", data: workflow });
});

export const createRequest = catchAsync(async (req, res) => {
  const input: CreateRequestDto = req.body;
  const user = req.user as AuthEmployee;
  const companyId = "3e3e40d8-6fc8-451b-acb3-6d491db3e160"; //TODO: delete this line and use user.companyId instead
  const userId = "b5ea92f0-ebfd-488c-afc5-5d9b578916d2"; //TODO: delete this line and use user.id instead

  const request = await workflowService.createRequest({
    ...input,
    requestedBy: user ? user.id : userId,
    companyId: user ? user.companyId : companyId,
  });
  res
    .status(httpStatus.CREATED)
    .send({ message: "Request created", data: request });
});
