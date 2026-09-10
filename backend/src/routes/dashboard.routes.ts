import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getOverview,
  getAnalytics,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/overview", getOverview);
router.get("/analytics", getAnalytics);

export default router;
