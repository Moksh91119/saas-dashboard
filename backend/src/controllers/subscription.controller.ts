import type { Request, Response } from "express";

import {
  cancelSubscription,
  changeSubscriptionPlan,
  createSubscription,
  getSubscriptionById,
  getSubscriptions,
} from "../services/subscription.service.js";

function getId(req: Request, res: Response): string | null {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({
      success: false,
      message: "Invalid subscription ID",
    });

    return null;
  }

  return id;
}

export async function listSubscriptionsController(
  _req: Request,
  res: Response,
) {
  try {
    const subscriptions = await getSubscriptions();

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("List subscriptions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load subscriptions",
    });
  }
}

export async function getSubscriptionController(req: Request, res: Response) {
  try {
    const id = getId(req, res);

    if (!id) {
      return;
    }

    const subscription = await getSubscriptionById(id);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load subscription";

    res.status(message === "Subscription not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
}

export async function createSubscriptionController(
  req: Request,
  res: Response,
) {
  try {
    const { customerId, planId, status } = req.body;

    if (!customerId || !planId) {
      res.status(400).json({
        success: false,
        message: "customerId and planId are required",
      });

      return;
    }

    if (status !== undefined && status !== "TRIAL" && status !== "ACTIVE") {
      res.status(400).json({
        success: false,
        message: "Invalid subscription status",
      });

      return;
    }

    const subscription = await createSubscription({
      customerId,
      planId,
      status,
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create subscription";

    const statusCode = message.includes("already has")
      ? 409
      : message.includes("not found")
        ? 404
        : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function changeSubscriptionPlanController(
  req: Request,
  res: Response,
) {
  try {
    const id = getId(req, res);

    if (!id) {
      return;
    }

    const { planId } = req.body;

    if (!planId) {
      res.status(400).json({
        success: false,
        message: "planId is required",
      });

      return;
    }

    const subscription = await changeSubscriptionPlan(id, planId);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to change subscription plan";

    const statusCode =
      message === "Subscription not found" || message === "New plan not found"
        ? 404
        : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function cancelSubscriptionController(
  req: Request,
  res: Response,
) {
  try {
    const id = getId(req, res);

    if (!id) {
      return;
    }

    const subscription = await cancelSubscription(id);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel subscription";

    const statusCode = message === "Subscription not found" ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
