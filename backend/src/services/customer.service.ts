import prisma from "../config/prisma.js";

export async function getCustomers(
  organizationId: string,
  params: {
    page: number;
    limit: number;
    search?: string;
    status?: "ACTIVE" | "INACTIVE";
    country?: string;
    sortBy?: "name" | "joinedAt" | "createdAt";
    sortOrder?: "asc" | "desc";
  },
) {
  const {
    page,
    limit,
    search,
    status,
    country,
    sortBy = "joinedAt",
    sortOrder = "desc",
  } = params;

  const where = {
    organizationId,
    deletedAt: null,
    ...(status && {
      status,
    }),
    ...(country && {
      country,
    }),
    ...(search && {
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
    }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        status: true,
        country: true,
        joinedAt: true,
        createdAt: true,
        _count: {
          select: {
            subscriptions: true,
            transactions: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.customer.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    customers,
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

export async function getCustomerById(organizationId: string, id: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },
    include: {
      subscriptions: {
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      transactions: {
        orderBy: {
          occurredAt: "desc",
        },
        take: 20,
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
}

export async function createCustomer(
  organizationId: string,
  data: {
    name: string;
    email: string;
    companyName?: string;
    country?: string;
  },
) {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      organizationId,
      email: data.email,
      deletedAt: null,
    },
  });

  if (existingCustomer) {
    throw new Error("A customer with this email already exists");
  }

  return prisma.customer.create({
    data: {
      organizationId,
      name: data.name,
      email: data.email,
      companyName: data.companyName,
      country: data.country,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  });
}

export async function updateCustomer(
  organizationId: string,
  id: string,
  data: {
    name?: string;
    email?: string;
    companyName?: string;
    country?: string;
    status?: "ACTIVE" | "INACTIVE";
  },
) {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (data.email && data.email !== customer.email) {
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        organizationId,
        email: data.email,
        deletedAt: null,
        NOT: {
          id,
        },
      },
    });

    if (existingCustomer) {
      throw new Error("A customer with this email already exists");
    }
  }

  return prisma.customer.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteCustomer(organizationId: string, id: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      organizationId,
      deletedAt: null,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return prisma.customer.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
      status: "INACTIVE",
    },
  });
}
