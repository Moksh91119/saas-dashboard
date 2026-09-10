import type { Request, Response } from "express";

import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../services/customer.service.js";

function getCustomerId(req: Request, res: Response): string | null {
  const { id } = req.params;

  if (typeof id !== "string") {
    res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });

    return null;
  }

  return id;
}

export async function listCustomersController(req: Request, res: Response) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const status =
      req.query.status === "ACTIVE" || req.query.status === "INACTIVE"
        ? req.query.status
        : undefined;

    const country =
      typeof req.query.country === "string"
        ? req.query.country.trim()
        : undefined;

    const allowedSortFields = ["name", "joinedAt", "createdAt"] as const;

    const sortBy = allowedSortFields.includes(
      req.query.sortBy as (typeof allowedSortFields)[number],
    )
      ? (req.query.sortBy as (typeof allowedSortFields)[number])
      : "joinedAt";

    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

    const result = await getCustomers(req.user!.organizationId, {
      page,
      limit,
      search,
      status,
      country,
      sortBy,
      sortOrder,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("List customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load customers",
    });
  }
}

export async function getCustomerController(req: Request, res: Response) {
  try {
    const id = getCustomerId(req, res);

    if (!id) {
      return;
    }

    const customer = await getCustomerById(req.user!.organizationId, id);

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load customer";

    const statusCode = message === "Customer not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function createCustomerController(req: Request, res: Response) {
  try {
    const { name, email, companyName, country } = req.body;

    if (!name || !email) {
      res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
      return;
    }

    const customer = await createCustomer(req.user!.organizationId, {
      name,
      email,
      companyName,
      country,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create customer";

    const statusCode = message.includes("already exists") ? 409 : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function updateCustomerController(req: Request, res: Response) {
  try {
    const id = getCustomerId(req, res);

    if (!id) {
      return;
    }

    const customer = await updateCustomer(
      req.user!.organizationId,
      id,
      req.body,
    );

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update customer";

    const statusCode =
      message === "Customer not found"
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

export async function deleteCustomerController(req: Request, res: Response) {
  try {
    const id = getCustomerId(req, res);

    if (!id) {
      return;
    }

    await deleteCustomer(req.user!.organizationId, id);

    res.status(204).send();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete customer";

    const statusCode = message === "Customer not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
