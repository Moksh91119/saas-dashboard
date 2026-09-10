import { Router } from "express";

import {
  cancelSubscriptionController,
  changeSubscriptionPlanController,
  createSubscriptionController,
  getSubscriptionController,
  listSubscriptionsController,
} from "../controllers/subscription.controller.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  createSubscriptionSchema,
  changeSubscriptionPlanSchema,
} from "../validators/subscription.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", listSubscriptionsController);

router.get("/:id", getSubscriptionController);

router.post(
  "/",
  requireRole("ADMIN"),
  validateBody(createSubscriptionSchema),
  createSubscriptionController,
);

router.patch(
  "/:id/plan",
  requireRole("ADMIN"),
  validateBody(changeSubscriptionPlanSchema),
  changeSubscriptionPlanController,
);

router.post("/:id/cancel", requireRole("ADMIN"), cancelSubscriptionController);

export default router;
