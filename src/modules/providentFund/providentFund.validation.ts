import { z } from "zod";
import { amount, UUID } from "../../validations/security";

const createProvidentFund = {
  body: z
    .object({
      employeeContribution: amount,
      employerContribution: amount,
    })
    .strict(),
};

const providentFundParams = {
  params: z.object({
    ruleId: UUID,
  }),
};

export default { createProvidentFund, providentFundParams };
