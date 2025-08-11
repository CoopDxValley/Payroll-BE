import express from "express";
import overtimeGracePeriodController from "./overtimeGracePeriod.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import overtimeGracePeriodValidation from "./overtimeGracePeriod.validation";

const router = express.Router();

// Basic CRUD routes
router
  .route("/")
  .post(
    auth(),
    validate(overtimeGracePeriodValidation.createOvertimeGracePeriod),
    overtimeGracePeriodController.createOvertimeGracePeriod
  );
router
  .route("/active")
  .get(auth(), overtimeGracePeriodController.getAllActiveOvertimeGracePeriods);

router
  .route("/all")
  .get(auth(), overtimeGracePeriodController.getAllOvertimeGracePeriods);

// Individual resource routes
router
  .route("/:id")
  .get(
    auth(),
    validate(overtimeGracePeriodValidation.getOvertimeGracePeriodById),
    overtimeGracePeriodController.getOvertimeGracePeriodById
  )
  .post(
    auth(),
    validate(overtimeGracePeriodValidation.updateOvertimeGracePeriod),
    overtimeGracePeriodController.updateOvertimeGracePeriod
  );

router
  .route("/delete/:id")
  .post(
    auth(),
    validate(overtimeGracePeriodValidation.deleteOvertimeGracePeriod),
    overtimeGracePeriodController.deleteOvertimeGracePeriod
  );

export default router;
