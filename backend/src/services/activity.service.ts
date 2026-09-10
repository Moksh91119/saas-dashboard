import prisma from "../config/prisma.js";

export async function getActivities(
  organizationId: string,
  params: {
    page: number;
    limit: number;
    action?: string;
    entityType?: string;
    userId?: string;
  },
) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const { page, limit, action, entityType, userId } = params;

  const where = {
    organizationId,

    ...(action && {
      action,
    }),

    ...(entityType && {
      entityType,
    }),

    ...(userId && {
      userId,
    }),
  };

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,

      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        description: true,
        metadata: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.activityLog.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    activities,

    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getActivityById(organizationId: string, id: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const activity = await prisma.activityLog.findFirst({
    where: {
      id,
      organizationId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!activity) {
    throw new Error("Activity not found");
  }

  return activity;
}
