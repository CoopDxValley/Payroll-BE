import httpStatus from "http-status";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import {
  approvalDto,
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
    companyId,
    departmentId,
  } = data;

  if (!stages.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "At least one stage is required."
    );
  }

  // Check for duplicate stage orders
  const stageOrders = new Set<number>();
  for (const stage of stages) {
    if (stageOrders.has(stage.order)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Duplicate stage order found: ${stage.order}`
      );
    }
    stageOrders.add(stage.order);
  }

  // Validate each stage’s approval rules
  for (const stage of stages) {
    const { approvalRules, employeeIds } = stage;

    if (approvalRules.type === "weighted") {
      const weights = approvalRules.weights;

      if (!weights || Object.keys(weights).length === 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Weighted approval rules must have at least one weight defined."
        );
      }

      if (Object.keys(weights).length < employeeIds.length) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Weighted approval rules must define weights for all employees in the stage."
        );
      }
    } else {
      // For 'all' or 'anyN'
      if (approvalRules.required !== employeeIds.length) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Approval rule 'required' must equal number of employees for 'all' or 'anyN' types."
        );
      }
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const workflow = await tx.approvalWorkflow.create({
        data: {
          name,
          requestType,
          isFullyParallel,
          companyId,
          departmentId,
        },
      });

      // Flatten and deduplicate employee IDs
      const approverIds = Array.from(
        new Set(stages.flatMap((stage) => stage.employeeIds))
      );

      const approvers = await tx.employee.findMany({
        where: { id: { in: approverIds } },
        select: { id: true },
      });

      const validIds = new Set(approvers.map((emp) => emp.id));
      const invalidIds = approverIds.filter((id) => !validIds.has(id));

      if (invalidIds.length > 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Invalid employee ID(s): ${invalidIds.join(", ")}`
        );
      }

      const stageCreates = stages.map((stage) => {
        const stageEmployees = stage.employeeIds.map((employeeId) => {
          const weight =
            stage.approvalRules.type === "weighted"
              ? stage.approvalRules.weights?.[employeeId] ?? null
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
 * Perform an approval action (approve, reject, comment)
 */

export const handleApproval = async (
  data: approvalDto & { employeeId: string }
) => {
  const { instanceId, action, comment, employeeId, stageId } = data;

  // 1. Batch fetch all needed data in a single query
  const instance = await prisma.approvalInstance.findUnique({
    where: { id: instanceId },
    select: {
      id: true,
      activeStageIds: true,
      status: true,
      requestId: true, // <-- add this line
      workflow: {
        select: {
          isFullyParallel: true,
          stages: {
            select: {
              id: true,
              isParallel: true,
              approvalRules: true,
              stageEmployees: { select: { employeeId: true, weight: true } },
              order: true,
            },
            orderBy: { order: "asc" },
          },
        },
      },
      stageStatuses: {
        select: {
          id: true,
          stageId: true,
          approvedBy: true,
          status: true,
          approvedAt: true,
        },
      },
    },
  });

  if (!instance)
    throw new ApiError(httpStatus.BAD_REQUEST, "Approval instance not found");

  // 2. Prepare in-memory maps for fast lookup
  const stageMap = new Map(instance.workflow.stages.map((s) => [s.id, s]));
  const statusMap = new Map(
    instance.stageStatuses.map((ss) => [ss.stageId + ":" + ss.approvedBy, ss])
  );
  const activeStageIds = [...instance.activeStageIds];
  let status: ApprovalStatus = ApprovalStatus.PENDING;

  // 3. Validate stage and user
  const stage = stageMap.get(stageId);
  if (!stage || !activeStageIds.includes(stageId))
    throw new ApiError(httpStatus.BAD_REQUEST, "Stage not found or not active");
  const validUser = stage.stageEmployees.find(
    (sr) => sr.employeeId === employeeId
  );
  if (!validUser) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User is not authorized for this stage"
    );
  }
  const approvalRules = stage.approvalRules as ApprovalRules;

  // 4. Prepare DB writes
  const updates: any[] = [];
  const now = new Date();
  // Update the acting user's stageStatus
  const statusKey = stageId + ":" + employeeId;
  const userStageStatus = statusMap.get(statusKey);
  if (!userStageStatus) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No pending stage status for user"
    );
  }

  // --- REJECTION LOGIC ---
  if (action === ApprovalStageStatus.REJECTED) {
    // 1. Mark the acting user's stageStatus as REJECTED
    updates.push(
      prisma.stageStatus.update({
        where: { id: userStageStatus.id },
        data: { status: ApprovalStageStatus.REJECTED, approvedAt: now },
      })
    );
    // 2. Mark the instance as REJECTED and clear activeStageIds
    updates.push(
      prisma.approvalInstance.update({
        where: { id: instanceId },
        data: {
          status: ApprovalStatus.REJECTED,
          activeStageIds: [],
          updatedAt: now,
        },
      })
    );
    // 3. Add audit log
    updates.push(
      prisma.approvalAuditLog.create({
        data: {
          instanceId,
          action: "rejected",
          performedBy: employeeId,
          details: comment || "Request was rejected",
        },
      })
    );
    // 4. Add notification to requestor (if available)
    // Fetch requestor
    const request = await prisma.request.findUnique({
      where: { id: instance.requestId },
      select: { requestedBy: true },
    });
    if (request) {
      updates.push(
        prisma.approvalNotification.create({
          data: {
            instanceId,
            recipientId: request.requestedBy,
            message: `Your approval request was rejected.`,
          },
        })
      );
    }
    // 5. Add comment if provided
    if (comment) {
      updates.push(
        prisma.approvalComment.create({
          data: {
            instanceId,
            authorId: employeeId,
            comment,
          },
        })
      );
    }
    // 6. Run all DB writes in a single transaction
    await prisma.$transaction(updates);
    return { instanceId, stageId, status: ApprovalStatus.REJECTED };
  }

  // Update the acting user's stageStatus
  updates.push(
    prisma.stageStatus.update({
      where: { id: userStageStatus.id },
      data: { status: action, approvedAt: now },
    })
  );

  // 5. In-memory logic for stage completion
  // Get all approved statuses for this stage
  const approvedStatuses = instance.stageStatuses.filter(
    (ss) => ss.stageId === stageId && ss.status === ApprovalStageStatus.APPROVED
  );
  // If this action is approval, add this one to the count
  if (
    action === ApprovalStageStatus.APPROVED &&
    userStageStatus.status !== ApprovalStageStatus.APPROVED
  ) {
    approvedStatuses.push({
      ...userStageStatus,
      status: ApprovalStageStatus.APPROVED,
    });
  }
  let isStageComplete = false;
  if (approvalRules.type === "anyN") {
    isStageComplete = approvedStatuses.length >= (approvalRules.required || 1);
  } else if (approvalRules.type === "all") {
    isStageComplete = approvedStatuses.length >= stage.stageEmployees.length;
  } else if (approvalRules.type === "weighted" && approvalRules.threshold) {
    const totalWeight = approvedStatuses.reduce(
      (sum, s) =>
        sum +
        (stage.stageEmployees.find((sr) => sr.employeeId === s.approvedBy)
          ?.weight || 0),
      0
    );
    isStageComplete = totalWeight >= approvalRules.threshold;
  }

  // 6. Handle stage completion and next stage activation
  if (isStageComplete) {
    // Remove this stage from activeStageIds
    const idx = activeStageIds.indexOf(stageId);
    if (idx !== -1) activeStageIds.splice(idx, 1);
    // If not fully parallel, activate next stage if exists
    if (!instance.workflow.isFullyParallel) {
      const currentStageIndex = instance.workflow.stages.findIndex(
        (s) => s.id === stageId
      );
      const nextStage = instance.workflow.stages[currentStageIndex + 1];
      if (nextStage) {
        activeStageIds.push(nextStage.id);
        const nextStageApprovalRules = nextStage.approvalRules as ApprovalRules;
        // Create stageStatus for next stage's employees
        if (
          nextStage.isParallel ||
          nextStageApprovalRules.type === "anyN" ||
          nextStageApprovalRules.type === "all"
        ) {
          updates.push(
            prisma.stageStatus.createMany({
              data: nextStage.stageEmployees.map((sr) => ({
                instanceId,
                stageId: nextStage.id,
                approvedBy: sr.employeeId,
                status: ApprovalStageStatus.PENDING,
              })),
            })
          );
        } else {
          const nextRole = nextStage.stageEmployees[0];
          updates.push(
            prisma.stageStatus.create({
              data: {
                instanceId,
                stageId: nextStage.id,
                approvedBy: nextRole?.employeeId || null,
                status: ApprovalStageStatus.PENDING,
              },
            })
          );
        }
      } else {
        status = ApprovalStatus.APPROVED;
      }
    } else {
      // Fully parallel: if all activeStageIds are done, approve instance
      if (activeStageIds.length === 0) {
        status = ApprovalStatus.APPROVED;
      }
    }
  }

  // 7. Update instance
  updates.push(
    prisma.approvalInstance.update({
      where: { id: instanceId },
      data: { activeStageIds, status, updatedAt: now },
    })
  );

  // 8. Add comment if provided
  if (comment) {
    updates.push(
      prisma.approvalComment.create({
        data: {
          instanceId,
          authorId: employeeId,
          comment,
        },
      })
    );
  }

  // 9. Run all DB writes in a single transaction
  await prisma.$transaction(updates);

  return { instanceId, stageId, status: action };
};

/**
 * Resubmit (appeal) a rejected approval instance
 * @param {Object} params - { instanceId, requestorId, reason }
 */
export const resubmitApprovalInstance = async ({
  instanceId,
  requestorId,
  reason,
}: {
  instanceId: string;
  requestorId: string;
  reason?: string;
}) => {
  // 1. Fetch the original instance and request
  const originalInstance = await prisma.approvalInstance.findUnique({
    where: { id: instanceId },
    include: {
      workflow: {
        include: {
          stages: {
            include: { stageEmployees: true },
            orderBy: { order: "asc" },
          },
        },
      },
      request: true,
    },
  });
  if (!originalInstance)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Original approval instance not found"
    );
  if (originalInstance.status !== ApprovalStatus.REJECTED)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only rejected requests can be resubmitted"
    );
  if (originalInstance.request.requestedBy !== requestorId)
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only the original requestor can resubmit"
    );

  // 2. Prepare new instance data
  const firstStage = originalInstance.workflow.stages[0];
  if (!firstStage)
    throw new ApiError(httpStatus.BAD_REQUEST, "Workflow has no stages");
  const stageStatuses = firstStage.stageEmployees.map((emp) => ({
    stageId: firstStage.id,
    approvedBy: emp.employeeId,
    status: ApprovalStageStatus.PENDING,
  }));

  // 3. Create new instance, stage statuses, audit log, and notifications
  return await prisma.$transaction(async (tx) => {
    const newInstance = await tx.approvalInstance.create({
      data: {
        requestId: originalInstance.requestId,
        workflowId: originalInstance.workflowId,
        activeStageIds: [firstStage.id],
        status: ApprovalStatus.PENDING,
        version: (originalInstance.version || 1) + 1,
        parentInstanceId: originalInstance.id,
        resubmissionReason: reason,
      },
    });
    await tx.stageStatus.createMany({
      data: stageStatuses.map((ss) => ({ ...ss, instanceId: newInstance.id })),
    });
    // Audit log
    await tx.approvalAuditLog.create({
      data: {
        instanceId: newInstance.id,
        action: "resubmitted",
        performedBy: requestorId,
        details: reason || "Request resubmitted",
      },
    });
    // Notify first-stage approvers
    const notifications = [
      ...firstStage.stageEmployees.map((emp) => ({
        instanceId: newInstance.id,
        recipientId: emp.employeeId,
        message: "A resubmitted approval request requires your attention.",
      })),
      {
        instanceId: newInstance.id,
        recipientId: requestorId,
        message: "Your request has been resubmitted.",
      },
    ];
    await tx.approvalNotification.createMany({ data: notifications });
    return newInstance;
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
          // WorkflowState: { include: { transitions: true } },
          stages: { include: { stageEmployees: true } },
        },
      },
      stageStatuses: {
        include: {
          Delegation: true,
          // Escalation: true,
        },
      },
      ApprovalComment: true,
      ApprovalNotification: true,
      ApprovalAuditLog: true,
    },
  });
};
