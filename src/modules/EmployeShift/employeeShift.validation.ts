import { z } from "zod";
// import { objectId } from "./custom.validation";

const assignShift = {
  body: z.object({
    employeeId: z.string().uuid("Invalid employee ID"),
    shiftId: z.string().uuid("Invalid shift ID"),
    startDate: z.string().datetime("Invalid start date format"),
    endDate: z.string().datetime("Invalid end date format").optional(),
    companyId: z.string().uuid().optional(), // Will be injected from auth
  }),
};

const unassignShift = {
  params: z.object({
    employeeId: z.string().uuid("Invalid employee ID"),
    shiftId: z.string().uuid("Invalid shift ID"),
  }),
};

export default {
  assignShift,
  unassignShift,
}; 