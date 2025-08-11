import { Router } from "express";
import gradeController from "./grade.controller";
import auth from "../../middlewares/auth";
import gradeValidation from "./grade.validation";
import { validate } from "../../middlewares/validate";
import {
  gradeInput,
  getGradeParams,
  updateGradeParams,
  updateGradeBody,
} from "./grade.type";
const router = Router();

// Create a new grade
router.post(
  "/",
  auth(),
  validate<never, never, gradeInput>(gradeValidation.createGrade),
  gradeController.createGrade
);

// Get all grades for a company
router.get("/", auth(), gradeController.getGrades);

// Get a specific grade
router.get(
  "/:id",
  auth(),
  validate<getGradeParams, never, never>(gradeValidation.getGrade),
  gradeController.getGrade
);

// Update a grade
router.post(
  "/:id",
  auth(),
  validate<updateGradeParams, never, updateGradeBody>(
    gradeValidation.updateGrade
  ),
  gradeController.updateGrade
);

// Delete a grade (soft delete)
router.post(
  "/delete/:id",
  auth(),
  validate<getGradeParams, never, never>(gradeValidation.getGrade),
  gradeController.deleteGrade
);

export default router;
