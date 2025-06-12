import express from "express";
import { testController } from "../../controllers";

const router = express.Router();

router.get("/health-check", testController.checkHealth);

export default router;
