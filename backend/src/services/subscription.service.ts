import prisma from "../config/prisma.js";

const ORGANIZATION_SLUG = "saasflow";

async function getOrganizationId() {
  const organization = await prisma.organization.findUnique({
    where: {
      slug: ORGANIZATION_SLUG,
    },
    select: {
      id: true,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return organization.id;
}

export async function getSubscriptions() {
  const organizationId = await getOrganizationId();

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

export async function getSubscriptionById(id: string) {
  const organizationId = await getOrganizationId();

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
    throw new Error("Subscription not found");
  }

  return subscription;
}

export async function createSubscription(data: {
  customerId: string;
  planId: string;
  status?: "TRIAL" | "ACTIVE";
}) {
  const organizationId = await getOrganizationId();

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
    throw new Error("Customer not found");
  }

  if (!plan) {
    throw new Error("Active plan not found");
  }

  if (existingSubscription) {
    throw new Error("Customer already has an active subscription");
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

export async function changeSubscriptionPlan(id: string, newPlanId: string) {
  const organizationId = await getOrganizationId();

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
    throw new Error("Subscription not found");
  }

  const newPlan = await prisma.plan.findFirst({
    where: {
      id: newPlanId,
      organizationId,
      isActive: true,
    },
  });

  if (!newPlan) {
    throw new Error("New plan not found");
  }

  if (subscription.planId === newPlan.id) {
    throw new Error("Subscription is already on this plan");
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

export async function cancelSubscription(id: string) {
  const organizationId = await getOrganizationId();

  const subscription = await prisma.subscription.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.status === "CANCELLED") {
    throw new Error("Subscription is already cancelled");
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
