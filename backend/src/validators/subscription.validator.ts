import { z } from "zod";

export const createSubscriptionSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),

  planId: z.string().uuid("Invalid plan ID"),

  status: z.enum(["TRIAL", "ACTIVE", "PAST_DUE"]).optional(),

  startDate: z.coerce.date().optional(),

  trialEndsAt: z.coerce.date().optional(),

  currentPeriodStart: z.coerce.date().optional(),

  currentPeriodEnd: z.coerce.date().optional(),
});

export const changeSubscriptionPlanSchema = z.object({
  planId: z.string().uuid("Invalid plan ID"),
});
