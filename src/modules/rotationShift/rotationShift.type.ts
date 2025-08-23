// ==================== CORE TYPES ====================

// Note: RotatingShiftType is now a dynamic model, not a static enum
// The actual shift types are stored in the RotatingShiftType table

export interface ShiftSchedule {
  id: string;
  companyId: string;
  shiftId?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeShiftAssignment {
  id: string;
  employeeId: string;
  scheduleId?: string;
  date: Date;
  shiftTypeId?: string; // Link to RotatingShiftType (null = OFF day)
  hours: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== REQUEST TYPES ====================

export interface CreateShiftScheduleRequest {
  shiftId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateShiftScheduleRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface CreateEmployeeShiftAssignmentRequest {
  employeeId: string;
  scheduleId?: string;
  date: string; // Format: "YYYY-MM-DD"
  shiftTypeId?: string; // null = OFF day, uuid = actual shift type
}

export interface UpdateEmployeeShiftAssignmentRequest {
  shiftTypeId?: string; // null = OFF day, uuid = actual shift type
}

export interface BulkCreateAssignmentsRequest {
  scheduleId: string;
  assignments: Array<{
    employeeId: string;
    date: string; // Format: "YYYY-MM-DD"
    shiftTypeId?: string; // null = OFF day, uuid = actual shift type
  }>;
}

export interface BulkUpdateAssignmentsRequest {
  scheduleId: string;
  assignments: Array<{
    employeeId: string;
    date: string; // Format: "YYYY-MM-DD"
    shiftTypeId?: string | null; // null = OFF day, uuid = actual shift type
  }>;
}

export interface BulkUpdateAssignmentsResult {
  scheduleId: string;
  totalAssignments: number;
  updatedAssignments: number;
  createdAssignments: number;
  deletedAssignments: number;
  message: string;
  assignments: EmployeeShiftAssignmentWithRelations[];
}

// ==================== RESPONSE TYPES ====================

export interface ShiftScheduleWithRelations extends ShiftSchedule {
  company: {
    id: string;
    name: string;
  };
  shift?: {
    id: string;
    name: string;
    shiftType: string;
  };
  assignments?: EmployeeShiftAssignmentWithRelations[];
}

export interface EmployeeShiftAssignmentWithRelations extends EmployeeShiftAssignment {
  employee: {
    id: string;
    name: string;
    username: string;
  };
  schedule?: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  };
  shiftType?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
  };
}

// ==================== FILTER TYPES ====================

export interface ShiftScheduleFilters {
  isActive?: boolean;
  isApproved?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface EmployeeShiftAssignmentFilters {
  employeeId?: string;
  scheduleId?: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  shiftTypeId?: string; // Filter by specific shift type
  isApproved?: boolean;
}

// ==================== SUMMARY TYPES ====================

export interface EmployeeRotationSummary {
  totalDays: number;
  dayShifts: number;
  nightShifts: number;
  offDays: number;
  totalHours: number;
  assignments: Array<{
    date: Date;
    shiftTypeId?: string;
    shiftTypeName?: string; // "DAY", "NIGHT", etc. or "OFF"
    hours: number;
    isApproved: boolean;
  }>;
}

// ==================== BULK OPERATION TYPES ====================

export interface BulkCreateAssignmentsResult {
  message: string;
  count: number;
}

export interface DeleteResult {
  message: string;
}

// ==================== SERVICE INTERFACES ====================

export interface IRotationShiftService {
  // Shift Schedule methods
  createShiftSchedule(data: CreateShiftScheduleRequest & { companyId: string }): Promise<ShiftScheduleWithRelations>;
  getShiftSchedules(companyId: string, filters?: ShiftScheduleFilters): Promise<ShiftScheduleWithRelations[]>;
  getShiftScheduleById(id: string, companyId: string): Promise<ShiftScheduleWithRelations>;
  updateShiftSchedule(id: string, companyId: string, data: UpdateShiftScheduleRequest): Promise<ShiftScheduleWithRelations>;
  approveShiftSchedule(id: string, companyId: string): Promise<ShiftScheduleWithRelations>;
  deleteShiftSchedule(id: string, companyId: string): Promise<DeleteResult>;

  // Employee Shift Assignment methods
  createEmployeeShiftAssignment(data: CreateEmployeeShiftAssignmentRequest & { companyId: string }): Promise<EmployeeShiftAssignmentWithRelations>;
  getEmployeeShiftAssignments(companyId: string, filters?: EmployeeShiftAssignmentFilters): Promise<EmployeeShiftAssignmentWithRelations[]>;
  updateEmployeeShiftAssignment(id: string, companyId: string, data: UpdateEmployeeShiftAssignmentRequest): Promise<EmployeeShiftAssignmentWithRelations>;
  approveEmployeeShiftAssignment(id: string, companyId: string): Promise<EmployeeShiftAssignmentWithRelations>;
  deleteEmployeeShiftAssignment(id: string, companyId: string): Promise<DeleteResult>;

  // Bulk operations
  bulkCreateAssignments(data: BulkCreateAssignmentsRequest & { companyId: string }): Promise<BulkCreateAssignmentsResult>;
  bulkUpdateAssignments(data: BulkUpdateAssignmentsRequest & { companyId: string }): Promise<BulkUpdateAssignmentsResult>;
  getEmployeeRotationSummary(employeeId: string, companyId: string, startDate: Date, endDate: Date): Promise<EmployeeRotationSummary>;
}

// ==================== VALIDATION TYPES ====================

export interface ValidationSchemas {
  createShiftSchedule: any;
  updateShiftSchedule: any;
  getShiftScheduleById: any;
  approveShiftSchedule: any;
  deleteShiftSchedule: any;
  createEmployeeShiftAssignment: any;
  updateEmployeeShiftAssignment: any;
  approveEmployeeShiftAssignment: any;
  deleteEmployeeShiftAssignment: any;
  bulkCreateAssignments: any;
  getEmployeeRotationSummary: any;
}

// ==================== UTILITY TYPES ====================

export type ShiftScheduleStatus = "DRAFT" | "APPROVED" | "ACTIVE" | "INACTIVE";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface EmployeeShiftCounts {
  employeeId: string;
  employeeName: string;
  dayShifts: number;
  nightShifts: number;
  offDays: number;
  totalHours: number;
}

export interface ScheduleOverview {
  scheduleId: string;
  scheduleName: string;
  totalEmployees: number;
  totalAssignments: number;
  totalHours: number;
  status: ShiftScheduleStatus;
} 