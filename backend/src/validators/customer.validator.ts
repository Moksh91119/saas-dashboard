import { z } from "zod";

const optionalString = z.string().trim().max(255).optional().nullable();

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),

  email: z.string().trim().email("Invalid email address").max(255),

  companyName: optionalString,

  country: optionalString,

  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),

  country: z.string().trim().optional(),

  sortBy: z.enum(["name", "joinedAt", "createdAt"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
