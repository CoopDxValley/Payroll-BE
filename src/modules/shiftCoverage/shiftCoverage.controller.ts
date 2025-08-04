import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import shiftCoverageService from "./shiftCoverage.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";

// Request coverage for a shift
const requestCoverage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const coverage = await shiftCoverageService.requestCoverage({
    ...req.body,
    requestedBy: user.id,
    companyId: user.companyId,
  });

  res.status(httpStatus.CREATED).send({
    message: "Coverage request created successfully",
    data: coverage,
  });
});

// Approve/reject coverage request
const updateCoverageStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const coverage = await shiftCoverageService.updateCoverageStatus(
    id,
    status,
    reason,
    user.id,
    user.companyId
  );

  res.send({
    message: `Coverage request ${status.toLowerCase()} successfully`,
    data: coverage,
  });
});

// Get all coverage requests (with filters)
const getAllCoverageRequests = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthEmployee;
    const { status, employeeId, coverageDate, reason } = req.query;

    if (!user.companyId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
    }

    const coverageRequests = await shiftCoverageService.getAllCoverageRequests(
      user.companyId,
      {
        status: status as string,
        employeeId: employeeId as string,
        coverageDate: coverageDate as string,
        reason: reason as string,
      }
    );

    res.send({
      data: coverageRequests,
      count: coverageRequests.length,
    });
  }
);

// Get coverage request by ID
const getCoverageRequestById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const coverage = await shiftCoverageService.getCoverageRequestById(id);

    if (!coverage) {
      throw new ApiError(httpStatus.NOT_FOUND, "Coverage request not found");
    }

    res.send({ data: coverage });
  }
);

// Get coverage requests for specific employee
const getEmployeeCoverageRequests = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthEmployee;
    const { employeeId } = req.params;
    const { status } = req.query;

    if (!user.companyId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
    }

    const coverageRequests =
      await shiftCoverageService.getEmployeeCoverageRequests(
        employeeId,
        user.companyId,
        status as string
      );

    res.send({
      data: coverageRequests,
      count: coverageRequests.length,
    });
  }
);

// // Get pending coverage requests for approval
// const getPendingCoverageRequests = catchAsync(async (req: Request, res: Response) => {
//   const user = req.user as AuthEmployee;

//   if (!user.companyId) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
//   }

//   const pendingRequests = await shiftCoverageService.getPendingCoverageRequests(
//     user.companyId
//   );

//   res.send({
//     data: pendingRequests,
//     count: pendingRequests.length
//   });
// });

const getCoverageRequests = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const { status } = req.query;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const validStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

  if (status && !validStatuses.includes((status as string).toUpperCase())) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const result = await shiftCoverageService.getCoverageRequests({
    companyId: user.companyId,
    status: (status as string)?.toUpperCase(),
  });

  res.send({
    data: result,
    count: result.length,
  });
});

// const getCoverageRequests = catchAsync(async (req: Request, res: Response) => {
//   const user = req.user as AuthEmployee;
//   const { status } = req.query;

//   if (!user.companyId) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
//   }

//   const result = await shiftCoverageService.getCoverageRequests({
//     companyId: user.companyId,
//     status: status as string | undefined,
//   });

//   res.send({
//     data: result,
//     count: result.length,
//   });
// });

// Cancel coverage request
const cancelCoverageRequest = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthEmployee;
    const { id } = req.params;

    if (!user.companyId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
    }

    const result = await shiftCoverageService.cancelCoverageRequest(
      id,
      user.id,
      user.companyId
    );

    res.send({
      message: "Coverage request cancelled successfully",
      data: result,
    });
  }
);

export default {
  requestCoverage,
  updateCoverageStatus,
  getAllCoverageRequests,
  getCoverageRequestById,
  getEmployeeCoverageRequests,
  // getPendingCoverageRequests,
  cancelCoverageRequest,
  getCoverageRequests,
};
