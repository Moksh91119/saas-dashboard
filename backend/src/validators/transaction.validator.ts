import { z } from "zod";

export const createTransactionSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),

  subscriptionId: z
    .string()
    .uuid("Invalid subscription ID")
    .optional()
    .nullable(),

  amount: z.coerce.number().finite().nonnegative("Amount cannot be negative"),

  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .transform((value) => value.toUpperCase()),

  type: z.enum(["CHARGE", "REFUND", "CREDIT"]),

  status: z.enum(["SUCCEEDED", "PENDING", "FAILED"]).optional(),

  occurredAt: z.coerce.date().optional(),
});

export const transactionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  status: z.enum(["SUCCEEDED", "PENDING", "FAILED"]).optional(),

  type: z.enum(["CHARGE", "REFUND", "CREDIT"]).optional(),

  customerId: z.string().uuid("Invalid customer ID").optional(),

  search: z.string().trim().optional(),
});
