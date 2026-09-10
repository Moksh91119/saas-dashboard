import { Router } from "express";

import {
  getActivityController,
  listActivitiesController,
} from "../controllers/activity.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listActivitiesController);

router.get("/:id", getActivityController);

export default router;
