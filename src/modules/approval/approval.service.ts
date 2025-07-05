import httpStatus from "http-status";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import { CreateApprovalWorkflowDto } from "./approval.type";

/**
 * Create an approval workflow with stages and approvers
 * @param {Object} data - workflow creation input
 */
export const createWorkflow = async (
  data: CreateApprovalWorkflowDto & { companyId: string }
) => {
  const {
    name,
    requestType,
    isFullyParallel,
    stages,
    employeeIds,
    companyId,
    departmentId,
  } = data;

  if (!stages.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one stage is required."
    );
  }

  if (!employeeIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one employee is required."
    );
  }

  // Validate duplicate stage orders before creating workflow
  const stageOrders = stages.map((s) => s.order);
  const duplicateOrders = stageOrders.filter(
    (order, index) => stageOrders.indexOf(order) !== index
  );
  if (duplicateOrders.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Duplicate stage order(s): ${Array.from(new Set(duplicateOrders)).join(
        ", "
      )}`
    );
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Create workflow
      const workflow = await tx.approvalWorkflow.create({
        data: {
          name,
          requestType,
          isFullyParallel,
          companyId,
          departmentId,
        },
      });

      // Fetch employees and validate
      const approvers = await tx.employee.findMany({
        where: { id: { in: employeeIds } },
        include: { employeeRoles: true },
      });

      if (approvers.length !== employeeIds.length) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "One or more provided employee IDs are invalid."
        );
      }

      const approverMap = new Map(approvers.map((emp) => [emp.id, emp]));

      // Prepare all stage creation data
      const stageCreates = stages.map((stage) => {
        const stageEmployees = employeeIds.map((employeeId) => {
          const user = approverMap.get(employeeId);
          if (!user) {
            throw new Error(`Unexpected: employee ID ${employeeId} not found`);
          }

          const weight =
            stage.approvalRules?.type === "weighted" &&
            stage.approvalRules.weights?.[user.name]
              ? stage.approvalRules.weights[user.name]
              : null;

          return {
            employeeId,
            weight,
          };
        });

        return tx.approvalStage.create({
          data: {
            workflowId: workflow.id,
            isParallel: stage.isParallel,
            order: stage.order,
            approvalRules: stage.approvalRules,
            stageEmployees: {
              create: stageEmployees,
            },
          },
        });
      });

      // Create stages in parallel
      await Promise.all(stageCreates);

      return workflow;
    });
  } catch (err: any) {
    console.error("Error creating approval workflow:", err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      err?.message || "Failed to create approval workflow"
    );
  }
};
