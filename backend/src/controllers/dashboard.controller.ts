import type { Request, Response } from "express";
import {
  getDashboardOverview,
  getCustomerTrend,
  getPlanAnalytics,
  getRevenueTrend,
  getSubscriptionAnalytics,
} from "../services/dashboard.service.js";

export async function getOverview(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const data = await getDashboardOverview(organizationId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
}

export async function getAnalytics(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const requestedMonths = Number(req.query.months ?? 6);

    const months = Math.min(
      Math.max(Number.isNaN(requestedMonths) ? 6 : requestedMonths, 3),
      12,
    );

    const [revenueTrend, customerTrend, planAnalytics, subscriptionAnalytics] =
      await Promise.all([
        getRevenueTrend(organizationId, months),
        getCustomerTrend(organizationId, months),
        getPlanAnalytics(organizationId),
        getSubscriptionAnalytics(organizationId),
      ]);

    res.json({
      success: true,
      data: {
        revenueTrend,
        customerTrend,
        planAnalytics,
        subscriptionAnalytics,
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard analytics",
    });
  }
}
