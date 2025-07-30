import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import {
  createGradeSchema,
  updateGradeSchema,
  CreateGradeDto,
  UpdateGradeDto,
} from "../../dto/grade.dto";

const createGrade = async (data: CreateGradeDto) => {
  const { name, minSalary, maxSalary, companyId } = data;

  const min = Number(minSalary);
  const max = Number(maxSalary);

  if (isNaN(min) || isNaN(max)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid salary range");
  }
  if (maxSalary <= minSalary) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Maximum salary must be greater than minimum salary"
    );
  }

  // Check for duplicate grade name
  const existingByName = await prisma.grade.findFirst({
    where: {
      name: name.trim(),
      companyId,
    },
  });

  if (existingByName) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Grade already exists in this company"
    );
  }

  // Check for overlapping salary ranges in the same company
  const overlappingGrade = await prisma.grade.findFirst({
    where: {
      companyId,
      isActive: true,
      OR: [
        {
          minSalary: {
            lte: maxSalary,
          },
          maxSalary: {
            gte: minSalary,
          },
        },
        {
          minSalary: {
            lte: minSalary,
          },
          maxSalary: {
            gte: minSalary,
          },
        },
        {
          minSalary: {
            lte: maxSalary,
          },
          maxSalary: {
            gte: maxSalary,
          },
        },
      ],
    },
  });

  if (overlappingGrade) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Salary range overlaps with existing grade: ${overlappingGrade.name}`
    );
  }

  // Create the grade
  return prisma.grade.create({
    data: {
      name: name.trim(),
      minSalary: Number(minSalary),
      maxSalary: Number(maxSalary),
      companyId,
    },
  });
};

const getAllGrades = async (companyId: string) => {
  return await prisma.grade.findMany({
    where: {
      companyId,
      isActive: true,
    },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getGradeById = async (id: string) => {
  const grade = await prisma.grade.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });

  if (!grade) {
    throw new ApiError(httpStatus.NOT_FOUND, "Grade not found");
  }

  return grade;
};
// const updateGrade = async (gradeId: string, data: UpdateGradeDto) => {
//   // Validate input
//   // const validatedData = updateGradeSchema.parse(data);
//   const { name, minSalary, maxSalary, companyId } = data;

//   // Fetch existing grade
//   const existingGrade = await prisma.grade.findUnique({
//     where: { id: gradeId },
//   });

//   if (!existingGrade) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Grade not found");
//   }

//   const finalMinSalary = data.minSalary ?? existingGrade.minSalary;
//   const finalMaxSalary = data.maxSalary ?? existingGrade.maxSalary;

//   // Optional: Check for duplicate name
//   if (data.name && data.name.trim() !== existingGrade.name) {
//     const duplicate = await prisma.grade.findFirst({
//       where: {
//         name: data.name.trim(),
//         companyId: existingGrade.companyId,
//         NOT: { id: gradeId },
//       },
//     });

//     if (duplicate) {
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         "Grade with this name already exists in the company"
//       );
//     }
//   }

//   // 🔍 Check for overlapping ranges
//   const overlappingGrade = await prisma.grade.findFirst({
//     where: {
//       companyId: existingGrade.companyId,
//       NOT: { id: gradeId },
//       OR: [
//         {
//           minSalary: {
//             lte: finalMaxSalary,
//           },
//           maxSalary: {
//             gte: finalMinSalary,
//           },
//         },
//       ],
//     },
//   });

//   if (overlappingGrade) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       `Salary range overlaps with existing grade (${overlappingGrade.name})`
//     );
//   }

//   // ✅ Perform update
//   const updatedGrade = await prisma.grade.update({
//     where: { id: gradeId },
//     data: {
//       ...data,
//       name: data.name?.trim(),
//     },
//   });

//   return updatedGrade;
// };

export const updateGrade = async (gradeId: string, data: unknown) => {
  // Validate input data using Zod schema (partial update)
  const validatedData: UpdateGradeDto = updateGradeSchema.parse(data);

  // Fetch existing grade by ID
  const existingGrade = await prisma.grade.findUnique({
    where: { id: gradeId },
  });

  if (!existingGrade) {
    throw new ApiError(httpStatus.NOT_FOUND, "Grade not found");
  }

  // Use existing values if minSalary or maxSalary not provided
  const finalMinSalary = validatedData.minSalary ?? existingGrade.minSalary;
  const finalMaxSalary = validatedData.maxSalary ?? existingGrade.maxSalary;

  // Check if name is changing and if new name duplicates another grade in company
  if (validatedData.name && validatedData.name.trim() !== existingGrade.name) {
    const duplicate = await prisma.grade.findFirst({
      where: {
        name: validatedData.name.trim(),
        companyId: existingGrade.companyId,
        NOT: { id: gradeId },
      },
    });

    if (duplicate) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Grade with this name already exists in the company"
      );
    }
  }

  // Check for overlapping salary ranges with other grades (excluding current grade)
  const overlappingGrade = await prisma.grade.findFirst({
    where: {
      companyId: existingGrade.companyId,
      isActive: true,
      NOT: { id: gradeId },
      AND: [
        { minSalary: { lte: finalMaxSalary } },
        { maxSalary: { gte: finalMinSalary } },
      ],
    },
  });

  if (overlappingGrade) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Salary range overlaps with existing grade (${overlappingGrade.name})`
    );
  }

  // Perform the update
  const updatedGrade = await prisma.grade.update({
    where: { id: gradeId },
    data: {
      name: validatedData.name?.trim() ?? existingGrade.name,
      minSalary: finalMinSalary,
      maxSalary: finalMaxSalary,
      // companyId is not updated here to keep integrity
    },
  });

  return updatedGrade;
};
// const deleteGrade = async (id: string) => {
//   const existing = await prisma.grade.findUnique({ where: { id } });
//   if (!existing) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Grade not found");
//   }

//   return prisma.grade.update({
//     where: { id },
//     data: { isActive: false },
//   });
// };
export const deleteGrade = async (id: string) => {
  const existing = await prisma.grade.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Grade not found");
  }

  // Format current date/time as YYYY-MM-DD_HH-MM-SS
  const now = new Date();
  const formattedDate = now
    .toISOString()
    .replace(/T/, "_")
    .replace(/:/g, "-")
    .split(".")[0];

  const updatedName = `${existing.name}_${formattedDate}`;

  return prisma.grade.update({
    where: { id },
    data: {
      isActive: false,
      name: updatedName,
    },
  });
};
export default {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
};
