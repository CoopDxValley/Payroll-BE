import { TaxType } from "@prisma/client";
import { z } from "zod";
import {
  amount,
  safeName,
  safeOptionalText,
  UUID,
} from "../../validations/security";

const createTaxslab = {
  body: z
    .object({
      name: safeName.optional(),
      description: safeOptionalText,
      type: z
        .enum([TaxType.INCOME_TAX, TaxType.EXEMPTION])
        .default(TaxType.INCOME_TAX)
        .optional(),
      rate: amount.optional(),
      deductible: amount.optional(),
      minIncome: amount,
      maxIncome: amount,
    })
    .strict(),
};

const taxslabParams = {
  params: z.object({
    ruleId: UUID,
  }),
};

export default { createTaxslab, taxslabParams };
