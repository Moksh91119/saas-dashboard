import prisma from "../config/prisma.js";

const ORGANIZATION_SLUG = "saasflow";

export async function getDashboardOverview() {
  const organization = await prisma.organization.findUnique({
    where: {
      slug: ORGANIZATION_SLUG,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const organizationId = organization.id;

  const [
    customers,
    activeSubscriptions,
    cancelledSubscriptions,
    transactions,
    recentTransactions,
    recentActivity,
  ] = await Promise.all([
    prisma.customer.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    }),

    prisma.subscription.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    }),

    prisma.subscription.count({
      where: {
        organizationId,
        status: "CANCELLED",
      },
    }),

    prisma.transaction.findMany({
      where: {
        organizationId,
        status: "SUCCEEDED",
        type: "CHARGE",
      },
      orderBy: {
        occurredAt: "desc",
      },
    }),

    prisma.transaction.findMany({
      where: {
        organizationId,
      },
      include: {
        customer: true,
        // plan: false,
      },
      orderBy: {
        occurredAt: "desc",
      },
      take: 10,
    }),

    prisma.activityLog.findMany({
      where: {
        organizationId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
  ]);

  const mrr = activeSubscriptions.reduce(
    (total, subscription) => total + Number(subscription.plan.price),
    0,
  );

  const arr = mrr * 12;

  const totalRevenue = transactions.reduce(
    (total, transaction) => total + Number(transaction.amount),
    0,
  );

  const activeCustomers = await prisma.customer.count({
    where: {
      organizationId,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  const arpc = activeCustomers > 0 ? mrr / activeCustomers : 0;

  return {
    metrics: {
      mrr,
      arr,
      totalRevenue,
      customers,
      activeCustomers,
      activeSubscriptions: activeSubscriptions.length,
      cancelledSubscriptions,
      arpc,
    },

    recentTransactions,

    recentActivity,
  };
}
