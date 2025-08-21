import { createEnhancedAttendance, bulkCreateEnhancedAttendance } from "./enhanced-attendance.service";

// Example 1: Single attendance with FIXED_WEEKLY shift
export const exampleFixedWeeklyAttendance = async () => {
  try {
    const attendance = await createEnhancedAttendance({
      deviceUserId: "emp-001",
      checkTime: "08:30:00",  // HH:MM:SS format
      date: "2025-01-13",     // Monday
      checkType: "PUNCHIN"
    });

    console.log("Fixed Weekly Attendance Created:", attendance);
    return attendance;
  } catch (error) {
    console.error("Error creating fixed weekly attendance:", error);
    throw error;
  }
};

// Example 2: Single attendance with ROTATION shift
export const exampleRotationAttendance = async () => {
  try {
    const attendance = await createEnhancedAttendance({
      deviceUserId: "emp-002",
      checkTime: "18:15:00",  // HH:MM:SS format
      date: "2025-01-15",
      checkType: "PUNCHOUT"
    });

    console.log("Rotation Attendance Created:", attendance);
    return attendance;
  } catch (error) {
    console.error("Error creating rotation attendance:", error);
    throw error;
  }
};

// Example 3: Bulk attendance creation
export const exampleBulkAttendance = async () => {
  try {
    const records = [
      {
        deviceUserId: "emp-001",
        checkTime: "08:00:00",
        date: "2025-01-16",
        checkType: "PUNCHIN" as const
      },
      {
        deviceUserId: "emp-002",
        checkTime: "17:30:00",
        date: "2025-01-16",
        checkType: "PUNCHOUT" as const
      },
      {
        deviceUserId: "emp-003",
        checkTime: "09:15:00",
        date: "2025-01-16",
        checkType: "PUNCHIN" as const
      }
    ];

    const result = await bulkCreateEnhancedAttendance(records);
    console.log("Bulk Attendance Result:", result);
    return result;
  } catch (error) {
    console.error("Error creating bulk attendance:", error);
    throw error;
  }
};

// Example 4: Holiday work attendance
export const exampleHolidayAttendance = async () => {
  try {
    const attendance = await createEnhancedAttendance({
      deviceUserId: "emp-004",
      checkTime: "10:00:00",
      date: "2025-01-01",  // New Year's Day (holiday)
      checkType: "PUNCHIN"
    });

    console.log("Holiday Attendance Created:", attendance);
    return attendance;
  } catch (error) {
    console.error("Error creating holiday attendance:", error);
    throw error;
  }
};

// Example 5: Time-only input (uses current date)
export const exampleTimeOnlyAttendance = async () => {
  try {
    const attendance = await createEnhancedAttendance({
      deviceUserId: "emp-005",
      checkTime: "14:30:00",  // Only time, no date
      checkType: "PUNCHIN"
    });

    console.log("Time-Only Attendance Created:", attendance);
    return attendance;
  } catch (error) {
    console.error("Error creating time-only attendance:", error);
    throw error;
  }
};

// Example 6: ISO format input
export const exampleISOFormatAttendance = async () => {
  try {
    const attendance = await createEnhancedAttendance({
      deviceUserId: "emp-006",
      checkTime: "2025-01-20T16:45:00",  // ISO format
      checkType: "PUNCHOUT"
    });

    console.log("ISO Format Attendance Created:", attendance);
    return attendance;
  } catch (error) {
    console.error("Error creating ISO format attendance:", error);
    throw error;
  }
};

// Example 7: Space-separated format input
export const exampleSpaceSeparatedAttendance = async () => {
  try {
    const attendance = await createEnhancedAttendance({
      deviceUserId: "emp-007",
      checkTime: "2025-01-21 07:15:00",  // Space separated
      checkType: "PUNCHIN"
    });

    console.log("Space-Separated Attendance Created:", attendance);
    return attendance;
  } catch (error) {
    console.error("Error creating space-separated attendance:", error);
    throw error;
  }
};

// Example 8: Overtime scenarios
export const exampleOvertimeScenarios = async () => {
  try {
    // Early punch-in (should create UNSCHEDULED_WORK overtime)
    const earlyAttendance = await createEnhancedAttendance({
      deviceUserId: "emp-008",
      checkTime: "07:00:00",  // Very early
      date: "2025-01-22",
      checkType: "PUNCHIN"
    });

    // Late punch-out (should create EXTENDED_SHIFT overtime)
    const lateAttendance = await createEnhancedAttendance({
      deviceUserId: "emp-008",
      checkTime: "19:00:00",  // Very late
      date: "2025-01-22",
      checkType: "PUNCHOUT"
    });

    console.log("Overtime Scenarios:", {
      early: earlyAttendance,
      late: lateAttendance
    });

    return { earlyAttendance, lateAttendance };
  } catch (error) {
    console.error("Error creating overtime scenarios:", error);
    throw error;
  }
};

// Example 9: Different shift types for same employee
export const exampleDifferentShiftTypes = async () => {
  try {
    // Employee with FIXED_WEEKLY shift
    const fixedWeeklyAttendance = await createEnhancedAttendance({
      deviceUserId: "emp-fixed-001",
      checkTime: "08:45:00",
      date: "2025-01-23",  // Thursday
      checkType: "PUNCHIN"
    });

    // Employee with ROTATION shift
    const rotationAttendance = await createEnhancedAttendance({
      deviceUserId: "emp-rotation-001",
      checkTime: "06:30:00",
      date: "2025-01-23",
      checkType: "PUNCHIN"
    });

    console.log("Different Shift Types:", {
      fixedWeekly: fixedWeeklyAttendance,
      rotation: rotationAttendance
    });

    return { fixedWeeklyAttendance, rotationAttendance };
  } catch (error) {
    console.error("Error creating different shift type attendances:", error);
    throw error;
  }
};

// Example 10: Error handling scenarios
export const exampleErrorHandling = async () => {
  try {
    // Invalid time format
    await createEnhancedAttendance({
      deviceUserId: "emp-009",
      checkTime: "25:70:90",  // Invalid time
      date: "2025-01-24"
    });
  } catch (error: any) {
    console.log("Expected error for invalid time format:", error.message);
  }

  try {
    // Missing device user ID
    await createEnhancedAttendance({
      deviceUserId: "emp-009", // Added missing required field
      checkTime: "08:00:00",
      date: "2025-01-24"
    });
  } catch (error: any) {
    console.log("Expected error for missing device user ID:", error.message);
  }

  try {
    // Invalid date format
    await createEnhancedAttendance({
      deviceUserId: "emp-009",
      checkTime: "08:00:00",
      date: "invalid-date"
    });
  } catch (error: any) {
    console.log("Expected error for invalid date format:", error.message);
  }
};

// Export all examples
export const enhancedAttendanceExamples = {
  exampleFixedWeeklyAttendance,
  exampleRotationAttendance,
  exampleBulkAttendance,
  exampleHolidayAttendance,
  exampleTimeOnlyAttendance,
  exampleISOFormatAttendance,
  exampleSpaceSeparatedAttendance,
  exampleOvertimeScenarios,
  exampleDifferentShiftTypes,
  exampleErrorHandling
}; 