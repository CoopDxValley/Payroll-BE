// export { default as attendanceController } from "./attendance.controller";
// export { default as attendanceService } from "./attendance.service";
export { default as attendanceValidation } from "./attendance.validation";
// export { default as attendanceRoutes } from "./attendance.route";

// Enhanced attendance services with shift-aware overtime calculation
export { 
  createEnhancedAttendance,
  bulkCreateEnhancedAttendance,
  parseCheckTime,
  getEmployeeWithShifts,
  getRotatingShiftAssignment,
  getShiftDayForDate,
  processOvertimeLogic,
  processFixedWeeklyOvertime,
  processRotationOvertime,
} from "./enhanced-attendance.service";

export { default as enhancedAttendanceController } from "./enhanced-attendance.controller";
export { default as enhancedAttendanceRoutes } from "./enhanced-attendance.route";

// Payroll-attendance integration (currently with limited functionality due to schema constraints)
// export { default as payrollAttendanceService } from "./payroll-attendance.service";

// Examples and documentation
// export { default as attendanceExamples } from './attendance.example';
