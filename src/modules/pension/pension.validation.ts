import { z } from "zod";

const createPension = {
  body: z.object({
    employeeContribution: z
      .number()
      .min(0, "Employee contribution must be non-negative"),
    employerContribution: z
      .number()
      .min(0, "Employer contribution must be non-negative"),
  }),
};

const pensionParams = {
  params: z.object({
    ruleId: z.string().uuid(),
  }),
};

const updatePension = {
  body: z.object({
    employeeContribution: z
      .number()
      .min(0, "Employee contribution must be non-negative")
      .optional(),
    employerContribution: z
      .number()
      .min(0, "Employer contribution must be non-negative")
      .optional(),
  }),
  params: pensionParams.params,
};

export default { createPension, updatePension, pensionParams };
