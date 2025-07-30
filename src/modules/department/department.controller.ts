import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import departmentService from "./department.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";

const createDepartment = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;

  if (!user.companyId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User must be associated with a company to create departments"
    );
  }

  const department = await departmentService.createDepartment({
    ...req.body,
    companyId: user.companyId,
  });

  res
    .status(httpStatus.CREATED)
    .send({ message: "Department created", data: department });
});

const getAllDepartments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;

  // Filter departments by user's company if not admin/super-admin
  const departments = await departmentService.getAllDepartments(user.companyId);

  res.json({
    data: departments,
    count: departments.length,
  });
});

const getDepartmentById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const department = await departmentService.getDepartmentById(id);

  if (!department) {
    res.status(httpStatus.NOT_FOUND).send({ message: "Department not found" });
    return; // return void here to satisfy TS
  }

  res.send({ data: department });
  return; // also return void here
});

const updateDepartment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const department = await departmentService.updateDepartment(id, req.body);
  res.send({ message: "Department updated", data: department });
});

const deleteDepartment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = await departmentService.deleteDepartment(id);
  res
    .status(httpStatus.OK)
    .send({ message: "Department deactivated", data: updated });
});

export default {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  // getDepartmentsByCenter,
};
