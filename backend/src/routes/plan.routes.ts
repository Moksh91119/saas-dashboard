import { Router } from "express";

import {
  createPlanController,
  deactivatePlanController,
  getPlanController,
  listPlansController,
  updatePlanController,
} from "../controllers/plan.controller.js";

const router = Router();

router.get("/", listPlansController);

router.get("/:id", getPlanController);

router.post("/", createPlanController);

router.patch("/:id", updatePlanController);

router.delete("/:id", deactivatePlanController);

export default router;
