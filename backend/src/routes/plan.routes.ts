import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createPlanController,
  deactivatePlanController,
  getPlanController,
  listPlansController,
  updatePlanController,
} from "../controllers/plan.controller.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  createPlanSchema,
  updatePlanSchema,
} from "../validators/plan.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", listPlansController);

router.get("/:id", getPlanController);

router.post(
  "/",
  requireRole("ADMIN"),
  validateBody(createPlanSchema),
  createPlanController,
);

router.patch(
  "/:id",
  requireRole("ADMIN"),
  validateBody(updatePlanSchema),
  updatePlanController,
);

router.delete("/:id", requireRole("ADMIN"), deactivatePlanController);

export default router;
