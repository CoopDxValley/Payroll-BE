import httpStatus from "http-status";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import {
  ApprovalRules,
  CreateApprovalWorkflowDto,
  CreateRequestDto,
} from "./approval.type";
import { ApprovalStageStatus, ApprovalStatus } from "@prisma/client";

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

// /**
//  * create an approval request
//  * @param {Object} data - request creation input
//  */

// export const createRequest = async (
//   data: CreateRequestDto & { requestedBy: string; companyId: string }
// ) => {
//   const { requestType, moduleId, requestedBy, companyId } = data;
//   const workflow = await prisma.approvalWorkflow.findFirst({
//     where: {
//       requestType,
//       companyId,
//       company: {
//         employees: {
//           some: {
//             id: requestedBy,
//           },
//         },
//       },
//     },
//     include: {
//       stages: { include: { stageEmployees: true }, orderBy: { order: "asc" } },
//     },
//   });

//   const request = await prisma.request.findFirst({
//     where: {
//       type: requestType,
//       requestedBy,
//       moduleId,
//     },
//   });

//   if (!workflow) {
//     throw new ApiError(
//       httpStatus.NOT_FOUND,
//       "No approval workflow found for this request type"
//     );
//   }

//   if (request) {
//     throw new ApiError(
//       httpStatus.NOT_FOUND,
//       "No request found for this type and user"
//     );
//   }

//   return prisma.$transaction(async (tx) => {
//     const request = await tx.request.create({
//       data: { type: requestType, requestedBy, moduleId },
//     });
//     let activeStageIds: string[];
//     let stageStatuses: {
//       instanceId: string;
//       stageId: string;
//       approvedBy: string | null;
//       status: ApprovalStageStatus;
//     }[] = [];

//     if (workflow.isFullyParallel) {
//       activeStageIds = workflow.stages.map((stage) => stage.id);
//       for (const stage of workflow.stages) {
//         const approvalRules = stage.approvalRules as ApprovalRules;
//         if (
//           stage.isParallel ||
//           approvalRules.type === "anyN" ||
//           approvalRules.type === "all"
//         ) {
//           stageStatuses.push(
//             ...stage.stageEmployees.map((sr) => ({
//               instanceId: "",
//               stageId: stage.id,
//               approvedBy: sr.employeeId,
//               status: ApprovalStageStatus.PENDING,
//             }))
//           );
//         } else {
//           stageStatuses.push({
//             instanceId: "",
//             stageId: stage.id,
//             approvedBy: null,
//             status: ApprovalStageStatus.PENDING,
//           });
//         }
//       }
//     } else {
//       const firstStage = workflow.stages[0];
//       const firstStageAprovalRules = firstStage.approvalRules as ApprovalRules;

//       if (!firstStage)
//         throw new ApiError(httpStatus.BAD_REQUEST, "Workflow has no stages");

//       activeStageIds = [firstStage.id];

//       if (
//         firstStage.isParallel ||
//         firstStageAprovalRules?.type === "anyN" ||
//         firstStageAprovalRules?.type === "all"
//       ) {
//         stageStatuses.push(
//           ...firstStage.stageEmployees.map((sr) => ({
//             instanceId: "",
//             stageId: firstStage.id,
//             approvedBy: sr.employeeId,
//             status: ApprovalStageStatus.PENDING,
//           }))
//         );
//       } else {
//         const firstApprover = firstStage.stageEmployees[0];
//         stageStatuses.push({
//           instanceId: "",
//           stageId: firstStage.id,
//           approvedBy: firstApprover.employeeId || null,
//           status: ApprovalStageStatus.PENDING,
//         });
//       }
//     }
//     const instance = await tx.approvalInstance.create({
//       data: {
//         requestId: request.id,
//         workflowId: workflow.id,
//         activeStageIds,
//         status: ApprovalStatus.PENDING,
//         version: 1,
//       },
//     });
//     await tx.stageStatus.createMany({
//       data: stageStatuses.map((ss) => ({ ...ss, instanceId: instance.id })),
//     });
//     return { request, instance };
//   });
// };

/**
 * Create an approval request and workflow instance
 */
export const createRequest = async (
  data: CreateRequestDto & { requestedBy: string; companyId: string }
) => {
  const { requestType, moduleId, requestedBy, companyId } = data;

  // Find workflow with all stages & stage employees
  const workflow = await prisma.approvalWorkflow.findFirst({
    where: {
      requestType,
      companyId,
      company: {
        employees: {
          some: { id: requestedBy },
        },
      },
    },
    include: {
      stages: {
        include: { stageEmployees: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!workflow) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No approval workflow found for this request type"
    );
  }

  // Prevent duplicate request
  const existingRequest = await prisma.request.findFirst({
    where: {
      type: requestType,
      requestedBy,
      moduleId,
    },
  });

  if (existingRequest) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A request of this type already exists for this user"
    );
  }

  return await prisma.$transaction(async (tx) => {
    // Create the request
    const request = await tx.request.create({
      data: { type: requestType, requestedBy, moduleId },
    });

    const stageStatuses: {
      instanceId: string;
      stageId: string;
      approvedBy: string | null;
      status: ApprovalStageStatus;
    }[] = [];

    let activeStageIds: string[] = [];

    if (workflow.isFullyParallel) {
      // All stages are active at once
      for (const stage of workflow.stages) {
        activeStageIds.push(stage.id);

        const approvalRule = stage.approvalRules as ApprovalRules;

        if (stage.isParallel || ["anyN", "all"].includes(approvalRule?.type)) {
          for (const se of stage.stageEmployees) {
            stageStatuses.push({
              instanceId: "",
              stageId: stage.id,
              approvedBy: se.employeeId,
              status: ApprovalStageStatus.PENDING,
            });
          }
        } else {
          stageStatuses.push({
            instanceId: "",
            stageId: stage.id,
            approvedBy: null,
            status: ApprovalStageStatus.PENDING,
          });
        }
      }
    } else {
      // Sequential mode — only first stage is active
      const firstStage = workflow.stages[0];
      if (!firstStage)
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Workflow has no defined stages"
        );

      activeStageIds = [firstStage.id];

      const rule = firstStage.approvalRules as ApprovalRules;

      if (firstStage.isParallel || ["anyN", "all"].includes(rule?.type)) {
        for (const se of firstStage.stageEmployees) {
          stageStatuses.push({
            instanceId: "",
            stageId: firstStage.id,
            approvedBy: se.employeeId,
            status: ApprovalStageStatus.PENDING,
          });
        }
      } else {
        const firstApprover = firstStage.stageEmployees[0];
        if (!firstApprover) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "First stage has no assigned employee"
          );
        }

        stageStatuses.push({
          instanceId: "",
          stageId: firstStage.id,
          approvedBy: firstApprover.employeeId,
          status: ApprovalStageStatus.PENDING,
        });
      }
    }

    // Create approval instance
    const instance = await tx.approvalInstance.create({
      data: {
        requestId: request.id,
        workflowId: workflow.id,
        activeStageIds,
        status: ApprovalStatus.PENDING,
        version: 1,
      },
    });

    // Assign instanceId to stageStatuses
    const stageStatusData = stageStatuses.map((s) => ({
      ...s,
      instanceId: instance.id,
    }));

    await tx.stageStatus.createMany({ data: stageStatusData });

    return { request, instance };
  });
};
