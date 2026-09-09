import { Router } from "express";
import { getDashboardOverviewController } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/overview", getDashboardOverviewController);

export default router;
