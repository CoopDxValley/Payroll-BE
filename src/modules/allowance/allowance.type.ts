import { z } from "zod";
import {
  createAllowanceSchema,
  updateAllowanceSchema,
  getAllowanceByIdSchema,
} from "./allowance.validation";

export type CreateAllowanceInput = z.infer<typeof createAllowanceSchema>;
export type UpdateAllowanceInput = z.infer<typeof updateAllowanceSchema>;
export type GetAllowanceByIdParams = z.infer<typeof getAllowanceByIdSchema>;
