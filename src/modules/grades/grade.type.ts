import { z } from "zod";
import gradeValidation from "./grade.validation";

export type gradeInput = z.infer<typeof gradeValidation.createGrade.body>;
export type updateGradeParams = z.infer<
  typeof gradeValidation.updateGrade.params
>;
export type updateGradeBody = z.infer<typeof gradeValidation.updateGrade.body>;
export type getGradeParams = z.infer<typeof gradeValidation.getGrade.params>;
