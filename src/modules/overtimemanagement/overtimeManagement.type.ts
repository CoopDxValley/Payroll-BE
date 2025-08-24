import { z } from "zod";
import { OvertimeType, OvertimeStatus } from "../updatedAttendance/updatedAttendance.type";

// Enhanced Overtime Session Interface
export interface EnhancedOvertimeSession {
  id: string;
  employeeName: string;
  phoneNumber: string;
  departmentName: string;
  positionName: string;
  date: Date;
  punchIn: string | null;
  punchOut: string | null;
  punchInSource: string;
  punchOutSource: string;
  durationMinutes: number;
  durationHours: number;
  durationFormatted: string;
  overtimeType: OvertimeType;
  overtimeStatus: OvertimeStatus;
  overtimeDuration: number;
  overtimeDurationFormatted: string;
  notes: string | null;
}

// Overtime Summary Interface
export interface OvertimeSummary {
  totalOvertimeRecords: number;
  totalEmployees: number;
  totalOvertimeHours: number;
  averageOvertimePerEmployee: number;
  pendingOvertime: number;
  approvedOvertime: number;
  rejectedOvertime: number;
  overtimeByType: {
    UNSCHEDULED: number;
    EARLY_ARRIVAL: number;
    LATE_DEPARTURE: number;
    EXTENDED_SHIFT: number;
    HOLIDAY_WORK: number;
    REST_DAY_WORK: number;
  };
}

// Enhanced Overtime Response Interface
export interface EnhancedOvertimeResponse {
  summary: OvertimeSummary;
  sessions: EnhancedOvertimeSession[];
}

// Query Interfaces
export interface DateRangeQuery {
  startDate: string;
  endDate: string;
  deviceUserId?: string;
  shiftId?: string;
  overtimeType?: OvertimeType;
  overtimeStatus?: OvertimeStatus;
}

export interface SingleDateQuery {
  date: string;
  deviceUserId?: string;
  shiftId?: string;
  overtimeType?: OvertimeType;
  overtimeStatus?: OvertimeStatus;
}

// Overtime Table Interface
export interface IOvertimeTable {
  id: string;
  workSessionId: string;
  deviceUserId: string;
  date: Date;
  punchIn: Date;
  punchOut: Date;
  duration: number;
  type: OvertimeType;
  status: OvertimeStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  punchInSource: string;
  punchOutSource: string;
  punchInTime: string;
  punchOutTime: string;
  durationFormatted: string;
}

export interface IOvertimeTableWithRelations extends IOvertimeTable {
  workSession: {
    id: string;
    deviceUserId: string;
    date: Date;
    punchIn: Date | null;
    punchOut: Date | null;
    duration: number | null;
    shiftId: string | null;
    earlyMinutes: number;
    lateMinutes: number;
    createdAt: Date;
    updatedAt: Date;
    punchInSource: string;
    punchOutSource: string;
    shift?: {
      id: string;
      name: string;
      shiftType: string;
    };
  };
  employee?: {
    id: string;
    name: string;
    phoneNumber: string;
    deviceUserId: string;
  };
}

// Validation Schemas
export const createOvertimeTableSchema = z.object({
  deviceUserId: z.string().min(1, "Device user ID is required"),
  date: z.string().min(1, "Date is required"),
  punchIn: z.string().min(1, "Punch in time is required"),
  punchInSource: z.string().default("manual"),
  punchOut: z.string().min(1, "Punch out time is required"),
  punchOutSource: z.string().default("manual"),
  type: z.nativeEnum(OvertimeType, {
    errorMap: () => ({ message: "Invalid overtime type" }),
  }),
  workSessionId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOvertimeTableSchema = z.object({
  punchIn: z.string().optional(),
  punchInSource: z.string().optional(),
  punchOut: z.string().optional(),
  punchOutSource: z.string().optional(),
  type: z.nativeEnum(OvertimeType, {
    errorMap: () => ({ message: "Invalid overtime type" }),
  }).optional(),
  workSessionId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOvertimeStatusSchema = z.object({
  status: z.nativeEnum(OvertimeStatus, {
    errorMap: () => ({ message: "Invalid overtime status" }),
  }),
  notes: z.string().optional(),
});

export type CreateOvertimeTableRequest = z.infer<typeof createOvertimeTableSchema>;
export type UpdateOvertimeTableRequest = z.infer<typeof updateOvertimeTableSchema>;
export type UpdateOvertimeStatusRequest = z.infer<typeof updateOvertimeStatusSchema>;

// Filter Interface
export interface OvertimeTableFilters {
  deviceUserId?: string;
  startDate?: string;
  endDate?: string;
  type?: OvertimeType;
  status?: OvertimeStatus;
  workSessionId?: string;
  companyId?: string;
}

// Service Interface
export interface IOvertimeManagementService {
  // Enhanced Overtime Queries
  getOvertimeByDateRange(filters: DateRangeQuery, companyId: string): Promise<EnhancedOvertimeSession[]>;
  getTodaysOvertime(filters: any, companyId: string): Promise<EnhancedOvertimeSession[]>;
  getWeeklyOvertime(filters: any, companyId: string): Promise<EnhancedOvertimeSession[]>;
  getMonthlyOvertime(filters: any, companyId: string): Promise<EnhancedOvertimeSession[]>;
  getYearlyOvertime(filters: any, companyId: string): Promise<EnhancedOvertimeSession[]>;
  getOvertimeByDate(filters: SingleDateQuery, companyId: string): Promise<EnhancedOvertimeSession[]>;
  getOvertimeSummary(filters: DateRangeQuery, companyId: string): Promise<EnhancedOvertimeResponse>;

  // OvertimeTable CRUD
  createOvertimeTable(data: CreateOvertimeTableRequest): Promise<IOvertimeTableWithRelations>;
  getOvertimeTables(filters: OvertimeTableFilters): Promise<IOvertimeTableWithRelations[]>;
  getOvertimeTableById(id: string): Promise<IOvertimeTableWithRelations>;
  updateOvertimeTable(id: string, data: UpdateOvertimeTableRequest): Promise<IOvertimeTableWithRelations>;
  deleteOvertimeTable(id: string): Promise<void>;
  updateOvertimeStatus(id: string, data: UpdateOvertimeStatusRequest): Promise<IOvertimeTableWithRelations>;
} 