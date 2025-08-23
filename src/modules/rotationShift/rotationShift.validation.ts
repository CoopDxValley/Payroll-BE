import { z } from "zod";

// ==================== SHIFT SCHEDULE VALIDATIONS ====================
const createShiftSchedule = {
  body: z
    .object({
      shiftId: z.string().uuid("Invalid shift ID"),
      name: z
        .string()
        .min(1, "Schedule name is required")
        .max(255, "Schedule name too long"),
      startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Invalid start date format",
      }),
      endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Invalid end date format",
      }),
    })
    .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
      message: "Start date must be before end date",
      path: ["startDate"],
    }),
};
// const createShiftSchedule = {
//   body: z.object({
//     shiftId: z.string().uuid("Invalid shift ID").optional(),
//     name: z.string().min(1, "Schedule name is required").max(255, "Schedule name too long"),
//     startDate: z.string().datetime("Invalid start date format"),
//     endDate: z.string().datetime("Invalid end date format"),
//   }),
// };

const updateShiftSchedule = {
  params: z.object({
    id: z.string().uuid("Invalid schedule ID"),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(1, "Schedule name is required")
        .max(255, "Schedule name too long")
        .optional(),
      // startDate: z.string().datetime("Invalid start date format").optional(),
      // endDate: z.string().datetime("Invalid end date format").optional(),
      isActive: z.boolean().optional(),
      startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Invalid start date format",
      }),
      endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
        message: "Invalid end date format",
      }),
    })
    .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
      message: "Start date must be before end date",
      path: ["startDate"],
    }),
};

const getShiftScheduleById = {
  params: z.object({
    id: z.string().uuid("Invalid schedule ID"),
  }),
};

const approveShiftSchedule = {
  params: z.object({
    id: z.string().uuid("Invalid schedule ID"),
  }),
};

const deleteShiftSchedule = {
  params: z.object({
    id: z.string().uuid("Invalid schedule ID"),
  }),
};

// ==================== EMPLOYEE SHIFT ASSIGNMENT VALIDATIONS ====================

const createEmployeeShiftAssignment = {
  body: z.object({
    employeeId: z.string().uuid("Invalid employee ID"),
    scheduleId: z.string().uuid("Invalid schedule ID").optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    shiftTypeId: z.string().uuid("Invalid shift type ID").optional(), // null = OFF day
  }),
};

const updateEmployeeShiftAssignment = {
  params: z.object({
    id: z.string().uuid("Invalid assignment ID"),
  }),
  body: z.object({
    shiftTypeId: z.string().uuid("Invalid shift type ID").optional(), // null = OFF day
  }),
};

const approveEmployeeShiftAssignment = {
  params: z.object({
    id: z.string().uuid("Invalid assignment ID"),
  }),
};

const deleteEmployeeShiftAssignment = {
  params: z.object({
    id: z.string().uuid("Invalid assignment ID"),
  }),
};

// ==================== BULK OPERATION VALIDATIONS ====================

const bulkCreateAssignments = {
  body: z.object({
    scheduleId: z.string(),
    assignments: z.array(z.any()),
  }),
};

const bulkUpdateAssignments = {
  body: z.object({
    scheduleId: z.string().uuid("Invalid schedule ID"),
    assignments: z.array(
      z.object({
        employeeId: z.string().uuid("Invalid employee ID"),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
        shiftTypeId: z.string().uuid("Invalid shift type ID").optional().nullable(),
      })
    ).min(1, "At least one assignment is required"),
  }),
};

const getEmployeeRotationSummary = {
  params: z.object({
    employeeId: z.string().uuid("Invalid employee ID"),
  }),
  query: z.object({
    startDate: z.string().datetime("Invalid start date format"),
    endDate: z.string().datetime("Invalid end date format"),
  }),
};

export default {
  // Shift Schedule validations
  createShiftSchedule,
  updateShiftSchedule,
  getShiftScheduleById,
  approveShiftSchedule,
  deleteShiftSchedule,

  // Employee Shift Assignment validations
  createEmployeeShiftAssignment,
  updateEmployeeShiftAssignment,
  approveEmployeeShiftAssignment,
  deleteEmployeeShiftAssignment,

  // Bulk operation validations
  bulkCreateAssignments,
  bulkUpdateAssignments,
  getEmployeeRotationSummary,
};
