import express from "express";
import config from "../../config/config";
import healthRoute from "./health.route";
import companyRoute from "../../modules/company/company.route";
import employeeRoute from "../../modules/employee/employee.route";
import authRoute from "../../modules/auth/auth.route";

import { testController } from "../../controllers";
import departmentRoute from "../../modules/department/department.route";
import positionRoute from "../../modules/position/position.route";
// import authRoute from "./auth.routes";
// import userRoute from "./user.route";
// import adminRoute from "./admin.route";

import shiftRoute from "../../modules/shift/shift.route";
import gradeRoute from "../../modules/grades/grade.routes";
import leaveRequestRoute from "../../modules/leaveType/leaveType.route";
import additionalDeductionRoute from "../../modules/additionaldeductiondefinition/additionalDeductionDefinition.route";
import additionalPayment from "../../modules/additionalpaydefinition/additionalPayDefinition.route";
import attendance  from '../../modules/attendance/attendance.route';
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
    route: additionalDeductionRoute,
  },
  {
    path: "/employees",
    route: employeeRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  }, {
    path: "/attendance",
    route: attendance,
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
