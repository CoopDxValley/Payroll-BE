import httpStatus from "http-status";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import {
  ApprovalRules,
  CreateApprovalWorkflowDto,
  CreateDelegationRuleDto,
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
 * create an approval request
 * @param {Object} data - request creation input
 */

export const createRequest = async (
  data: CreateRequestDto & { requestedBy: string; companyId: string }
) => {
  const { requestType, moduleId, requestedBy, companyId } = data;

  const [workflow, existingRequest] = await Promise.all([
    prisma.approvalWorkflow.findFirst({
      where: {
        requestType,
        companyId,
        company: { employees: { some: { id: requestedBy } } },
      },
      select: {
        id: true,
        isFullyParallel: true,
        stages: {
          select: {
            id: true,
            order: true,
            stageEmployees: { select: { employeeId: true } },
          },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.request.findFirst({
      where: { type: requestType, requestedBy, moduleId },
      select: { id: true }, // Minimal fields
    }),
  ]);

  if (!workflow) {
    throw new ApiError(httpStatus.NOT_FOUND, "No approval workflow found.");
  }

  if (workflow.stages.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Workflow has no stages.");
  }

  if (existingRequest) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "A request of this type already exists for this user"
    );
  }

  if (workflow.isFullyParallel && workflow.stages.length > 1) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Fully parallel workflows must have exactly one stage"
    );
  }

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.create({
      data: { type: requestType, requestedBy, moduleId },
      select: { id: true },
    });

    const firstStage = workflow.stages[0];
    if (!firstStage.stageEmployees.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "First stage has no assigned employees"
      );
    }

    const stageStatuses: {
      stageId: string;
      approvedBy: string;
      status: ApprovalStageStatus;
    }[] = firstStage.stageEmployees.map((emp) => ({
      stageId: firstStage.id,
      approvedBy: emp.employeeId,
      status: ApprovalStageStatus.PENDING,
    }));

    const instance = await tx.approvalInstance.create({
      data: {
        requestId: request.id,
        workflowId: workflow.id,
        activeStageIds: [firstStage.id],
        status: ApprovalStatus.PENDING,
        version: 1,
      },
      select: { id: true },
    });

    const allApproverIds = Array.from(
      new Set(stageStatuses.map((s) => s.approvedBy))
    );
    const delegationRules = await tx.delegationRule.findMany({
      where: {
        requestType,
        fromEmployeeId: { in: allApproverIds },
      },
      select: { fromEmployeeId: true, toEmployeeId: true },
    });

    const delegationMap = new Map(
      delegationRules.map((rule) => [rule.fromEmployeeId, rule.toEmployeeId])
    );

    const stageStatusData: {
      instanceId: string;
      stageId: string;
      approvedBy: string;
      status: ApprovalStageStatus;
    }[] = [];

    const notifications: {
      instanceId: string;
      recipientId: string;
      message: string;
    }[] = [];

    const auditLog: {
      instanceId: string;
      action: string;
      performedBy: string;
      details: string;
    }[] = [];

    for (const stage of stageStatuses) {
      const delegatedTo = delegationMap.get(stage.approvedBy);
      if (delegatedTo) {
        stageStatusData.push(
          {
            instanceId: instance.id,
            stageId: stage.stageId,
            approvedBy: stage.approvedBy,
            status: ApprovalStageStatus.DELEGATED,
          },
          {
            instanceId: instance.id,
            stageId: stage.stageId,
            approvedBy: delegatedTo,
            status: ApprovalStageStatus.PENDING,
          }
        );
        notifications.push({
          instanceId: instance.id,
          recipientId: delegatedTo,
          message: `Approval automatically delegated to you for ${requestType}`,
        });

        auditLog.push({
          instanceId: instance.id,
          action: "delegate",
          performedBy: stage.approvedBy,
          details: `Delegated to ${delegatedTo}`,
        });
      } else {
        stageStatusData.push({
          instanceId: instance.id,
          stageId: stage.stageId,
          approvedBy: stage.approvedBy,
          status: ApprovalStageStatus.PENDING,
        });
      }
    }

    await tx.stageStatus.createMany({ data: stageStatusData });

    // TODO: Implement actual queuing logic. Queue notifications to a background worker
    if (notifications.length > 0) {
      await tx.approvalNotification.createMany({ data: notifications });
    }
    if (auditLog.length > 0) {
      await tx.approvalAuditLog.createMany({ data: auditLog });
    }

    return { request, instance };
  });
};

export const createDelegationRule = async (
  data: CreateDelegationRuleDto & { companyId: string }
) => {
  const employee = await prisma.employee.findMany({
    where: {
      id: { in: [data.fromEmployeeId, data.toEmployeeId] },
    },
  });

  if (employee.length !== 2) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Both fromEmployeeId and toEmployeeId must be valid employees"
    );
  }

  const existingRule = await prisma.delegationRule.findFirst({
    where: {
      requestType: data.requestType,
      fromEmployeeId: data.fromEmployeeId,
      toEmployeeId: data.toEmployeeId,
    },
  });

  if (existingRule) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Delegation rule already exists for this pair of employees"
    );
  }

  return prisma.$transaction(async (tx) => {
    const rule = await tx.delegationRule.create({
      data: {
        requestType: data.requestType,
        fromEmployeeId: data.fromEmployeeId,
        toEmployeeId: data.toEmployeeId,
      },
    });

    // TODO: create a notification for the delegation rule
    await tx.approvalNotification.create({
      data: {
        instanceId: "",
        recipientId: data.fromEmployeeId,
        message: `Delegation rule created from you to ${data.toEmployeeId} for ${data.requestType}`,
      },
    });

    return rule;
  });
};

/**
 * Perform an approval action (approve, reject, delegate, escalate, comment)
 */
export const performApprovalAction = async ({
  instanceId,
  action,
  userId,
  comment,
  delegateToId,
  escalateToId,
}: {
  instanceId: string;
  action: string;
  userId: string;
  comment?: string;
  delegateToId?: string;
  escalateToId?: string;
}) => {
  // Fetch instance, workflow, current state, user roles
  const instance = await prisma.approvalInstance.findUnique({
    where: { id: instanceId },
    include: {
      workflow: {
        include: {
          WorkflowState: { include: { transitions: true } },
          stages: { include: { StageRole: true } },
        },
      },
      stageStatuses: true,
    },
  });
  if (!instance) throw new ApiError(404, "Approval instance not found");

  // Find current state (lowest order among active stages)
  const workflowStates = instance.workflow.WorkflowState;
  const currentState = workflowStates.reduce(
    (min, s) => (s.order < min.order ? s : min),
    workflowStates[0]
  );
  if (!currentState) throw new ApiError(400, "No current state found");

  // Get user roles
  const user = await prisma.employee.findUnique({
    where: { id: userId },
    include: { employeeRoles: true },
  });
  if (!user) throw new ApiError(404, "User not found");
  const userRoleIds = user.employeeRoles.map((er) => er.roleId);

  console.log(currentState);

  // Find allowed transitions for current state
  const allowedTransitions = currentState.transitions.filter(
    (t) =>
      t.allowedRoles.some((roleId) => userRoleIds.includes(roleId)) &&
      t.action === action
  );
  if (
    !allowedTransitions.length &&
    !["delegate", "escalate", "comment"].includes(action)
  ) {
    throw new ApiError(403, "Action not allowed for your role in this state");
  }

  return await prisma.$transaction(async (tx) => {
    // Handle comment
    if (comment) {
      await tx.approvalComment.create({
        data: {
          instanceId,
          authorId: userId,
          comment,
        },
      });
    }

    // Handle delegation
    if (action === "delegate" && delegateToId) {
      // Find the relevant stageStatus for this user
      const stageStatus = instance.stageStatuses.find(
        (ss) => ss.approvedBy === userId && ss.status === "PENDING"
      );
      if (!stageStatus) throw new ApiError(400, "No pending stage to delegate");
      // Mark current user's StageStatus as DELEGATED (workaround: use REJECTED, or add to enum)
      await tx.stageStatus.update({
        where: { id: stageStatus.id },
        // 'DELEGATED' is not in ApprovalStageStatus, so use 'REJECTED' as a workaround
        // To support true delegation status, add 'DELEGATED' to the enum in schema.prisma
        data: { status: "DELEGATED" },
      });
      // Check if delegatee already has a StageStatus for this stage/instance
      const existingDelegateeStatus = instance.stageStatuses.find(
        (ss) =>
          ss.approvedBy === delegateToId && ss.stageId === stageStatus.stageId
      );
      if (!existingDelegateeStatus) {
        await tx.stageStatus.create({
          data: {
            instanceId,
            stageId: stageStatus.stageId,
            approvedBy: delegateToId,
            status: "PENDING",
          },
        });
      }
      await tx.delegation.create({
        data: {
          stageStatusId: stageStatus.id,
          fromEmployeeId: userId,
          toEmployeeId: delegateToId,
        },
      });
      await tx.approvalNotification.create({
        data: {
          instanceId,
          recipientId: delegateToId,
          message: `Approval delegated to you by ${user.name}`,
        },
      });
      await tx.approvalAuditLog.create({
        data: {
          instanceId,
          action: "delegate",
          performedBy: userId,
          details: `Delegated to ${delegateToId}`,
        },
      });
      // Return updated instance details
      const updatedInstance = await tx.approvalInstance.findUnique({
        where: { id: instanceId },
        include: {
          workflow: {
            include: {
              WorkflowState: { include: { transitions: true } },
              stages: { include: { StageRole: true } },
            },
          },
          stageStatuses: true,
          ApprovalComment: true,
          ApprovalNotification: true,
          ApprovalAuditLog: true,
        },
      });
      return { delegated: true, instance: updatedInstance };
    }

    // Handle escalation
    if (action === "escalate" && escalateToId) {
      // Find the relevant stageStatus for this user
      const stageStatus = instance.stageStatuses.find(
        (ss) => ss.approvedBy === userId && ss.status === "PENDING"
      );
      if (!stageStatus) throw new ApiError(400, "No pending stage to escalate");
      await tx.escalation.create({
        data: {
          stageStatusId: stageStatus.id,
          escalatedToId: escalateToId,
        },
      });
      await tx.approvalNotification.create({
        data: {
          instanceId,
          recipientId: escalateToId,
          message: `Approval escalated to you by ${user.name}`,
        },
      });
      await tx.approvalAuditLog.create({
        data: {
          instanceId,
          action: "escalate",
          performedBy: userId,
          details: `Escalated to ${escalateToId}`,
        },
      });
      return { escalated: true };
    }

    // Handle approval/rejection (state transition)
    if (allowedTransitions.length) {
      const transition = allowedTransitions[0];
      // Update instance state (simulate state machine)
      // Mark current user's stageStatus as approved/rejected
      const stageStatus = instance.stageStatuses.find(
        (ss) => ss.approvedBy === userId && ss.status === "PENDING"
      );
      if (!stageStatus) throw new ApiError(400, "No pending stage to act on");
      await tx.stageStatus.update({
        where: { id: stageStatus.id },
        data: {
          status: action.toUpperCase() as ApprovalStageStatus,
          approvedAt: new Date(),
        },
      });
      // Move to next state if needed
      await tx.approvalInstance.update({
        where: { id: instanceId },
        data: {
          // For simplicity, just update status; in a real system, update activeStageIds, etc.
          status: transition.action === "approve" ? "APPROVED" : "REJECTED",
        },
      });
      await tx.approvalAuditLog.create({
        data: {
          instanceId,
          action,
          performedBy: userId,
          details: `Transitioned to state ${transition.toStateId}`,
        },
      });
      // Notify next approvers if any (not implemented in detail here)
      return { transitioned: true };
    }

    // If only comment, just return
    if (action === "comment") {
      await tx.approvalAuditLog.create({
        data: {
          instanceId,
          action: "comment",
          performedBy: userId,
          details: comment,
        },
      });
      return { commented: true };
    }

    throw new ApiError(400, "Unhandled action");
  });
};

export const getAuditLog = async (instanceId: string) => {
  return prisma.approvalAuditLog.findMany({
    where: { instanceId },
    orderBy: { createdAt: "asc" },
  });
};

export const getInstanceDetails = async (id: string) => {
  return prisma.approvalInstance.findUnique({
    where: { id },
    include: {
      workflow: {
        include: {
          WorkflowState: { include: { transitions: true } },
          stages: { include: { StageRole: true } },
        },
      },
      stageStatuses: {
        include: {
          Delegation: true,
          Escalation: true,
        },
      },
      ApprovalComment: true,
      ApprovalNotification: true,
      ApprovalAuditLog: true,
    },
  });
};
