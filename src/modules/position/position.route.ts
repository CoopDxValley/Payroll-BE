import express from "express";
import positionController from "./position.controller";
// import validate from "../../middlewares/validate";
// import positionValidation from "../../validations/position.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")

  .post(
    auth(),
    // validate(positionValidation.createPosition),
    positionController.createPosition
  )
  .get(auth(), positionController.getAllPositions);

router
  .route("/:id")

  .get(auth(), positionController.getPositionById)
  .post(
    auth(),
    // validate(positionValidation.updatePosition),
    positionController.updatePosition
  )
  .delete(auth(), positionController.deletePosition);

export default router;
