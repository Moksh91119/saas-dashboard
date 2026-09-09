import type { Request, Response } from "express";
import { getDashboardOverview } from "../services/dashboard.service.js";

export async function getDashboardOverviewController(
  _req: Request,
  res: Response,
) {
  try {
    const dashboard = await getDashboardOverview();

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
}
