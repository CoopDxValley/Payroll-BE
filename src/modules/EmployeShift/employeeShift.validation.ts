import { z } from "zod";

const assignShift = {
  body: z.object({
    employeeId: z.string().uuid("Invalid employee ID"),
    shiftId: z.string().uuid("Invalid shift ID"),
    startDate: z.string().datetime("Invalid start date format").optional(),
    endDate: z.string().datetime("Invalid end date format").optional(),
    companyId: z.string().uuid().optional(), // Will be injected from auth
  }),
};

const unassignShift = {
  query: z.object({
    employeeId: z.string().uuid("Invalid employee ID"),
    shiftId: z.string().uuid("Invalid shift ID"),
  }),
};

const getShiftDetails = {
  params: z.object({
    shiftId: z.string().uuid("Invalid shift ID"),
  }),
};

const calculateWorkingHours = {
  params: z.object({
    employeeId: z.string().uuid("Invalid employee ID"),
  }),
  query: z.object({
    startDate: z.string().datetime("Invalid start date format"),
    endDate: z.string().datetime("Invalid end date format"),
  }),
};

const bulkAssignShift = {
  body: z.object({
    shiftId: z.string().uuid("Invalid shift ID"),
    employeeIds: z
      .array(z.string().uuid("Invalid employee ID"))
      .min(1, "At least one employee ID is required")
      .max(100, "Maximum 100 employees can be assigned at once"),
    startDate: z.string().datetime("Invalid start date format").optional(),
    endDate: z.string().datetime("Invalid end date format").optional(),
  }),
};

const bulkUnassignShift = {
  body: z.object({
    shiftId: z.string().uuid("Invalid shift ID"),
    employeeIds: z
      .array(z.string().uuid("Invalid employee ID"))
      .min(1, "At least one employee ID is required")
      .max(1000, "Maximum 1000 employees can be unassigned at once"),
  }),
};

const getEmployeesByShiftId = {
  params: z.object({
    shiftId: z.string().uuid("Invalid shift ID"),
  }),
  query: z
    .object({
      scheduleId: z.string().uuid("Invalid schedule ID").optional(),
    })
    .optional(),
};

export default {
  assignShift,
  unassignShift,
  getShiftDetails,
  getEmployeesByShiftId,
  calculateWorkingHours,
  bulkAssignShift,
  bulkUnassignShift,
};
