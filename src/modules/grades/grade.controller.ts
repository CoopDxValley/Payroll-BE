import { Request, Response } from "express";
import gradeService from "./grade.service";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import { AuthEmployee } from "../auth/auth.type";
import { CustomRequest } from "../../middlewares/validate";
import { gradeInput } from "./grade.type";

const createGrade = catchAsync<CustomRequest<never, never, gradeInput>>(
  async (req: CustomRequest<never, never, gradeInput>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const inputData: gradeInput & { companyId: string } = {
      ...req.body,
      companyId: authEmployee.companyId,
    };

    const grade = await gradeService.createGrade(inputData);

    res
      .status(httpStatus.CREATED)
      .send({ message: "Grade created successfully", data: grade });
  }
);

const getGrades = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const grades = await gradeService.getAllGrades(user.companyId);
  res.status(httpStatus.OK).send({ data: grades });
});

const getGrade = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const grade = await gradeService.getGradeById(id);
  if (!grade) {
    res.status(httpStatus.NOT_FOUND).send({ message: "Grade not found" });
    return;
  }
  res.status(httpStatus.OK).send({ data: grade });
});

const updateGrade = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const { id } = req.params;

  const grade = await gradeService.updateGrade(id, {
    ...req.body,
    companyId: user.companyId,
  });

  res.status(httpStatus.OK).send({
    message: "Grade updated successfully",
    data: grade,
  });
});

const deleteGrade = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await gradeService.deleteGrade(id);
  res.status(httpStatus.OK).send({ message: "Grade deleted successfully" });
});

export default {
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getGrades,

  // getDepartmentsByCenter,
};
