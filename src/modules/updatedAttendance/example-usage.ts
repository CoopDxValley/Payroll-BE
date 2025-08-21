import updatedAttendanceService from "./updatedAttendance.service";
import { OvertimeType, OvertimeStatus } from "./updatedAttendance.type";

// Example usage of the Updated Attendance Module

async function demonstrateUsage() {
  try {
    console.log("🚀 Updated Attendance Module Examples\n");

    // Example 1: Create a complete work session
    console.log("1️⃣ Creating a complete work session...");
    const workSession = await updatedAttendanceService.createWorkSession({
      deviceUserId: "EMP001",
      date: "2025-08-17",
      punchIn: "2025-08-17T07:30:00Z",
      punchOut: "2025-08-17T17:30:00Z",
      shiftId: "shift-123",
      punchInSource: "device",
      punchOutSource: "device"
    });
    console.log("✅ Work session created:", {
      id: workSession.id,
      duration: workSession.duration,
      earlyMinutes: workSession.earlyMinutes,
      lateMinutes: workSession.lateMinutes
    });

    // Example 2: Punch in and out separately
    console.log("\n2️⃣ Punch in and out separately...");
    
    // Morning punch-in
    const punchInResult = await updatedAttendanceService.punchIn(
      "EMP002",
      "2025-08-17",
      "device"
    );
    console.log("✅ Punch-in recorded:", {
      id: punchInResult.id,
      punchIn: punchInResult.punchIn,
      punchInSource: punchInResult.punchInSource
    });

    // Evening punch-out
    const punchOutResult = await updatedAttendanceService.punchOut(
      "EMP002",
      "2025-08-17",
      "device"
    );
    console.log("✅ Punch-out recorded:", {
      id: punchOutResult.id,
      duration: punchOutResult.duration
    });

    // Example 3: Create overtime record manually
    console.log("\n3️⃣ Creating overtime record manually...");
    const overtime = await updatedAttendanceService.createOvertimeTable({
      deviceUserId: "EMP003",
      date: "2025-08-17",
      punchIn: "2025-08-17T06:00:00Z",
      punchOut: "2025-08-17T07:30:00Z",
      type: OvertimeType.EARLY_ARRIVAL,
      workSessionId: workSession.id,
      punchInSource: "manual",
      punchOutSource: "manual"
    });
    console.log("✅ Overtime record created:", {
      id: overtime.id,
      type: overtime.type,
      duration: overtime.duration,
      status: overtime.status
    });

    // Example 4: Get work sessions with filters
    console.log("\n4️⃣ Getting work sessions with filters...");
    const workSessions = await updatedAttendanceService.getWorkSessions({
      deviceUserId: "EMP001",
      date: "2025-08-17"
    });
    console.log("✅ Work sessions found:", workSessions.length);

    // Example 5: Get overtime records with filters
    console.log("\n5️⃣ Getting overtime records with filters...");
    const overtimeRecords = await updatedAttendanceService.getOvertimeTables({
      type: OvertimeType.EARLY_ARRIVAL,
      status: OvertimeStatus.PENDING
    });
    console.log("✅ Pending early arrival overtime records:", overtimeRecords.length);

    // Example 6: Update overtime status
    if (overtimeRecords.length > 0) {
      console.log("\n6️⃣ Updating overtime status...");
      const updatedOvertime = await updatedAttendanceService.updateOvertimeStatus(
        overtimeRecords[0].id,
        OvertimeStatus.APPROVED
      );
      console.log("✅ Overtime status updated to:", updatedOvertime.status);
    }

    // Example 7: Update work session
    console.log("\n7️⃣ Updating work session...");
    const updatedSession = await updatedAttendanceService.updateWorkSession(
      workSession.id,
      {
        punchIn: "2025-08-17T07:15:00Z",
        punchInSource: "manual"
      }
    );
    console.log("✅ Work session updated:", {
      id: updatedSession.id,
      punchIn: updatedSession.punchIn,
      earlyMinutes: updatedSession.earlyMinutes
    });

    console.log("\n🎉 All examples completed successfully!");

  } catch (error) {
    console.error("❌ Error in examples:", error);
  }
}

// Example of handling different shift types
async function demonstrateShiftHandling() {
  console.log("\n🔄 Shift Handling Examples\n");

  try {
    // FIXED_WEEKLY shift example
    console.log("📅 FIXED_WEEKLY shift example...");
    const fixedWeeklySession = await updatedAttendanceService.createWorkSession({
      deviceUserId: "EMP004",
      date: "2025-08-17", // Monday
      punchIn: "2025-08-17T07:00:00Z", // 1 hour early
      punchOut: "2025-08-17T18:00:00Z", // 1 hour late
      shiftId: "fixed-weekly-shift-123",
      punchInSource: "device",
      punchOutSource: "device"
    });
    console.log("✅ Fixed weekly session created with overtime");

    // ROTATION shift example
    console.log("\n🔄 ROTATION shift example...");
    const rotationSession = await updatedAttendanceService.createWorkSession({
      deviceUserId: "EMP005",
      date: "2025-08-17",
      punchIn: "2025-08-17T05:00:00Z", // 2 hours early
      punchOut: "2025-08-17T19:00:00Z", // 2 hours late
      shiftId: "rotation-shift-456",
      punchInSource: "device",
      punchOutSource: "device"
    });
    console.log("✅ Rotation shift session created with overtime");

  } catch (error) {
    console.error("❌ Error in shift handling examples:", error);
  }
}

// Example of REST_DAY handling
async function demonstrateRestDayHandling() {
  console.log("\n🏖️ REST_DAY Handling Examples\n");

  try {
    // Note: This would typically be handled automatically by the system
    // when it detects a REST_DAY from the ShiftDay configuration
    
    console.log("📝 REST_DAY work is automatically handled:");
    console.log("   - No WorkSession record created");
    console.log("   - REST_DAY_WORK overtime created automatically");
    console.log("   - Status automatically set to APPROVED");
    console.log("   - Duration calculated from punch-in to punch-out");

  } catch (error) {
    console.error("❌ Error in REST_DAY examples:", error);
  }
}

// Run all examples
async function runAllExamples() {
  await demonstrateUsage();
  await demonstrateShiftHandling();
  await demonstrateRestDayHandling();
  
  console.log("\n✨ All examples completed!");
  console.log("\n📚 Check the README.md for more detailed information");
  console.log("🔗 API endpoints are available at /api/updated-attendance/*");
}

// Export for use in other files
export {
  demonstrateUsage,
  demonstrateShiftHandling,
  demonstrateRestDayHandling,
  runAllExamples
};

// Uncomment to run examples directly
// runAllExamples(); 