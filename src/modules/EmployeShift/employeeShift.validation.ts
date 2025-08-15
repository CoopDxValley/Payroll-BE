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

export default {
  assignShift,
  unassignShift,
  getShiftDetails,
  calculateWorkingHours,
};
