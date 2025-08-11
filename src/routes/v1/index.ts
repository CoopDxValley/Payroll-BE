import express from "express";
import config from "../../config/config";
import healthRoute from "./health.route";
import companyRoute from "../../modules/company/company.route";
import employeeRoute from "../../modules/employee/employee.route";
import authRoute from "../../modules/auth/auth.route";

import departmentRoute from "../../modules/department/department.route";
import positionRoute from "../../modules/position/position.route";
import shiftRoute from "../../modules/shift/shift.route";
import shiftDayRoute from "../../modules/shiftDays/shiftDay.route";
import employeeShiftRoute from "../../modules/EmployeShift/employeeShift.route";
import shiftCoverageRoute from "../../modules/shiftCoverage/shiftCoverage.route";
import workingCalendarRoute from "../../modules/workingCalendar/workingCalendar.route";
import gradeRoute from "../../modules/grades/grade.routes";
import leaveRequestRoute from "../../modules/leaveType/leaveType.route";
import additionalDeductionDefinitionRoute from "../../modules/additionaldeductiondefinition/additionalDeductionDefinition.route";
import additionalpayDefinition from "../../modules/additionalpaydefinition/additionalPayDefinition.route";
import approvalRoute from "../../modules/approval/approval.route";
import attendance from "../../modules/attendance/attendance.route";
// import swagger from "../../modules/swagger";
// import { setupSwagger } from "../../swagger/setup";

// import { setupSwagger } from "../../swagger/setup"; // ✅ correct
import { setupSwaggerAlternative } from "../../swagger/setup-alternative"; // Alternative CDN-based
import documentsRoute from "../../documents/documents.route"; // ✅ Documents route
import roleRoute from "../../modules/role/role.route";
import taxslabRoute from "../../modules/taxslab/taxslab.route";
import additionalPayRoute from "../../modules/additionalpay/additionalpay.route";
import additionalDeductionRoute from "../../modules/additionaldeduction/additionaldeduction.route";
import { setupSwagger } from "../../swagger/setup";
import deductionDefinitionRoute from "../../modules/deductiondefinition/deductionDefinition.route";
import allowanceDefinitionRoute from "../../modules/allowancedefinition/allowanceDefinition.route";
import deductionRoute from "../../modules/deduction/deduction.route";
import allowanceRoute from "../../modules/allowance/allowance.route";
import providentFundRoute from "../../modules/providentFund/providentFund.route";
import pensionRoute from "../../modules/pension/pension.route";
import overtimeGradePeriod from "../../modules/OvertimeGracePeriod/overtimeGracePeriod.route";
import payrollDefinitionRoute from "../../modules/payrolldefinition/payrolldefinition.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/company",
    route: companyRoute,
  },
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
    path: "/attendance",
    route: attendance,
  },
  {
    path: "/leave-requests",
    route: leaveRequestRoute,
  },
  {
    path: "/additional-deduction-definitions",
    route: additionalDeductionDefinitionRoute,
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
  // {
  //   path: "/attendance",
  //   route: attendance,
  // },
  {
    path: "/approvals",
    route: approvalRoute,
  },
  {
    path: "/overtime-grace-period",
    route: overtimeGradePeriod,
  },
  {
    path: "/test",
    route: (req: any, res: any) => {
      res.json({
        message: "Server is working!",
        timestamp: new Date().toISOString(),
        protocol: req.protocol,
        host: req.get("host"),
        url: req.url,
      });
    },
  },
  {
    path: "/documents",
    route: documentsRoute,
  },
  // {
  //   path: "/swagger",
  //   // route: setupSwaggerAlternative, // Try alternative setup that serves spec via URL
  //   route: setupSwagger, // Try this first, switch to setupSwaggerAlternative if needed
  //   path: "/roles",
  //   route: roleRoute,
  // },
  {
    path: "/taxslab",
    route: taxslabRoute,
  },
  {
    path: "/additional-pay",
    route: additionalPayRoute,
  },
  {
    path: "/additional-deduction",
    route: additionalDeductionRoute,
  },
  {
    path: "/deduction-definitions",
    route: deductionDefinitionRoute,
  },
  {
    path: "/allowance-definitions",
    route: allowanceDefinitionRoute,
  },
  {
    path: "/deductions",
    route: deductionRoute,
  },
  {
    path: "/allowances",
    route: allowanceRoute,
  },
  {
    path: "/provident-fund",
    route: providentFundRoute,
  },
  {
    path: "/pension",
    route: pensionRoute,
  },
  {
    path: "/payroll-definitions",
    route: payrollDefinitionRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/dev",
    route: healthRoute,
  },
  {
    path: "/swagger",
    route: setupSwagger,
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
