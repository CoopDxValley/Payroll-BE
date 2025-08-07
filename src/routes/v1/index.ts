import express from "express";
import config from "../../config/config";
import healthRoute from "./health.route";
import companyRoute from "../../modules/company/company.route";
import employeeRoute from "../../modules/employee/employee.route";
import authRoute from "../../modules/auth/auth.route";

import departmentRoute from "../../modules/department/department.route";
import positionRoute from "../../modules/position/position.route";
import shiftRoute from "../../modules/shift/shift.route";
import gradeRoute from "../../modules/grades/grade.routes";
import leaveRequestRoute from "../../modules/leaveType/leaveType.route";
import additionalDeductionDefinitionRoute from "../../modules/additionaldeductiondefinition/additionalDeductionDefinition.route";
import additionalpayDefinition from "../../modules/additionalpaydefinition/additionalPayDefinition.route";
import approvalRoute from "../../modules/approval/approval.route";
import roleRoute from "../../modules/role/role.route";
import taxslabRoute from "../../modules/taxslab/taxslab.route";
import additionalPayRoute from "../../modules/additionalpay/additionalpay.route";
import additionalDeductionRoute from "../../modules/additionaldeduction/additionaldeduction.route";
import { setupSwagger } from "../../swagger/setup";
import deductionDefinitionRoute from "../../modules/deductiondefinition/deductionDefinition.route";
import allowanceDefinitionRoute from "../../modules/allowancedefinition/allowanceDefinition.route";

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
    path: "/grades",
    route: gradeRoute,
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
    path: "/roles",
    route: roleRoute,
  },
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
