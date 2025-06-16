import { Router, RequestHandler } from "express";
import auth from "./auth";
import { checkPermission } from "./checkPermissions";

type RouteConfig = {
  path: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  handler: RequestHandler;
  permission?: string;
  skipAuth?: boolean;
};

export const createRoute = (router: Router, config: RouteConfig) => {
  const { path, method, handler, permission, skipAuth = false } = config;

  const middlewares: RequestHandler[] = [];

  // Add authentication middleware if not skipped
  if (!skipAuth) {
    middlewares.push(auth());
  }

  // Add permission check if specified
  if (permission) {
    middlewares.push(checkPermission(permission));
  }

  // Add the route handler
  middlewares.push(handler);

  // Apply all middlewares to the route
  router[method](path, ...middlewares);
};

export const createRoutes = (router: Router, routes: RouteConfig[]) => {
  routes.forEach((route) => createRoute(router, route));
};
