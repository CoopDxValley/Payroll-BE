import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "./api-error";
import { assignPermissionsToRoleInput } from "../modules/role/role.type";

export async function validatePermission(
  permissions: assignPermissionsToRoleInput["permissions"]
) {
  const permissionRecords = await prisma.permission.findMany({
    where: {
      id: { in: permissions },
    },
    select: {
      id: true,
      action: true,
      subject: true,
    },
  });

  const groupedBySubject = permissionRecords.reduce((acc, perm) => {
    if (!acc[perm.subject]) acc[perm.subject] = new Set();
    acc[perm.subject].add(perm.action);
    return acc;
  }, {} as Record<string, Set<string>>);

  for (const [subject, actions] of Object.entries(groupedBySubject)) {
    if (
      (actions.has("update") || actions.has("delete")) &&
      !actions.has("view")
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `You must include 'view' permission for subject '${subject}' when assigning 'update' or 'delete'.`
      );
    }
  }
}
