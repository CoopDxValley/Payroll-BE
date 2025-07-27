import { z } from "zod";

const createDepartment = {
  body: z.object({
    deptName: z.string().trim().min(3, "dept name is required"),
    location: z.string().trim().optional(),
    shorthandRepresentation: z.string().trim().optional(),
    companyId: z.string().uuid(),
  }),
};

export default {
  createDepartment,
};
