// import { createWorkflow } from "./approval.service";
// import { CreateApprovalWorkflowDto } from "./approval.type";
// import prisma from "../../client";
// import ApiError from "../../utils/api-error";
// import { resubmitApprovalInstance } from "./approval.service";
// import { ApprovalStatus } from "@prisma/client";

// // // Mock Prisma transaction
// jest.mock("../../client", () => ({
//   __esModule: true,
//   default: {
//     $transaction: jest.fn(),
//     approvalWorkflow: { create: jest.fn() },
//     approvalStage: { create: jest.fn() },
//     employee: { findMany: jest.fn() },
//   },
// }));

// describe("createWorkflow", () => {
//   const baseData: CreateApprovalWorkflowDto & { companyId: string } = {
//     name: "Test Workflow",
//     requestType: "ATTENDANCE",
//     isFullyParallel: false,
//     stages: [
//       { order: 1, isParallel: false, approvalRules: null },
//       { order: 2, isParallel: true, approvalRules: null },
//     ],
//     employeeIds: ["emp1", "emp2"],
//     companyId: "company-1",
//     departmentId: "dept-1",
//   };

//   const mockEmployees = [
//     { id: "emp1", name: "Alice", employeeRoles: [] },
//     { id: "emp2", name: "Bob", employeeRoles: [] },
//   ];

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should create workflow and stages successfully", async () => {
//     (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
//       prisma.employee.findMany.mockResolvedValue(mockEmployees);
//       prisma.approvalWorkflow.create.mockResolvedValue({ id: "workflow-1" });
//       prisma.approvalStage.create.mockResolvedValue({});

//       return callback(prisma);
//     });

//     const result = await createWorkflow(baseData);
//     expect(result).toEqual({ id: "workflow-1" });
//     expect(prisma.approvalWorkflow.create).toHaveBeenCalled();
//     expect(prisma.approvalStage.create).toHaveBeenCalledTimes(2);
//   });

//   it("should throw error for duplicate stage order", async () => {
//     const duplicateStageData = {
//       ...baseData,
//       stages: [
//         { order: 1, isParallel: false, approvalRules: null },
//         { order: 1, isParallel: true, approvalRules: null },
//       ],
//     };

//     await expect(createWorkflow(duplicateStageData)).rejects.toThrow(ApiError);
//   });

//   it("should throw error if some employees are not found", async () => {
//     (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
//       prisma.employee.findMany.mockResolvedValue([mockEmployees[0]]);
//       prisma.approvalWorkflow.create.mockResolvedValue({ id: "workflow-1" });
//       return callback(prisma);
//     });

//     await expect(createWorkflow(baseData)).rejects.toThrow(ApiError);
//   });

//   it("should rollback on internal error", async () => {
//     (prisma.$transaction as jest.Mock).mockImplementation(async () => {
//       throw new Error("DB failure");
//     });

//     await expect(createWorkflow(baseData)).rejects.toThrow("DB failure");
//   });
// });

// describe("resubmitApprovalInstance", () => {
//   const instanceId = "instance-1";
//   const requestorId = "user-1";
//   const reason = "Appealing the decision";
//   const originalInstance = {
//     id: instanceId,
//     requestId: "req-1",
//     workflowId: "wf-1",
//     status: ApprovalStatus.REJECTED,
//     version: 1,
//     workflow: {
//       stages: [
//         {
//           id: "stage-1",
//           stageEmployees: [{ employeeId: "approver-1" }],
//         },
//       ],
//     },
//     request: { requestedBy: requestorId },
//   };
//   const newInstance = { id: "instance-2" };
//   const tx = {
//     approvalInstance: { create: jest.fn().mockResolvedValue(newInstance) },
//     stageStatus: { createMany: jest.fn() },
//     approvalAuditLog: { create: jest.fn() },
//     approvalNotification: { createMany: jest.fn() },
//   };
//   beforeEach(() => {
//     jest.clearAllMocks();
//     (prisma.approvalInstance.findUnique as jest.Mock).mockResolvedValue(
//       originalInstance
//     );
//     (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(tx));
//   });
//   it("should resubmit a rejected instance and create a new instance", async () => {
//     const result = await resubmitApprovalInstance({
//       instanceId,
//       requestorId,
//       reason,
//     });
//     expect(prisma.approvalInstance.findUnique).toHaveBeenCalledWith({
//       where: { id: instanceId },
//       include: expect.any(Object),
//     });
//     expect(tx.approvalInstance.create).toHaveBeenCalledWith(
//       expect.objectContaining({
//         data: expect.objectContaining({
//           parentInstanceId: instanceId,
//           resubmissionReason: reason,
//         }),
//       })
//     );
//     expect(tx.stageStatus.createMany).toHaveBeenCalled();
//     expect(tx.approvalAuditLog.create).toHaveBeenCalled();
//     expect(tx.approvalNotification.createMany).toHaveBeenCalled();
//     expect(result).toBe(newInstance);
//   });
//   it("should throw if not rejected", async () => {
//     (prisma.approvalInstance.findUnique as jest.Mock).mockResolvedValue({
//       ...originalInstance,
//       status: ApprovalStatus.APPROVED,
//     });
//     await expect(
//       resubmitApprovalInstance({ instanceId, requestorId, reason })
//     ).rejects.toThrow();
//   });
//   it("should throw if not requestor", async () => {
//     (prisma.approvalInstance.findUnique as jest.Mock).mockResolvedValue({
//       ...originalInstance,
//       request: { requestedBy: "other-user" },
//     });
//     await expect(
//       resubmitApprovalInstance({ instanceId, requestorId, reason })
//     ).rejects.toThrow();
//   });
// });
