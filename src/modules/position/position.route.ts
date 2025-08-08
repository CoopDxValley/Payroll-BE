import express from "express";
import positionController from "./position.controller";
// import validate from "../../middlewares/validate";
import positionValidation from "./position.validation";
import auth from "../../middlewares/auth";
import { CreatePositionInput } from "./position.type";
import { validate } from "../../middlewares/validate";

const router = express.Router();

router
  .route("/")

  .post(
    auth(),
    validate<never, never, CreatePositionInput>(
      positionValidation.createPosition
    ),
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
  );

router.route("/delete/:id").post(auth(), positionController.deletePosition);

export default router;
