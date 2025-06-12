import express from "express";
import config from "../../config/config";
import healthRoute from "./health.route";
import { testController } from "../../controllers";
import companyRoute from "../../modules/company/company.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/company",
    route: companyRoute,
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
