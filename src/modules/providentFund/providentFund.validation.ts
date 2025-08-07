import { z } from "zod";

const createProvidentFund = {
  body: z.object({
    employeeContribution: z
      .number()
      .min(0, "Employee contribution must be non-negative"),
    employerContribution: z
      .number()
      .min(0, "Employer contribution must be non-negative"),
  }),
};

const providentFundParams = {
  params: z.object({
    ruleId: z.string().uuid(),
  }),
};

export default { createProvidentFund, providentFundParams };
