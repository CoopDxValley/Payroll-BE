import { z } from "zod";
import {
  createPayrollDefinitionSchema,
  createPayrollDefinitionBulkSchema,
  updatePayrollDefinitionSchema,
  getPayrollDefinitionByIdSchema,
} from "./payrolldefinition.validation";

export type CreatePayrollDefinitionInput = z.infer<
  typeof createPayrollDefinitionSchema
>;
export type CreatePayrollDefinitionBulkInput = z.infer<
  typeof createPayrollDefinitionBulkSchema
>;
export type UpdatePayrollDefinitionInput = z.infer<
  typeof updatePayrollDefinitionSchema
>;
export type GetPayrollDefinitionByIdParams = z.infer<
  typeof getPayrollDefinitionByIdSchema
>;
