import prisma from "../config/prisma.js";
import { AppError } from "../middlewares/error.middleware.js";

export async function getSubscriptions(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  return prisma.subscription.findMany({
    where: {
      organizationId,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
        },
      },
      plan: {
        select: {
          id: true,
          name: true,
          price: true,
          billingInterval: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getSubscriptionById(organizationId: string, id: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      customer: true,
      plan: true,
      subscriptionEvents: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          fromPlan: true,
          toPlan: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      transactions: {
        orderBy: {
          occurredAt: "desc",
        },
      },
    },
  });

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  return subscription;
}

export async function createSubscription(
  organizationId: string,
  data: {
    customerId: string;
    planId: string;
    status?: "TRIAL" | "ACTIVE";
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
    throw new AppError("Organization not found", 404);
  }

  const [customer, plan, existingSubscription] = await Promise.all([
    prisma.customer.findFirst({
      where: {
        id: data.customerId,
        organizationId,
        deletedAt: null,
      },
    }),

    prisma.plan.findFirst({
      where: {
        id: data.planId,
        organizationId,
        isActive: true,
      },
    }),

    prisma.subscription.findFirst({
      where: {
        customerId: data.customerId,
        organizationId,
        status: {
          in: ["TRIAL", "ACTIVE", "PAST_DUE"],
        },
      },
    }),
  ]);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  if (!plan) {
    throw new AppError("Active plan not found", 404);
  }

  if (existingSubscription) {
    throw new AppError("Customer already has an active subscription", 409);
  }

  const startedAt = new Date();

  const currentPeriodEnd = new Date(startedAt);
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  const status = data.status ?? "ACTIVE";

  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.create({
      data: {
        organizationId,
        customerId: customer.id,
        planId: plan.id,
        status,
        startedAt,
        currentPeriodStart: startedAt,
        currentPeriodEnd,
        trialEndsAt:
          status === "TRIAL"
            ? new Date(startedAt.getTime() + 14 * 24 * 60 * 60 * 1000)
            : null,
      },
      include: {
        customer: true,
        plan: true,
      },
    });

    await tx.subscriptionEvent.create({
      data: {
        subscriptionId: subscription.id,
        eventType: "CREATED",
        toPlanId: plan.id,
        toStatus: status,
        metadata: {
          source: "api",
        },
      },
    });

    return subscription;
  });
}

export async function changeSubscriptionPlan(
  organizationId: string,
  id: string,
  newPlanId: string,
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
    throw new AppError("Organization not found", 404);
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      plan: true,
    },
  });

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.status === "CANCELLED") {
    throw new AppError(
      "Cannot change the plan of a cancelled subscription",
      409,
    );
  }

  const newPlan = await prisma.plan.findFirst({
    where: {
      id: newPlanId,
      organizationId,
      isActive: true,
    },
  });

  if (!newPlan) {
    throw new AppError("New active plan not found", 404);
  }

  if (subscription.planId === newPlan.id) {
    throw new AppError("Subscription is already on this plan", 409);
  }

  return prisma.$transaction(async (tx) => {
    const updatedSubscription = await tx.subscription.update({
      where: {
        id,
      },
      data: {
        planId: newPlan.id,
      },
      include: {
        customer: true,
        plan: true,
      },
    });

    await tx.subscriptionEvent.create({
      data: {
        subscriptionId: id,
        eventType: "PLAN_CHANGED",
        fromPlanId: subscription.planId,
        toPlanId: newPlan.id,
        fromStatus: subscription.status,
        toStatus: subscription.status,
        metadata: {
          source: "api",
        },
      },
    });

    return updatedSubscription;
  });
}

export async function cancelSubscription(organizationId: string, id: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404);
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!subscription) {
    throw new AppError("Subscription not found", 404);
  }

  if (subscription.status === "CANCELLED") {
    throw new AppError("Subscription is already cancelled", 409);
  }

  const cancelledAt = new Date();

  return prisma.$transaction(async (tx) => {
    const updatedSubscription = await tx.subscription.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
        cancelledAt,
        endedAt: cancelledAt,
      },
      include: {
        customer: true,
        plan: true,
      },
    });

    await tx.subscriptionEvent.create({
      data: {
        subscriptionId: id,
        eventType: "CANCELLED",
        fromStatus: subscription.status,
        toStatus: "CANCELLED",
        metadata: {
          source: "api",
        },
      },
    });

    return updatedSubscription;
  });
}
