import { PrismaClient } from "@prisma/client";
import ApiError from "../../utils/api-error";
import httpStatus from "http-status";
import {
  EnhancedOvertimeSession,
  EnhancedOvertimeResponse,
  OvertimeSummary,
  DateRangeQuery,
  SingleDateQuery,
  CreateOvertimeTableRequest,
  UpdateOvertimeTableRequest,
  UpdateOvertimeStatusRequest,
  IOvertimeTableWithRelations,
  OvertimeTableFilters,
} from "./overtimeManagement.type";
import { calculateDurationMinutes } from "../updatedAttendance/timeUtils";

const prisma = new PrismaClient();

// Helper function to format time
const formatTime = (date: Date | null): string | null => {
  if (!date) return null;
  return date.toTimeString().split(" ")[0];
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Enhanced Overtime Service
const overtimeManagementService = {
  // Get overtime records by date range
  // async getOvertimeByDateRange(filters: DateRangeQuery, companyId: string): Promise<EnhancedOvertimeSession[]> {
  //   console.log("=== Overtime Management Service: Date Range ===");

  //   // First get employees by companyId
  //   const employees = await prisma.employee.findMany({
  //     where: { companyId },
  //     select: {
  //       id: true,
  //       name: true,
  //       phoneNumber: true,
  //       deviceUserId: true,
  //     },
  //   });

  //   const employeeIds = employees.map(emp => emp.deviceUserId).filter(id => id !== null) as string[];
  //   const employeeMap = new Map(employees.map(emp => [emp.deviceUserId, emp]));

  //   // Get overtime records with work session and employee data
  //   const overtimeRecords = await prisma.overtimeTable.findMany({
  //     where: {
  //       deviceUserId: { in: employeeIds },
  //       date: {
  //         gte: new Date(filters.startDate),
  //         lte: new Date(filters.endDate),
  //       },
  //       ...(filters.deviceUserId && { deviceUserId: filters.deviceUserId }),
  //       ...(filters.overtimeType && { type: filters.overtimeType as any }),
  //       ...(filters.overtimeStatus && { status: filters.overtimeStatus as any }),
  //     },
  //     include: {
  //       workSession: {
  //         include: {
  //           shift: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       date: 'desc',
  //     },
  //   });

  //   return overtimeRecords.map((overtime) => {
  //     const employeeInfo = employeeMap.get(overtime.deviceUserId);
  //     const duration = overtime.duration || 0;
  //     const durationMinutes = overtime.punchIn && overtime.punchOut
  //       ? calculateDurationMinutes(overtime.punchIn, overtime.punchOut)
  //       : duration;

  //     return {
  //       id: overtime.id,
  //       employeeName: employeeInfo?.name || "Unknown",
  //       phoneNumber: employeeInfo?.phoneNumber || "",
  //       date: overtime.date,
  //       punchIn: formatTime(overtime.punchIn),
  //       punchOut: formatTime(overtime.punchOut),
  //       punchInSource: overtime.punchInSource,
  //       punchOutSource: overtime.punchOutSource,
  //       durationMinutes: durationMinutes,
  //       durationHours: +(durationMinutes / 60).toFixed(2),
  //       durationFormatted: formatDuration(durationMinutes),
  //       overtimeType: overtime.type as any,
  //       overtimeStatus: overtime.status as any,
  //       overtimeDuration: durationMinutes,
  //       overtimeDurationFormatted: formatDuration(durationMinutes),
  //       notes: overtime.notes,
  //     };
  //   });
  // },

  async getOvertimeByDateRange(
    filters: DateRangeQuery,
    companyId: string
  ): Promise<EnhancedOvertimeSession[]> {
    console.log("=== Overtime Management Service: Date Range ===");

    // First get employees by companyId with active department
    const employees = await prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        deviceUserId: true,
        departmentHistory: {
          where: { toDate: null }, // only active department
          include: {
            department: true,
          },
        },
        positionHistory: {
          where: { toDate: null },
          include: {
            position: true,
          },
        },
      },
    });

    const employeeIds = employees
      .map((emp) => emp.deviceUserId)
      .filter((id) => id !== null) as string[];
    const employeeMap = new Map(
      employees.map((emp) => [
        emp.deviceUserId,
        {
          ...emp,
          departmentName:
            emp.departmentHistory[0]?.department?.deptName || null,
          positionName: emp.positionHistory[0]?.position.positionName || null,
        },
      ])
    );

    // Get overtime records with work session and employee data
    const overtimeRecords = await prisma.overtimeTable.findMany({
      where: {
        deviceUserId: { in: employeeIds },
        date: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
        ...(filters.deviceUserId && { deviceUserId: filters.deviceUserId }),
        ...(filters.overtimeType && { type: filters.overtimeType as any }),
        ...(filters.overtimeStatus && {
          status: filters.overtimeStatus as any,
        }),
      },
      include: {
        workSession: {
          include: {
            shift: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return overtimeRecords.map((overtime) => {
      const employeeInfo = employeeMap.get(overtime.deviceUserId);
      const duration = overtime.duration || 0;
      const durationMinutes =
        overtime.punchIn && overtime.punchOut
          ? calculateDurationMinutes(overtime.punchIn, overtime.punchOut)
          : duration;

      return {
        id: overtime.id,
        employeeName: employeeInfo?.name || "Unknown",
        phoneNumber: employeeInfo?.phoneNumber || "",
        departmentName: employeeInfo?.departmentName || "Unassigned",
        positionName: employeeInfo?.positionName || "Unassigned",
        date: overtime.date,
        punchIn: formatTime(overtime.punchIn),
        punchOut: formatTime(overtime.punchOut),
        punchInSource: overtime.punchInSource,
        punchOutSource: overtime.punchOutSource,
        durationMinutes: durationMinutes,
        durationHours: +(durationMinutes / 60).toFixed(2),
        durationFormatted: formatDuration(durationMinutes),
        overtimeType: overtime.type as any,
        overtimeStatus: overtime.status as any,
        overtimeDuration: durationMinutes,
        overtimeDurationFormatted: formatDuration(durationMinutes),
        notes: overtime.notes,
      };
    });
  },
  // Get today's overtime
  async getTodaysOvertime(
    filters: any,
    companyId: string
  ): Promise<EnhancedOvertimeSession[]> {
    console.log("=== Overtime Management Service: Today ===");

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    return this.getOvertimeByDateRange(
      {
        startDate: startOfDay.toISOString().split("T")[0],
        endDate: endOfDay.toISOString().split("T")[0],
        deviceUserId: filters.deviceUserId,
        shiftId: filters.shiftId,
        overtimeType: filters.overtimeType,
        overtimeStatus: filters.overtimeStatus,
      },
      companyId
    );
  },

  // Get weekly overtime
  async getWeeklyOvertime(
    filters: any,
    companyId: string
  ): Promise<EnhancedOvertimeSession[]> {
    console.log("=== Overtime Management Service: Weekly ===");

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.getOvertimeByDateRange(
      {
        startDate: startOfWeek.toISOString().split("T")[0],
        endDate: endOfWeek.toISOString().split("T")[0],
        deviceUserId: filters.deviceUserId,
        shiftId: filters.shiftId,
        overtimeType: filters.overtimeType,
        overtimeStatus: filters.overtimeStatus,
      },
      companyId
    );
  },

  // Get monthly overtime
  async getMonthlyOvertime(
    filters: any,
    companyId: string
  ): Promise<EnhancedOvertimeSession[]> {
    console.log("=== Overtime Management Service: Monthly ===");

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    return this.getOvertimeByDateRange(
      {
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: endOfMonth.toISOString().split("T")[0],
        deviceUserId: filters.deviceUserId,
        shiftId: filters.shiftId,
        overtimeType: filters.overtimeType,
        overtimeStatus: filters.overtimeStatus,
      },
      companyId
    );
  },

  // Get overtime by payroll definition
  async getOvertimeByPayrollDefinition(
    filters: {
      payrollDefinitionId: string;
      deviceUserId?: string;
      shiftId?: string;
      departmentId?: string;
      overtimeType?: any;
      overtimeStatus?: any;
    },
    companyId: string
  ): Promise<EnhancedOvertimeSession[]> {
    console.log("=== Overtime Management Service: By Payroll Definition ===");

    // Fetch the specific payroll definition
    const payrollDef = await prisma.payrollDefinition.findFirst({
      where: {
        id: filters.payrollDefinitionId,
        companyId: companyId,
      },
    });

    if (!payrollDef) {
      throw new Error(`Payroll definition with ID ${filters.payrollDefinitionId} not found for the company`);
    }

    console.log(`Using payroll definition: ${payrollDef.payrollName}`);
    console.log(`Date range: ${payrollDef.startDate} to ${payrollDef.endDate}`);

    // Get overtime data for the payroll definition's date range
    const overtimeData = await this.getOvertimeByDateRange(
      {
        startDate: payrollDef.startDate.toISOString().split("T")[0],
        endDate: payrollDef.endDate.toISOString().split("T")[0],
        deviceUserId: filters.deviceUserId,
        shiftId: filters.shiftId,
        overtimeType: filters.overtimeType,
        overtimeStatus: filters.overtimeStatus,
      },
      companyId
    );

    // Filter by department if specified
    if (filters.departmentId) {
      // Get department name for filtering
      const department = await prisma.department.findUnique({
        where: { id: filters.departmentId },
        select: { deptName: true },
      });
      
      if (department) {
        return overtimeData.filter(session => 
          session.departmentName === department.deptName
        );
      }
    }

    return overtimeData;
  },

  // Get yearly overtime
  async getYearlyOvertime(
    filters: any,
    companyId: string
  ): Promise<EnhancedOvertimeSession[]> {
    console.log("=== Overtime Management Service: Yearly ===");

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

    return this.getOvertimeByDateRange(
      {
        startDate: startOfYear.toISOString().split("T")[0],
        endDate: endOfYear.toISOString().split("T")[0],
        deviceUserId: filters.deviceUserId,
        shiftId: filters.shiftId,
        overtimeType: filters.overtimeType,
        overtimeStatus: filters.overtimeStatus,
      },
      companyId
    );
  },

  // Get overtime by specific date
  async getOvertimeByDate(
    filters: SingleDateQuery,
    companyId: string
  ): Promise<EnhancedOvertimeSession[]> {
    console.log("=== Overtime Management Service: By Date ===");

    return this.getOvertimeByDateRange(
      {
        startDate: filters.date,
        endDate: filters.date,
        deviceUserId: filters.deviceUserId,
        shiftId: filters.shiftId,
        overtimeType: filters.overtimeType,
        overtimeStatus: filters.overtimeStatus,
      },
      companyId
    );
  },

  // Get overtime summary
  async getOvertimeSummary(
    filters: DateRangeQuery,
    companyId: string
  ): Promise<EnhancedOvertimeResponse> {
    console.log("=== Overtime Management Service: Summary ===");

    const sessions = await this.getOvertimeByDateRange(filters, companyId);

    // Calculate summary statistics
    const totalOvertimeRecords = sessions.length;
    const uniqueEmployees = new Set(sessions.map((s) => s.employeeName)).size;
    const totalOvertimeHours =
      sessions.reduce((sum, s) => sum + s.overtimeDuration, 0) / 60;
    const averageOvertimePerEmployee =
      uniqueEmployees > 0 ? totalOvertimeHours / uniqueEmployees : 0;

    const pendingOvertime = sessions.filter(
      (s) => s.overtimeStatus === "PENDING"
    ).length;
    const approvedOvertime = sessions.filter(
      (s) => s.overtimeStatus === "APPROVED"
    ).length;
    const rejectedOvertime = sessions.filter(
      (s) => s.overtimeStatus === "REJECTED"
    ).length;

    const overtimeByType = {
      UNSCHEDULED: sessions.filter((s) => s.overtimeType === "UNSCHEDULED")
        .length,
      EARLY_ARRIVAL: sessions.filter((s) => s.overtimeType === "EARLY_ARRIVAL")
        .length,
      LATE_DEPARTURE: sessions.filter(
        (s) => s.overtimeType === "LATE_DEPARTURE"
      ).length,
      EXTENDED_SHIFT: sessions.filter(
        (s) => s.overtimeType === "EXTENDED_SHIFT"
      ).length,
      HOLIDAY_WORK: sessions.filter((s) => s.overtimeType === "HOLIDAY_WORK")
        .length,
      REST_DAY_WORK: sessions.filter((s) => s.overtimeType === "REST_DAY_WORK")
        .length,
    };

    const summary: OvertimeSummary = {
      totalOvertimeRecords,
      totalEmployees: uniqueEmployees,
      totalOvertimeHours: +totalOvertimeHours.toFixed(2),
      averageOvertimePerEmployee: +averageOvertimePerEmployee.toFixed(2),
      pendingOvertime,
      approvedOvertime,
      rejectedOvertime,
      overtimeByType,
    };

    return {
      summary,
      sessions,
    };
  },

  // Create OvertimeTable
  async createOvertimeTable(
    data: CreateOvertimeTableRequest
  ): Promise<IOvertimeTableWithRelations> {
    console.log("=== Overtime Management Service: Create Overtime ===");

    // Check if employee exists
    const employee = await prisma.employee.findFirst({
      where: { deviceUserId: data.deviceUserId },
    });

    if (!employee) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Employee not found");
    }

    // Create stable datetime for punch times
    const punchInDateTime = new Date(`${data.date}T${data.punchIn}`);
    const punchOutDateTime = new Date(`${data.date}T${data.punchOut}`);

    // Calculate duration
    const duration = calculateDurationMinutes(
      punchInDateTime,
      punchOutDateTime
    );

    // Create overtime record
    const overtime = await prisma.overtimeTable.create({
      data: {
        deviceUserId: data.deviceUserId,
        date: new Date(data.date),
        punchIn: punchInDateTime,
        punchOut: punchOutDateTime,
        duration,
        type: data.type as any,
        status: "PENDING",
        notes: data.notes,
        punchInSource: data.punchInSource,
        punchOutSource: data.punchOutSource,
        workSessionId: data.workSessionId,
      },
      include: {
        workSession: {
          include: {
            shift: true,
          },
        },
      },
    });

    return overtime as unknown as IOvertimeTableWithRelations;
  },

  // Get OvertimeTables with filters
  async getOvertimeTables(
    filters: OvertimeTableFilters
  ): Promise<IOvertimeTableWithRelations[]> {
    console.log("=== Overtime Management Service: Get Overtimes ===");

    const whereClause: any = {};

    if (filters.deviceUserId) {
      whereClause.deviceUserId = filters.deviceUserId;
    }

    if (filters.startDate && filters.endDate) {
      whereClause.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.workSessionId) {
      whereClause.workSessionId = filters.workSessionId;
    }

    return (await prisma.overtimeTable.findMany({
      where: whereClause,
      include: {
        workSession: {
          include: {
            shift: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })) as unknown as IOvertimeTableWithRelations[];
  },

  // Get OvertimeTable by ID
  async getOvertimeTableById(id: string): Promise<IOvertimeTableWithRelations> {
    console.log("=== Overtime Management Service: Get Overtime by ID ===");

    const overtime = await prisma.overtimeTable.findUnique({
      where: { id },
      include: {
        workSession: {
          include: {
            shift: true,
          },
        },
      },
    });

    if (!overtime) {
      throw new ApiError(httpStatus.NOT_FOUND, "Overtime record not found");
    }

    return overtime as unknown as IOvertimeTableWithRelations;
  },

  // Update OvertimeTable
  async updateOvertimeTable(
    id: string,
    data: UpdateOvertimeTableRequest
  ): Promise<IOvertimeTableWithRelations> {
    console.log("=== Overtime Management Service: Update Overtime ===");

    const overtime = await this.getOvertimeTableById(id);

    const updateData: any = {};

    if (data.punchIn) {
      const punchInDateTime = new Date(
        `${overtime.date.toISOString().split("T")[0]}T${data.punchIn}`
      );
      updateData.punchIn = punchInDateTime;
      updateData.punchInTime = data.punchIn;
    }

    if (data.punchOut) {
      const punchOutDateTime = new Date(
        `${overtime.date.toISOString().split("T")[0]}T${data.punchOut}`
      );
      updateData.punchOut = punchOutDateTime;
      updateData.punchOutTime = data.punchOut;
    }

    if (data.punchInSource) {
      updateData.punchInSource = data.punchInSource;
    }

    if (data.punchOutSource) {
      updateData.punchOutSource = data.punchOutSource;
    }

    if (data.type) {
      updateData.type = data.type;
    }

    if (data.workSessionId) {
      updateData.workSessionId = data.workSessionId;
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    // Recalculate duration if punch times changed
    if (data.punchIn || data.punchOut) {
      const newPunchIn = updateData.punchIn || overtime.punchIn;
      const newPunchOut = updateData.punchOut || overtime.punchOut;
      const newDuration = calculateDurationMinutes(newPunchIn, newPunchOut);
      updateData.duration = newDuration;
      updateData.durationFormatted = formatDuration(newDuration);
    }

    const updated = await prisma.overtimeTable.update({
      where: { id },
      data: updateData,
      include: {
        workSession: {
          include: {
            shift: true,
          },
        },
      },
    });

    return updated as unknown as IOvertimeTableWithRelations;
  },

  // Delete OvertimeTable
  async deleteOvertimeTable(id: string): Promise<void> {
    console.log("=== Overtime Management Service: Delete Overtime ===");

    const overtime = await this.getOvertimeTableById(id);

    await prisma.overtimeTable.delete({
      where: { id },
    });
  },

  // Update Overtime Status
  async updateOvertimeStatus(
    id: string,
    data: UpdateOvertimeStatusRequest
  ): Promise<IOvertimeTableWithRelations> {
    console.log("=== Overtime Management Service: Update Overtime Status ===");

    const overtime = await this.getOvertimeTableById(id);

    const updateData: any = {
      status: data.status,
    };

    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    const updated = await prisma.overtimeTable.update({
      where: { id },
      data: updateData,
      include: {
        workSession: {
          include: {
            shift: true,
          },
        },
      },
    });

    return updated as unknown as IOvertimeTableWithRelations;
  },
};

export default overtimeManagementService;
