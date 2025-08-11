import { z } from "zod";
import { amount, UUID } from "../../validations/security";

const createPension = {
  body: z
    .object({
      employeeContribution: amount,
      employerContribution: amount,
    })
    .strict(),
};

const pensionParams = {
  params: z
    .object({
      ruleId: UUID,
    })
    .strict(),
};

const updatePension = {
  body: z
    .object({
      employeeContribution: amount.optional(),
      employerContribution: amount.optional(),
    })
    .strict(),
  params: pensionParams.params,
};

export default { createPension, updatePension, pensionParams };
