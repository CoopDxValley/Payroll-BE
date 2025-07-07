import httpStatus from "http-status";
import * as workflowService from "./approval.service";
import { CreateApprovalWorkflowDto, CreateRequestDto } from "./approval.type";
import { AuthEmployee } from "../auth/auth.type";
import catchAsync from "../../utils/catch-async";
import { performApprovalAction } from "./approval.service";

export const createWorkflow = catchAsync(async (req, res) => {
  const input: CreateApprovalWorkflowDto = req.body;
  const user = req.user as AuthEmployee;
  const companyId = "2dfec33d-4bf9-4846-bfce-deef09c08457"; //TODO: delete this line and use user.companyId instead

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
  const companyId = "2dfec33d-4bf9-4846-bfce-deef09c08457"; //TODO: delete this line and use user.companyId instead
  const userId = "0f697815-1863-41f0-afa4-86b1108ae2ad"; //TODO: delete this line and use user.id instead

  const request = await workflowService.createRequest({
    ...input,
    requestedBy: user ? user.id : userId,
    companyId: user ? user.companyId : companyId,
  });
  res
    .status(httpStatus.CREATED)
    .send({ message: "Request created", data: request });
});

export const createDelegationRule = catchAsync(async (req, res) => {
  const input = req.body;
  const user = req.user as AuthEmployee;
  const companyId = "2dfec33d-4bf9-4846-bfce-deef09c08457"; //TODO: delete this line and use user.companyId instead
  const userId = "0f697815-1863-41f0-afa4-86b1108ae2ad"; //TODO: delete this line and use user.id instead
  const delegationRule = await workflowService.createDelegationRule({
    ...input,
    companyId: user ? user.companyId : companyId,
    createdBy: user ? user.id : userId,
  });

  res
    .status(httpStatus.CREATED)
    .send({ message: "Delegation rule created", data: delegationRule });
});

export const action = catchAsync(async (req, res) => {
  const user = req.user as AuthEmployee;
  const userId = "0f697815-1863-41f0-afa4-86b1108ae2ad";
  const { instanceId, action, comment, delegateToId, escalateToId } = req.body;
  const result = await performApprovalAction({
    instanceId,
    action,
    userId, //TODO: change this line to user.id
    comment,
    delegateToId,
    escalateToId,
  });
  res.status(httpStatus.OK).send({ message: "Action performed", data: result });
});

export const getAuditLog = catchAsync(async (req, res) => {
  const { instanceId } = req.query;
  // Fetch audit log for the instance
  const logs = await workflowService.getAuditLog(instanceId as string);
  res.status(httpStatus.OK).send({ message: "Audit log", data: logs });
});

export const getInstanceDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  // Fetch full instance details
  const details = await workflowService.getInstanceDetails(id);
  res
    .status(httpStatus.OK)
    .send({ message: "Instance details", data: details });
});
