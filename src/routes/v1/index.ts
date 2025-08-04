import express from "express";
import config from "../../config/config";
import healthRoute from "./health.route";
import companyRoute from "../../modules/company/company.route";
import employeeRoute from "../../modules/employee/employee.route";
import authRoute from "../../modules/auth/auth.route";

import departmentRoute from "../../modules/department/department.route";
import positionRoute from "../../modules/position/position.route";
// import authRoute from "./auth.routes";
// import userRoute from "./user.route";
// import adminRoute from "./admin.route";

import shiftRoute from "../../modules/shift/shift.route";
import shiftDayRoute from "../../modules/shiftDays/shiftDay.route";
import employeeShiftRoute from "../../modules/EmployeShift/employeeShift.route";
import shiftCoverageRoute from "../../modules/shiftCoverage/shiftCoverage.route";
import workingCalendarRoute from "../../modules/workingCalendar/workingCalendar.route";
import gradeRoute from "../../modules/grades/grade.routes";
import leaveRequestRoute from "../../modules/leaveType/leaveType.route";
import additionalDeductionRoute from "../../modules/additionaldeductiondefinition/additionalDeductionDefinition.route";
import additionalpayDefinition from "../../modules/additionalpaydefinition/additionalPayDefinition.route";
import approvalRoute from "../../modules/approval/approval.route";
import attendance from "../../modules/attendance/attendance.route";
// import swagger from "../../modules/swagger";
// import { setupSwagger } from "../../swagger/setup";

import { setupSwagger } from "../../swagger/setup"; // ✅ correct
import { setupSwaggerAlternative } from "../../swagger/setup-alternative"; // Alternative CDN-based
import documentsRoute from "../../documents/documents.route"; // ✅ Documents route

const router = express.Router();

const defaultRoutes = [
  {
    path: "/company",
    route: companyRoute,
  },

  // {
  //   path: "/users",
  //   route: userRoute,
  // },
  // {
  //   path: "/auth",
  //   route: authRoute,
  // },
  {
    path: "/company",
    route: companyRoute,
  },

  {
    path: "/departments",
    route: departmentRoute,
  },

  {
    path: "/positions",
    route: positionRoute,
  },

  {
    path: "/shifts",
    route: shiftRoute,
  },
  {
    path: "/shift-days",
    route: shiftDayRoute,
  },
  {
    path: "/employee-shifts",
    route: employeeShiftRoute,
  },
  {
    path: "/shift-coverage",
    route: shiftCoverageRoute,
  },
  {
    path: "/working-calendar",
    route: workingCalendarRoute,
  },
  {
    path: "/grades",
    route: gradeRoute,
  },
  {
    path: "/leave-requests",
    route: leaveRequestRoute,
  },
  {
    path: "/additional-deduction-definitions",
    route: additionalDeductionRoute,
  },
  {
    path: "/additional-pay-definitions",
    route: additionalpayDefinition,
  },
  {
    path: "/employees",
    route: employeeRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/attendance",
    route: attendance,
  },
  {
    path: "/approvals",
    route: approvalRoute,
  },
  {
    path: "/test",
    route: (req: any, res: any) => {
      res.json({
        message: "Server is working!",
        timestamp: new Date().toISOString(),
        protocol: req.protocol,
        host: req.get('host'),
        url: req.url
      });
    },
  },
  {
    path: "/documents",
    route: documentsRoute,
  },
  {
    path: "/swagger",
    // route: setupSwaggerAlternative, // Try alternative setup that serves spec via URL
    route: setupSwagger, // Try this first, switch to setupSwaggerAlternative if needed
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/dev",
    route: healthRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
