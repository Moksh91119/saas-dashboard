import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createPlanController,
  deactivatePlanController,
  getPlanController,
  listPlansController,
  updatePlanController,
} from "../controllers/plan.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listPlansController);

router.get("/:id", getPlanController);

router.post("/", createPlanController);

router.patch("/:id", updatePlanController);

router.delete("/:id", deactivatePlanController);

export default router;
