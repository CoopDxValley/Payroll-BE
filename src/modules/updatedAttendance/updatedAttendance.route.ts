import express from "express";
import updatedAttendanceController from "./updatedAttendance.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import updatedAttendanceValidation from "./updatedAttendance.validation";
import enhancedAttendanceValidation from "./enhancedAttendaceValidations";
// import { enhancedAttendanceController } from "../attendance";
import enhancedAttendanceController from "./enhancedAttendanceController";

const router = express.Router();

// Smart Attendance Route (Main API)
router
  .route("/attendance")
  .post(
    auth(),
    validate(updatedAttendanceValidation.smartAttendance),
    updatedAttendanceController.smartAttendance
  );

///////////////////////ENHANCED ATTENDANCE ROUTES

// Today's attendance
router
  .route("/today")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getTodaysAttendance),
    enhancedAttendanceController.getTodaysAttendance
  );

// Date range attendance
router
  .route("/date-range")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getAttendanceByDateRange),
    enhancedAttendanceController.getAttendanceByDateRange
  );

// Weekly attendance
router
  .route("/current-week")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getWeeklyAttendance),
    enhancedAttendanceController.getWeeklyAttendance
  );

// Monthly attendance
router
  .route("/current-month")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getMonthlyAttendance),
    enhancedAttendanceController.getMonthlyAttendance
  );

// Attendance by payroll definition
router
  .route("/payroll-definition/:payrollDefinitionId")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getAttendanceByPayrollDefinition),
    enhancedAttendanceController.getAttendanceByPayrollDefinition
  );

// Recent attendance (last 5 days from current month payroll)
router
  .route("/recent-attendance")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getRecentAttendance),
    enhancedAttendanceController.getRecentAttendance
  );

// Employee attendance by payroll definition ID
router
  .route("/month/employee/:employeeId/:payrollDefinitionId")
  .get(
    auth(),
    validate(
      enhancedAttendanceValidation.getEmployeeAttendanceByPayrollDefinition
    ),
    enhancedAttendanceController.getEmployeeAttendanceByPayrollDefinition
  );

// Yearly attendance
router
  .route("/current-year")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getYearlyAttendance),
    enhancedAttendanceController.getYearlyAttendance
  );

// Attendance by specific date
router
  .route("/by-date")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getAttendanceByDate),
    enhancedAttendanceController.getAttendanceByDate
  );

// Attendance summary
router
  .route("/summary")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getAttendanceSummary),
    enhancedAttendanceController.getAttendanceSummary
  );

// Payroll definition summary
router
  .route("/payroll-summary")
  .get(auth(), enhancedAttendanceController.getPayrollDefinitionSummary);

// Payroll definition summary by ID
router
  .route("/payroll-summary/:payrollDefinitionId")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getPayrollDefinitionSummaryById),
    enhancedAttendanceController.getPayrollDefinitionSummaryById
  );

// Payroll definition summary by ID
router
  .route("/payroll-summary/:payrollDefinitionId")
  .get(
    auth(),
    validate(enhancedAttendanceValidation.getPayrollDefinitionSummaryById),
    enhancedAttendanceController.getPayrollDefinitionSummaryById
  );
// WorkSession Routes
router
  .route("/")
  .post(
    auth(),
    validate(updatedAttendanceValidation.createWorkSession),
    updatedAttendanceController.createWorkSession
  )
  .get(auth(), updatedAttendanceController.getWorkSessions);
router
  .route("/bulk")
  .post(
    auth(),
    validate(updatedAttendanceValidation.bulkAttendance),
    updatedAttendanceController.bulkAttendance
  );
router
  .route("/:id")
  .get(
    auth(),
    validate(updatedAttendanceValidation.getWorkSessionById),
    updatedAttendanceController.getWorkSessionById
  )
  .post(
    auth(),
    validate(updatedAttendanceValidation.updateWorkSession),
    updatedAttendanceController.updateWorkSession
  );
router
  .route("/delete/:id")
  .post(
    auth(),
    validate(updatedAttendanceValidation.deleteWorkSession),
    updatedAttendanceController.deleteWorkSession
  );

// Punch Routes
router
  .route("/punch-in")
  .post(
    auth(),
    validate(updatedAttendanceValidation.punchIn),
    updatedAttendanceController.punchIn
  );

export default router;
