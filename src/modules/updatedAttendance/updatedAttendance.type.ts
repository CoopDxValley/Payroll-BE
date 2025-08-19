import { z } from "zod";

// Enums matching Prisma schema
export enum OvertimeType {
  EARLY_ARRIVAL = "EARLY_ARRIVAL",
  LATE_DEPARTURE = "LATE_DEPARTURE",
  HOLIDAY_WORK = "HOLIDAY_WORK",
  REST_DAY_WORK = "REST_DAY_WORK",
  EXTENDED_SHIFT = "EXTENDED_SHIFT",
  UNSCHEDULED = "UNSCHEDULED",
  UNSCHEDULED_WORK = "UNSCHEDULED_WORK",
}

export enum OvertimeStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID = "PAID",
}

// Base interfaces - using Prisma types for compatibility
export interface IWorkSession {
  id: string;
  deviceUserId: string;
  date: Date;
  punchIn: Date | null;
  punchInSource: string;
  punchOut: Date | null;
  punchOutSource: string;
  duration: number | null;
  shiftId: string | null;
  earlyMinutes: number;
  lateMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOvertimeTable {
  id: string;
  workSessionId: string | null;
  deviceUserId: string;
  date: Date;
  punchIn: Date;
  punchInSource: string;
  punchOut: Date;
  punchOutSource: string;
  duration: number;
  type: OvertimeType;
  status: OvertimeStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// With relations
export interface IWorkSessionWithRelations extends IWorkSession {
  shift?: {
    id: string;
    name: string;
    shiftType: string;
  } | null;
  OvertimeTable: IOvertimeTable[];
}

export interface IOvertimeTableWithRelations extends IOvertimeTable {
  workSession?: IWorkSession | null;
}

// Request schemas
export const createWorkSessionSchema = z.object({
  deviceUserId: z.string().min(1, "Device user ID is required"),
  date: z.string().refine(
    (val) => {
      if (val.includes("T") || val.includes(" ")) {
        return true;
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return dateRegex.test(val);
    },
    {
      message:
        "Date must be in ISO date format (YYYY-MM-DD) or ISO datetime format",
    }
  ),
  punchIn: z.string().optional(),
  punchInSource: z.string().default("manual"),
  punchOut: z.string().optional(),
  punchOutSource: z.string().default("manual"),
  shiftId: z.string().optional(),
});

export const updateWorkSessionSchema = z.object({
  punchIn: z.string().optional(),
  punchInSource: z.string().optional(),
  punchOut: z.string().optional(),
  punchOutSource: z.string().optional(),
  shiftId: z.string().optional(),
});

export const createOvertimeTableSchema = z.object({
  deviceUserId: z.string().min(1, "Device user ID is required"),
  date: z.string().refine(
    (val) => {
      if (val.includes("T") || val.includes(" ")) {
        return true;
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return dateRegex.test(val);
    },
    {
      message:
        "Date must be in ISO date format (YYYY-MM-DD) or ISO datetime format",
    }
  ),
  punchIn: z.string().min(1, "Punch in time is required"),
  punchInSource: z.string().default("manual"),
  punchOut: z.string().min(1, "Punch out time is required"),
  punchOutSource: z.string().default("manual"),
  type: z.nativeEnum(OvertimeType),
  workSessionId: z.string().optional(),
});

export const updateOvertimeTableSchema = z.object({
  punchIn: z.string().optional(),
  punchInSource: z.string().optional(),
  punchOut: z.string().optional(),
  punchOutSource: z.string().optional(),
  type: z.nativeEnum(OvertimeType).optional(),
  status: z.nativeEnum(OvertimeStatus).optional(),
  workSessionId: z.string().optional(),
});

// Request types
export type CreateWorkSessionRequest = z.infer<typeof createWorkSessionSchema>;
export type UpdateWorkSessionRequest = z.infer<typeof updateWorkSessionSchema>;
export type CreateOvertimeTableRequest = z.infer<
  typeof createOvertimeTableSchema
>;
export type UpdateOvertimeTableRequest = z.infer<
  typeof updateOvertimeTableSchema
>;

// Filter types
export interface WorkSessionFilters {
  deviceUserId?: string;
  date?: string;
  shiftId?: string;
  startDate?: string;
  endDate?: string;
}

export interface OvertimeTableFilters {
  deviceUserId?: string;
  date?: string;
  type?: OvertimeType;
  status?: OvertimeStatus;
  startDate?: string;
  endDate?: string;
}

// Service interface
export interface IUpdatedAttendanceService {
  // WorkSession methods
  createWorkSession(
    data: CreateWorkSessionRequest
  ): Promise<IWorkSessionWithRelations>;
  getWorkSessions(
    filters: WorkSessionFilters
  ): Promise<IWorkSessionWithRelations[]>;
  getWorkSessionById(id: string): Promise<IWorkSessionWithRelations>;
  updateWorkSession(
    id: string,
    data: UpdateWorkSessionRequest
  ): Promise<IWorkSessionWithRelations>;
  deleteWorkSession(id: string): Promise<void>;

  // Smart Attendance method
  smartAttendance(data: any): Promise<IWorkSessionWithRelations>;

  // Punch methods (legacy)
  punchIn(
    deviceUserId: string,
    date: string,
    punchTime?: string,
    source?: string
  ): Promise<IWorkSessionWithRelations>;
  punchOut(
    deviceUserId: string,
    date: string,
    punchTime?: string,
    source?: string
  ): Promise<IWorkSessionWithRelations>;

  // OvertimeTable methods
  createOvertimeTable(
    data: CreateOvertimeTableRequest
  ): Promise<IOvertimeTableWithRelations>;
  getOvertimeTables(
    filters: OvertimeTableFilters
  ): Promise<IOvertimeTableWithRelations[]>;
  getOvertimeTableById(id: string): Promise<IOvertimeTableWithRelations>;
  updateOvertimeTable(
    id: string,
    data: UpdateOvertimeTableRequest
  ): Promise<IOvertimeTableWithRelations>;
  deleteOvertimeTable(id: string): Promise<void>;
  updateOvertimeStatus(
    id: string,
    status: OvertimeStatus
  ): Promise<IOvertimeTableWithRelations>;
}
