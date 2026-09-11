import prisma from "../config/prisma.js";
import type { InputJsonValue } from "../generated/prisma/internal/prismaNamespaceBrowser.js";

type CreateActivityLogInput = {
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: InputJsonValue;
};

export async function createActivityLog(input: CreateActivityLogInput) {
  return prisma.activityLog.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      description: input.description,
      metadata: input.metadata,
    },
  });
}
