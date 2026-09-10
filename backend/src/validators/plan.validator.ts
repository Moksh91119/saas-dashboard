import { z } from "zod";

export const createPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Plan name must be at least 2 characters")
    .max(100),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),

  price: z.coerce.number().finite().nonnegative("Price cannot be negative"),

  billingInterval: z.enum(["MONTHLY", "YEARLY"]),
});

export const updatePlanSchema = createPlanSchema.partial();
