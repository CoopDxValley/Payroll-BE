import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import prisma from "../client";
import { AuthEmployee } from "../modules/auth/auth.type";

const permissionCache = new Map<string, Set<string>>();

export const checkPermission = (required: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const employee = req.employee as AuthEmployee;
    if (!employee) {
      res.status(401).json({ message: "Unauthorized" });
      return; // Just return after sending response
    }

    const employeeId = employee.id;

    const cachedPermissions = permissionCache.get(employeeId);
    if (cachedPermissions?.has(required)) {
      next();
      return;
    }

    try {
      const employeeWithRoles = await prisma.employeeRoleHistory.findFirst({
        where: { employeeId, toDate: null },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });

      if (!employeeWithRoles) {
        res
          .status(httpStatus.BAD_REQUEST)
          .json({ message: "Access Denied: Employee has no roles" });
        return;
      }
      const allPermissions = employeeWithRoles.role.permissions.map(
        (rp) => `${rp.permission.action}_${rp.permission.subject}`
      );

      const permissionSet = new Set(allPermissions);
      permissionCache.set(employeeId, permissionSet);

      if (permissionSet.has(required)) {
        next();
        return;
      }

      res.status(403).json({ message: "Access Denied: Missing permission" });
    } catch (err) {
      console.error("Error in permission check:", err);
      res.status(400).json({ message: "Internal server error" });
    }
  };
};

export const invalidateUserPermissionCache = (userId: string) => {
  permissionCache.delete(userId);
};
