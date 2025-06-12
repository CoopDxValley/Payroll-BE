import { z } from "zod";
import { createCompanySchema } from "./company.validation";

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
