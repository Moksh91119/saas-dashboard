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

const router = Router();

router.use(authenticate);

router.get("/", listSubscriptionsController);

router.get("/:id", getSubscriptionController);

router.post("/", requireRole("ADMIN"), createSubscriptionController);

router.patch(
  "/:id/plan",
  requireRole("ADMIN"),
  changeSubscriptionPlanController,
);

router.post("/:id/cancel", requireRole("ADMIN"), cancelSubscriptionController);

export default router;
