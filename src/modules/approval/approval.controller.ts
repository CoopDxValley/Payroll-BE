import { Response } from "express";
import httpStatus from "http-status";
import * as workflowService from "./approval.service";
import {
  approvalDto,
  AuditLogQuery,
  CreateApprovalWorkflowDto,
  CreateDelegationRuleDto,
  CreateRequestDto,
  GetDepartmentApprovalWorkflowDto,
} from "./approval.type";
import { AuthEmployee } from "../auth/auth.type";
import catchAsync from "../../utils/catch-async";
import { resubmitApprovalInstance } from "./approval.service";
import { CustomRequest } from "../../middlewares/validate";

export const createWorkflow = catchAsync<
  CustomRequest<never, never, CreateApprovalWorkflowDto>
>(
  async (
    req: CustomRequest<never, never, CreateApprovalWorkflowDto>,
    res: Response
  ) => {
    const input = req.body;
    const authEmployee = req.employee as AuthEmployee;

    const workflow = await workflowService.createWorkflow({
      ...input,
      companyId: authEmployee.companyId,
    });

    res
      .status(httpStatus.CREATED)
      .send({ message: "Workflow created", data: workflow });
  }
);

export const createRequest = catchAsync<
  CustomRequest<never, never, CreateRequestDto>
>(async (req: CustomRequest<never, never, CreateRequestDto>, res: Response) => {
  const input = req.body;
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

export const createDelegationRule = catchAsync<
  CustomRequest<never, never, CreateDelegationRuleDto>
>(
  async (
    req: CustomRequest<never, never, CreateDelegationRuleDto>,
    res: Response
  ) => {
    const input = req.body;
    const authEmployee = req.employee as AuthEmployee;

    const delegationRule = await workflowService.createDelegationRule({
      ...input,
      companyId: authEmployee.companyId,
      // createdBy: authEmployee.id,
    });

    res
      .status(httpStatus.CREATED)
      .send({ message: "Delegation rule created", data: delegationRule });
  }
);

export const action = catchAsync<CustomRequest<never, never, approvalDto>>(
  async (req: CustomRequest<never, never, approvalDto>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;

    const { instanceId, action, comment, stageId } = req.body;
    const result = await workflowService.handleApproval({
      instanceId,
      action,
      comment,
      employeeId: authEmployee.id,
      stageId,
    });
    res
      .status(httpStatus.OK)
      .send({ message: "Action performed", data: result });
  }
);

export const getAuditLog = catchAsync<
  CustomRequest<never, AuditLogQuery, never>
>(async (req: CustomRequest<never, AuditLogQuery, never>, res: Response) => {
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
  const user = req.employee as AuthEmployee;
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

export const getApprovalWorkflows = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const workflows = await workflowService.getApprovalWorkflows(
    authEmployee.companyId
  );
  res
    .status(httpStatus.OK)
    .send({ message: "Approval workflows", data: workflows });
});

export const getDepartmentApprovalWorkflow = catchAsync<
  CustomRequest<GetDepartmentApprovalWorkflowDto, never, never>
>(
  async (
    req: CustomRequest<GetDepartmentApprovalWorkflowDto, never, never>,
    res
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const { departmentId } = req.params;
    const workflows = await workflowService.getDepartmentApprovalWorkflow(
      authEmployee.companyId,
      departmentId
    );
    res
      .status(httpStatus.OK)
      .send({ message: "Department Approval workflows", data: workflows });
  }
);
