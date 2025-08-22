import { z } from "zod";
// import { objectId } from "./custom.validation";

// const createWorkingCalendar = {
//   body: z.object({
//     year: z
//       .number()
//       .min(1900, "Year must be at least 1900")
//       .max(2100, "Year must be at most 2100"),
//     date: z.string().datetime("Invalid date format"),
//     dayType: z.enum(["WORKING_DAY", "HOLIDAY"], {
//       errorMap: () => ({
//         message: "Invalid dayType. Must be WORKING_DAY or HOLIDAY",
//       }),
//     }),
//     description: z.string().optional(),
//     isActive: z.boolean().optional(),
//     companyId: z.string().uuid().optional(), // Will be injected from auth
//   }),
// };
const createWorkingCalendar = {
  body: z.object({
    year: z
      .number()
      .min(1900, "Year must be at least 1900")
      .max(2100, "Year must be at most 2100"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    dayType: z.enum(["WORKING_DAY", "HOLIDAY"], {
      errorMap: () => ({
        message: "Invalid dayType. Must be WORKING_DAY or HOLIDAY",
      }),
    }),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    companyId: z.string().uuid().optional(), // Will be injected from auth
  }),
};
const getAllWorkingCalendar = {
  query: z.object({
    year: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : undefined)),
    dayType: z.enum(["WORKING_DAY", "HOLIDAY"]).optional(),
    date: z.string().datetime("Invalid date format").optional(),
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      }),
  }),
};

const getWorkingCalendarById = {
  params: z.object({
    id: z.string().uuid("Invalid working calendar ID"),
  }),
};

const updateWorkingCalendar = {
  params: z.object({
    id: z.string().uuid("Invalid working calendar ID"),
  }),
  body: z.object({
    year: z
      .number()
      .min(1900, "Year must be at least 1900")
      .max(2100, "Year must be at most 2100")
      .optional(),
    date: z.string().datetime("Invalid date format").optional(),
    dayType: z.enum(["WORKING_DAY", "HOLIDAY"]).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
};

const deleteWorkingCalendar = {
  params: z.object({
    id: z.string().uuid("Invalid working calendar ID"),
  }),
};
const bulkUploadWorkingCalendar = {
  body: z.object({
    entries: z
      .array(
        z.object({
          year: z
            .number()
            .min(1900, "Year must be at least 1900")
            .max(2100, "Year must be at most 2100"),
          date: z.coerce.date({ message: "Invalid date format" }),
          dayType: z.enum(["WORKING_DAY", "HOLIDAY"], {
            errorMap: () => ({
              message: "Invalid dayType. Must be WORKING_DAY or HOLIDAY",
            }),
          }),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .min(1, "At least one entry is required")
      .max(1000, "Maximum 1000 entries allowed per request"),
  }),
};

// const bulkUploadWorkingCalendar = {
//   body: z.object({
//     entries: z
//       .array(
//         z.object({
//           year: z
//             .number()
//             .min(1900, "Year must be at least 1900")
//             .max(2100, "Year must be at most 2100"),
//           date: z.string().datetime("Invalid date format"),
//           dayType: z.enum(["WORKING_DAY", "HOLIDAY"], {
//             errorMap: () => ({
//               message: "Invalid dayType. Must be WORKING_DAY or HOLIDAY",
//             }),
//           }),
//           description: z.string().optional(),
//           isActive: z.boolean().optional(),
//         })
//       )
//       .min(1, "At least one entry is required")
//       .max(1000, "Maximum 1000 entries allowed per request"),
//   }),
// };

const getWorkingCalendarByYear = {
  params: z.object({
    year: z
      .string()
      .transform((val) => parseInt(val))
      .refine((val) => !isNaN(val) && val >= 1900 && val <= 2100, {
        message: "Year must be a valid number between 1900 and 2100",
      }),
  }),
};
const getWorkingCalendarByDateRange = {
  query: z
    .object({
      startDate: z.coerce.date({ message: "Invalid start date format" }),
      endDate: z.coerce.date({ message: "Invalid end date format" }),
    })
    .refine((data) => data.startDate <= data.endDate, {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }),
};

// const getWorkingCalendarByDateRange = {
//   query: z.object({
//     startDate: z.string().datetime("Invalid start date format"),
//     endDate: z.string().datetime("Invalid end date format"),
//   }).refine((data) => {
//     const startDate = new Date(data.startDate);
//     const endDate = new Date(data.endDate);
//     return startDate <= endDate;
//   }, {
//     message: "Start date must be before or equal to end date",
//     path: ["startDate"],
//   }),
// };

const toggleWorkingCalendarStatus = {
  params: z.object({
    id: z.string().uuid("Invalid working calendar ID"),
  }),
};

export default {
  createWorkingCalendar,
  getAllWorkingCalendar,
  getWorkingCalendarById,
  updateWorkingCalendar,
  deleteWorkingCalendar,
  bulkUploadWorkingCalendar,
  getWorkingCalendarByYear,
  getWorkingCalendarByDateRange,
  toggleWorkingCalendarStatus,
};