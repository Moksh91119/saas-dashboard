import type { Request, Response } from "express";

import {
  createPlan,
  deactivatePlan,
  getPlanById,
  getPlans,
  updatePlan,
} from "../services/plan.service.js";

function getId(req: Request, res: Response): string | null {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({
      success: false,
      message: "Invalid plan ID",
    });

    return null;
  }

  return id;
}

export async function listPlansController(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const plans = await getPlans(organizationId);

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error("List plans error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load plans",
    });
  }
}

export async function getPlanController(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const id = getId(req, res);

    if (!id) {
      return;
    }

    const plan = await getPlanById(organizationId, id);

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load plan";

    res.status(message === "Plan not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
}

export async function createPlanController(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const { name, slug, description, price, billingInterval } = req.body;

    if (!name || !slug || price === undefined || !billingInterval) {
      res.status(400).json({
        success: false,
        message: "Name, slug, price, and billingInterval are required",
      });

      return;
    }

    if (billingInterval !== "MONTHLY" && billingInterval !== "YEARLY") {
      res.status(400).json({
        success: false,
        message: "Invalid billing interval",
      });

      return;
    }

    if (typeof price !== "number" || price < 0) {
      res.status(400).json({
        success: false,
        message: "Price must be a non-negative number",
      });

      return;
    }

    const plan = await createPlan(organizationId, {
      name,
      slug,
      description,
      price,
      billingInterval,
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create plan";

    res.status(message.includes("already exists") ? 409 : 500).json({
      success: false,
      message,
    });
  }
}

export async function updatePlanController(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const id = getId(req, res);

    if (!id) {
      return;
    }

    const plan = await updatePlan(organizationId, id, req.body);

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update plan";

    const statusCode =
      message === "Plan not found"
        ? 404
        : message.includes("already exists")
          ? 409
          : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function deactivatePlanController(req: Request, res: Response) {
  try {
    const organizationId = req.user!.organizationId;
    const id = getId(req, res);

    if (!id) {
      return;
    }

    const plan = await deactivatePlan(organizationId, id);

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to deactivate plan";

    res.status(message === "Plan not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
}
