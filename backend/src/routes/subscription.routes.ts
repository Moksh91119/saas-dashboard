import { Router } from "express";

import {
  cancelSubscriptionController,
  changeSubscriptionPlanController,
  createSubscriptionController,
  getSubscriptionController,
  listSubscriptionsController,
} from "../controllers/subscription.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listSubscriptionsController);

router.get("/:id", getSubscriptionController);

router.post("/", createSubscriptionController);

router.patch("/:id/plan", changeSubscriptionPlanController);

router.post("/:id/cancel", cancelSubscriptionController);

export default router;
