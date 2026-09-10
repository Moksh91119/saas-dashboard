import { Router } from "express";

import {
  getActivityController,
  listActivitiesController,
} from "../controllers/activity.controller.js";

const router = Router();

router.get("/", listActivitiesController);

router.get("/:id", getActivityController);

export default router;
