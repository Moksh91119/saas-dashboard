import { Router } from "express";

import {
  getDashboardOverviewController,
  getDashboardAnalyticsController,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/overview", getDashboardOverviewController);

router.get("/analytics", getDashboardAnalyticsController);

export default router;
