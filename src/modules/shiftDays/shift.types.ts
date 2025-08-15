export interface ShiftDayData {
  dayNumber: number;
  dayType: "FULL_DAY" | "HALF_DAY" | "REST_DAY";
  startTime: Date;
  endTime: Date;
  breakTime: number;
  gracePeriod: number;
}

export interface CreateShiftData {
  name: string;
  shiftType: "FIXED_WEEKLY" | "ROTATING";
  companyId: string;
  patternDays?: ShiftDayData[];
}

export interface UpdateShiftData {
  name?: string;
  shiftType?: "FIXED_WEEKLY" | "ROTATING";
  patternDays?: ShiftDayData[];
  isActive?: boolean;
}

export interface ShiftWithPatternDays {
  id: string;
  name: string;
  shiftType: "FIXED_WEEKLY" | "ROTATING";
  companyId: string;
  isActive: boolean;
  patternDays: ShiftDayData[];
  createdAt: Date;
  updatedAt: Date;
} 