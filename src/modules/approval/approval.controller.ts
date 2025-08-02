import httpStatus from "http-status";
import * as workflowService from "./approval.service";
import {
  approvalDto,
  CreateApprovalWorkflowDto,
  CreateRequestDto,
} from "./approval.type";
import { AuthEmployee } from "../auth/auth.type";
import catchAsync from "../../utils/catch-async";
import { resubmitApprovalInstance } from "./approval.service";

export const createWorkflow = catchAsync(async (req, res) => {
  const input: CreateApprovalWorkflowDto = req.body;
  const authEmployee = req.employee as AuthEmployee;

  const workflow = await workflowService.createWorkflow({
    ...input,
    companyId: authEmployee.companyId,
  });

  res
    .status(httpStatus.CREATED)
    .send({ message: "Workflow created", data: workflow });
});

export const createRequest = catchAsync(async (req, res) => {
  const input: CreateRequestDto = req.body;
  const authEmployee = req.employee as AuthEmployee;

  const request = await workflowService.createRequest({
    ...input,
    requestedBy: authEmployee.id,
    companyId: authEmployee.companyId,
  });
  res
    .status(httpStatus.CREATED)
    .send({ message: "Request created", data: request });
});

export const createDelegationRule = catchAsync(async (req, res) => {
  const input = req.body;
  const authEmployee = req.employee as AuthEmployee;

  const delegationRule = await workflowService.createDelegationRule({
    ...input,
    companyId: authEmployee.companyId,
    createdBy: authEmployee.id,
  });

  res
    .status(httpStatus.CREATED)
    .send({ message: "Delegation rule created", data: delegationRule });
});

export const action = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;

  const { instanceId, action, comment, stageId }: approvalDto = req.body;
  const result = await workflowService.handleApproval({
    instanceId,
    action,
    comment,
    employeeId: authEmployee.id,
    stageId,
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

export const resubmit = catchAsync(async (req, res) => {
  const { instanceId } = req.params;
  const user = req.user as AuthEmployee;
  const { reason } = req.body;
  const newInstance = await resubmitApprovalInstance({
    instanceId,
    requestorId: user.id,
    reason,
  });
  res
    .status(httpStatus.CREATED)
    .send({ message: "Request resubmitted", data: newInstance });
});
