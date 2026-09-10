import prisma from "../config/prisma.js";

export async function getTransactions(
  organizationId: string,
  params: {
    page: number;
    limit: number;
    status?: "SUCCEEDED" | "PENDING" | "FAILED";
    type?: "CHARGE" | "REFUND" | "CREDIT";
    customerId?: string;
    search?: string;
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

  const { page, limit, status, type, customerId, search } = params;

  const where = {
    organizationId,

    ...(status && {
      status,
    }),

    ...(type && {
      type,
    }),

    ...(customerId && {
      customerId,
    }),

    ...(search && {
      customer: {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            companyName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      },
    }),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,

      select: {
        id: true,
        amount: true,
        currency: true,
        type: true,
        status: true,
        description: true,
        occurredAt: true,
        createdAt: true,

        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
          },
        },

        subscription: {
          select: {
            id: true,
            status: true,

            plan: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },

      orderBy: {
        occurredAt: "desc",
      },

      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.transaction.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    transactions,
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

export async function getTransactionById(organizationId: string, id: string) {
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

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      organizationId,
    },

    include: {
      customer: true,

      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return transaction;
}

export async function createTransaction(
  organizationId: string,
  data: {
    customerId: string;
    subscriptionId?: string;
    amount: number;
    currency?: string;
    type: "CHARGE" | "REFUND" | "CREDIT";
    status: "SUCCEEDED" | "PENDING" | "FAILED";
    description?: string;
    occurredAt?: Date;
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

  const customer = await prisma.customer.findFirst({
    where: {
      id: data.customerId,
      organizationId,
      deletedAt: null,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (data.subscriptionId) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: data.subscriptionId,
        organizationId,
        customerId: data.customerId,
      },
    });

    if (!subscription) {
      throw new Error("Subscription not found or does not belong to customer");
    }
  }

  return prisma.transaction.create({
    data: {
      organizationId,
      customerId: data.customerId,
      subscriptionId: data.subscriptionId,
      amount: data.amount,
      currency: data.currency ?? "USD",
      type: data.type,
      status: data.status,
      description: data.description,
      occurredAt: data.occurredAt ?? new Date(),
    },

    include: {
      customer: true,

      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });
}
