import { TaxType } from "@prisma/client";
import { z } from "zod";

const createTaxslab = {
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    type: z
      .enum([TaxType.INCOME_TAX, TaxType.EXEMPTION])
      .default(TaxType.INCOME_TAX)
      .optional(),
    rate: z.number().optional(),
    deductible: z.number().optional(),
    minIncome: z.number(),
    maxIncome: z.number(),
  }),
};

const taxslabParams = {
  params: z.object({
    ruleId: z.string().uuid(),
  }),
};

export default { createTaxslab, taxslabParams };
