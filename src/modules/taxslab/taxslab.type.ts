import { z } from "zod";
import taxslabValidation from "./taxslab.validation";

export type CreateTaxslabInput = z.infer<
  typeof taxslabValidation.createTaxslab.body
>;

export type TaxslabParams = z.infer<
  typeof taxslabValidation.taxslabParams.params
>;
