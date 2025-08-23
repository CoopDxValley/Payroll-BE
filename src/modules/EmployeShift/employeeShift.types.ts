export interface ShiftDayData {
  id: string;
  dayNumber: number;
  dayType: "FULL_DAY" | "HALF_DAY" | "REST_DAY";
  startTime: Date;
  endTime: Date;
  breakTime: number;
  gracePeriod: number;
}

export interface ShiftData {
  id: string;
  name: string;
  shiftType: "FIXED_WEEKLY" | "ROTATING";
  patternDays: ShiftDayData[];
}

export interface EmployeeData {
  id: string;
  name: string;
  username: string;
  phoneNumber: string;
}

export interface EmployeeShift {
  id: string;
  employeeId: string;
  shiftId: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignShiftRequest {
  employeeId: string;
  shiftId: string;
  startDate?: string;
  endDate?: string;
}

export interface UnassignShiftRequest {
  employeeId: string;
  shiftId: string;
}

export interface BulkAssignShiftRequest {
  shiftId: string;
  employeeIds: string[];
  startDate?: string; // Optional - defaults to today if not provided
  endDate?: string;   // Optional - not used in bulk operations (set to null)
}

export interface BulkUnassignShiftRequest {
  shiftId: string;
  employeeIds: string[];
}

export interface BulkAssignShiftResponse {
  message: string;
  count: number;
  shiftName: string;
  employees: Array<{
    id: string;
    name: string;
  }>;
}

export interface BulkUnassignShiftResponse {
  message: string;
  count: number;
  shiftName: string;
  unassignedEmployees: Array<{
    id: string;
    name: string;
  }>;
}

export interface WorkingHoursCalculation {
  shiftType: "FIXED_WEEKLY" | "ROTATING";
  totalWorkingHours?: number;
  workingDays?: number;
  patternDays?: ShiftDayData[];
  message?: string;
}

export interface ShiftDetailsData {
  id: string;
  name: string;
  shiftType: "FIXED_WEEKLY" | "ROTATING";
  companyId: string;
  isActive: boolean;
  patternDays: ShiftDayData[];
  createdAt: Date;
  updatedAt: Date;
}

// Types for rotation shift assignments
export interface RotatingShiftTypeData {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface ShiftAssignmentData {
  id: string;
  date: Date;
  hours: number;
  shiftType: RotatingShiftTypeData | null;
  isApproved: boolean;
  schedule: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  } | null;
}

export interface RotationData {
  totalDays: number;
  activeDays: number;
  offDays: number;
  recentAssignments: ShiftAssignmentData[];
  allAssignments: ShiftAssignmentData[];
}

export interface FixedWeeklyShiftAssignment {
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  shift: {
    id: string;
    name: string;
    shiftType: string;
    patternDays: any[];
  };
}

export interface EmployeeWithShiftData {
  id: string;
  name: string;
  username: string;
  phoneNumber: string;
  deviceUserId: string;
  employeeIdNumber: string;
  gender: string;
  currentPosition: {
    id: string;
    positionName: string;
  } | null;
  currentGrade: {
    id: string;
    name: string;
  } | null;
  // For ROTATION shifts
  rotationData?: RotationData;
  // For FIXED_WEEKLY shifts
  shiftAssignment?: FixedWeeklyShiftAssignment;
}

export interface GetEmployeesByShiftResponse {
  shiftId: string;
  shiftType: "FIXED_WEEKLY" | "ROTATING";
  scheduleId: string | null;
  totalEmployees: number;
  totalAssignments?: number; // Only for ROTATION shifts
  employees: EmployeeWithShiftData[];
} 