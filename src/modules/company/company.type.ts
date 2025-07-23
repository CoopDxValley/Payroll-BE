import { z } from "zod";
import { createCompanySchema, updateCompanySchema } from "./company.validation";

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
