import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import departmentService from "./department.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";
import { CustomRequest } from "../../middlewares/validate";
import {
  createDepartmentInput,
  getDepartmentByIdParams,
  updateDepartmentBody,
  updateDepartmentParams,
} from "./department.type";

const createDepartment = catchAsync<
  CustomRequest<never, never, createDepartmentInput>
>(
  async (
    req: CustomRequest<never, never, createDepartmentInput>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const inputData: createDepartmentInput & { companyId: string } = {
      ...req.body,
      companyId: authEmployee.companyId,
    };

    if (!authEmployee.companyId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "employee must be associated with a company to create departments"
      );
    }

    const department = await departmentService.createDepartment(inputData);

    res
      .status(httpStatus.CREATED)
      .send({ message: "Department created", data: department });
  }
);

const getAllDepartments = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;

  // Filter departments by user's company if not admin/super-admin
  const departments = await departmentService.getAllDepartments(user.companyId);

  res.json({
    data: departments,
    count: departments.length,
  });
});

const getDepartmentById = catchAsync<
  CustomRequest<getDepartmentByIdParams, never, never>
>(
  async (
    req: CustomRequest<getDepartmentByIdParams, never, never>,
    res: Response
  ) => {
    const id = req.params.id;
    const department = await departmentService.getDepartmentById(id);

    res
      .status(httpStatus.OK)
      .send({ data: department, message: "Department retrieved successfully" });
  }
);

const updateDepartment = catchAsync<
  CustomRequest<updateDepartmentParams, never, updateDepartmentBody>
>(
  async (
    req: CustomRequest<updateDepartmentParams, never, updateDepartmentBody>,
    res: Response
  ) => {
    const id = req.params.id;
    const inputData = req.body;
    const department = await departmentService.updateDepartment(id, inputData);
    res.send({ message: "Department updated", data: department });
  }
);

const deleteDepartment = catchAsync<
  CustomRequest<getDepartmentByIdParams, never, never>
>(
  async (
    req: CustomRequest<getDepartmentByIdParams, never, never>,
    res: Response
  ) => {
    const id = req.params.id;
    const updated = await departmentService.deleteDepartment(id);
    res
      .status(httpStatus.OK)
      .send({ message: "Department deactivated", data: updated });
  }
);

export default {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  // getDepartmentsByCenter,
};
