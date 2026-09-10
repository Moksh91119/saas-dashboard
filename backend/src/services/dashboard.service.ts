import prisma from "../config/prisma.js";

export async function getDashboardOverview(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

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

export async function getRevenueTrend(organizationId: string, months = 6) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth() - (months - 1),
    1,
  );

  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: organizationId,
      status: "SUCCEEDED",
      type: "CHARGE",
      occurredAt: {
        gte: startDate,
      },
    },
    select: {
      amount: true,
      occurredAt: true,
    },
    orderBy: {
      occurredAt: "asc",
    },
  });

  const result = [];

  for (let i = 0; i < months; i++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1 - i),
      1,
    );

    const year = date.getFullYear();
    const month = date.getMonth();

    const revenue = transactions
      .filter((transaction) => {
        const transactionDate = transaction.occurredAt;

        return (
          transactionDate.getFullYear() === year &&
          transactionDate.getMonth() === month
        );
      })
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

    result.push({
      month: `${year}-${String(month + 1).padStart(2, "0")}`,
      revenue,
    });
  }

  return result;
}

export async function getCustomerTrend(organizationId: string, months = 6) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const now = new Date();

  const result = [];

  for (let i = 0; i < months; i++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1 - i),
      1,
    );

    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    const customerCount = await prisma.customer.count({
      where: {
        organizationId: organizationId,
        deletedAt: null,
        joinedAt: {
          lt: nextMonth,
        },
      },
    });

    result.push({
      month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`,
      customers: customerCount,
    });
  }

  return result;
}

export async function getPlanAnalytics(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const plans = await prisma.plan.findMany({
    where: {
      organizationId: organizationId,
    },
    include: {
      subscriptions: {
        where: {
          status: {
            in: ["ACTIVE", "TRIAL"],
          },
        },
      },
    },
    orderBy: {
      price: "asc",
    },
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: Number(plan.price),
    billingInterval: plan.billingInterval,
    activeSubscriptions: plan.subscriptions.length,
    estimatedMrr:
      plan.billingInterval === "MONTHLY"
        ? Number(plan.price) * plan.subscriptions.length
        : (Number(plan.price) / 12) * plan.subscriptions.length,
  }));
}

export async function getSubscriptionAnalytics(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const statuses = await prisma.subscription.groupBy({
    by: ["status"],
    where: {
      organizationId: organizationId,
    },
    _count: {
      id: true,
    },
  });

  return statuses.map((item) => ({
    status: item.status,
    count: item._count.id,
  }));
}
