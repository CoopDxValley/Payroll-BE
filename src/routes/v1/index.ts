import express from "express";
import config from "../../config/config";
import healthRoute from "./health.route";
import companyRoute from "../../modules/company/company.route";
import employeeRoute from "../../modules/employee/employee.route";
import authRoute from "../../modules/auth/auth.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/company",
    route: companyRoute,
  },
  {
    path: "/employees",
    route: employeeRoute,
  },
  {
    path: "/auth",
    route: authRoute,
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
