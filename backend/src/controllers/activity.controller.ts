import type { Request, Response } from "express";

import {
  getActivities,
  getActivityById,
} from "../services/activity.service.js";

function getId(req: Request, res: Response): string | null {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({
      success: false,
      message: "Invalid activity ID",
    });

    return null;
  }

  return id;
}

export async function listActivitiesController(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const action =
      typeof req.query.action === "string"
        ? req.query.action.trim()
        : undefined;

    const entityType =
      typeof req.query.entityType === "string"
        ? req.query.entityType.trim()
        : undefined;

    const userId =
      typeof req.query.userId === "string"
        ? req.query.userId.trim()
        : undefined;

    const result = await getActivities(organizationId, {
      page,
      limit,
      action,
      entityType,
      userId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("List activities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load activity",
    });
  }
}

export async function getActivityController(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const id = getId(req, res);

    if (!id) {
      return;
    }

    const activity = await getActivityById(organizationId, id);

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load activity";

    res.status(message === "Activity not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
}
