import { Request, Response, NextFunction } from "express";
import prisma from "../client";
import { AuthUser } from "../types/express";

const permissionCache = new Map<string, Set<string>>();

export const checkPermission = (required: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return; // Just return after sending response
    }

    const userId = user.id;

    const cachedPermissions = permissionCache.get(userId);
    if (cachedPermissions?.has(required)) {
      next();
      return;
    }

    try {
      const userWithRoles = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!userWithRoles) {
        res.status(403).json({ message: "Access Denied: User not found" });
        return;
      }

      const allPermissions = userWithRoles.userRoles.flatMap((userRole) =>
        userRole.role.permissions.map((rp) => rp.permission.action_subject)
      );

      const permissionSet = new Set(allPermissions);
      permissionCache.set(userId, permissionSet);

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
