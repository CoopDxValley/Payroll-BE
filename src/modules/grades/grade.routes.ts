import { Router } from "express";
// import {GradeController}  from "../../controllers/grade.controller";
import gradeController from "./grade.controller";
import auth from "../../middlewares/auth";
import gradeValidation from "./grade.validation";
// import validate from "../../middlewares/validate";
const router = Router();

// Create a new grade
router.post(
  "/",
  auth(),
  // validate(gradeValidation.createGrade),
  gradeController.createGrade
);

// Get all grades for a company
router.get(
  "/",
  auth(),
  //   validate(gradeValidation.getGrade),
  gradeController.getGrades
);

// Get a specific grade
router.get(
  "/:id",
  auth(),
  // validate(gradeValidation.getGrade),
  gradeController.getGrade
);

// Update a grade
router.post(
  "/:id",
  auth(),
  // validate(gradeValidation.getGrade),
  gradeController.updateGrade
);

// Delete a grade (soft delete)
router.post(
  "/delete/:id",
  auth(),
  // validate(gradeValidation.getGrade),
  gradeController.deleteGrade
);

export default router;
