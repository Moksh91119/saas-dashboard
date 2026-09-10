import type { Request, Response } from "express";

import {
  createTransaction,
  getTransactionById,
  getTransactions,
} from "../services/transaction.service.js";

function getId(req: Request, res: Response): string | null {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({
      success: false,
      message: "Invalid transaction ID",
    });

    return null;
  }

  return id;
}

export async function listTransactionsController(req: Request, res: Response) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const customerId =
      typeof req.query.customerId === "string"
        ? req.query.customerId
        : undefined;

    const status =
      req.query.status === "SUCCEEDED" ||
      req.query.status === "PENDING" ||
      req.query.status === "FAILED"
        ? req.query.status
        : undefined;

    const type =
      req.query.type === "CHARGE" ||
      req.query.type === "REFUND" ||
      req.query.type === "CREDIT"
        ? req.query.type
        : undefined;

    const result = await getTransactions({
      page,
      limit,
      status,
      type,
      customerId,
      search,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("List transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load transactions",
    });
  }
}

export async function getTransactionController(req: Request, res: Response) {
  try {
    const id = getId(req, res);

    if (!id) {
      return;
    }

    const transaction = await getTransactionById(id);

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load transaction";

    res.status(message === "Transaction not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
}

export async function createTransactionController(req: Request, res: Response) {
  try {
    const {
      customerId,
      subscriptionId,
      amount,
      currency,
      type,
      status,
      description,
      occurredAt,
    } = req.body;

    if (!customerId || amount === undefined || !type || !status) {
      res.status(400).json({
        success: false,
        message: "customerId, amount, type, and status are required",
      });

      return;
    }

    if (typeof amount !== "number" || amount < 0) {
      res.status(400).json({
        success: false,
        message: "Amount must be a non-negative number",
      });

      return;
    }

    if (!["CHARGE", "REFUND", "CREDIT"].includes(type)) {
      res.status(400).json({
        success: false,
        message: "Invalid transaction type",
      });

      return;
    }

    if (!["SUCCEEDED", "PENDING", "FAILED"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid transaction status",
      });

      return;
    }

    const transaction = await createTransaction({
      customerId,
      subscriptionId,
      amount,
      currency,
      type,
      status,
      description,
      occurredAt: occurredAt ? new Date(occurredAt) : undefined,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create transaction";

    const statusCode =
      message.includes("Customer not found") ||
      message.includes("Subscription not found")
        ? 404
        : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
