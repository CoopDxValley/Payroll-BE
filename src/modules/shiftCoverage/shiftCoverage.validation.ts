import { query } from "winston";
import { z } from "zod";
// import { objectId } from "./custom.validation";

const requestCoverage = {
  body: z.object({
    originalEmployeeId: z.string().uuid("Invalid original employee ID"),
    coveringEmployeeId: z.string().uuid("Invalid covering employee ID"),
    shiftId: z.string().uuid("Invalid shift ID"),
    coverageDate: z.string().datetime("Invalid coverage date format"),
    startTime: z.string().datetime("Invalid start time format"),
    endTime: z.string().datetime("Invalid end time format"),
    reason: z.enum(
      ["SICK_LEAVE", "VACATION", "EMERGENCY", "SHIFT_SWAP", "OVERTIME"],
      {
        errorMap: () => ({ message: "Invalid coverage reason" }),
      }
    ),
    companyId: z.string().uuid().optional(), // Will be injected from auth
  }),
};

const updateStatus = {
  params: z.object({
    id: z.string().uuid("Invalid coverage request ID"),
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED", "COMPLETED"], {
      errorMap: () => ({ message: "Invalid status" }),
    }),
    reason: z.string().optional(),
  }),
};

const cancelCoverage = {
  params: z.object({
    id: z.string().uuid("Invalid coverage request ID"),
  }),
};
const validStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"] as const;

const fetchByStatus = {
  query: z.object({
    status: z
      .string()
      .optional()
      .refine(
        (val) => !val || validStatuses.includes(val.toUpperCase() as any),
        {
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        }
      ),
  }),
};

export default {
  requestCoverage,
  updateStatus,
  cancelCoverage,
  fetchByStatus,
};
