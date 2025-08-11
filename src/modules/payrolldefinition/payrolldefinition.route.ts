import express from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import * as controller from "./payrolldefinition.controller";
import {
  createPayrollDefinitionSchema,
  createPayrollDefinitionBulkSchema,
  updatePayrollDefinitionSchema,
  getPayrollDefinitionByIdSchema,
} from "./payrolldefinition.validation";
import {
  CreatePayrollDefinitionInput,
  CreatePayrollDefinitionBulkInput,
  GetPayrollDefinitionByIdParams,
  UpdatePayrollDefinitionInput,
} from "./payrolldefinition.type";

const router = express.Router();

router
  .route("/")
  .get(auth(), controller.getAll)
  .post(
    auth(),
    validate<never, never, CreatePayrollDefinitionInput>({
      body: createPayrollDefinitionSchema,
    }),
    controller.create
  );

router.post(
  "/bulk",
  auth(),
  validate<never, never, CreatePayrollDefinitionBulkInput>({
    body: createPayrollDefinitionBulkSchema,
  }),
  controller.createBulk
);

router.get("/current-year", auth(), controller.getAllForCurrentYear);
router.get("/current-month", auth(), controller.getCurrentMonth);
router.get("/latest", auth(), controller.getLatest);

router
  .route("/:id")
  .get(
    auth(),
    validate<GetPayrollDefinitionByIdParams, never, never>({
      params: getPayrollDefinitionByIdSchema,
    }),
    controller.getById
  )
  .post(
    auth(),
    validate<
      GetPayrollDefinitionByIdParams,
      never,
      UpdatePayrollDefinitionInput
    >({
      params: getPayrollDefinitionByIdSchema,
      body: updatePayrollDefinitionSchema,
    }),
    controller.update
  );
router.post(
  "/remove/:id",
  auth(),
  validate<GetPayrollDefinitionByIdParams, never, never>({
    params: getPayrollDefinitionByIdSchema,
  }),
  controller.remove
);

export default router;
