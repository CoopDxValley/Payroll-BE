import { z } from "zod";
import providentFundValidation from "./providentFund.validation";

export type CreateProvidentFundInput = z.infer<
  typeof providentFundValidation.createProvidentFund.body
>;

export type ProvidentFundParams = z.infer<
  typeof providentFundValidation.providentFundParams.params
>;
