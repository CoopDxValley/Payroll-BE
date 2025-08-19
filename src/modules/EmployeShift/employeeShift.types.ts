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

export interface EmployeeShiftData {
  id: string;
  employeeId: string;
  shiftId: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  employee: EmployeeData;
  shift: ShiftData;
}

export interface AssignShiftData {
  employeeId: string;
  shiftId: string;
  startDate: Date;
  endDate?: Date;
  companyId: string;
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