import prisma from "../config/prisma.js";
import { AppError } from "../middlewares/error.middleware.js";

export async function getPlans(organizationId: string) {
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

  return prisma.plan.findMany({
    where: {
      organizationId,
    },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
    orderBy: {
      price: "asc",
    },
  });
}

export async function getPlanById(organizationId: string, id: string) {
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

  const plan = await prisma.plan.findFirst({
    where: {
      id,
      organizationId,
    },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  return plan;
}

export async function createPlan(
  organizationId: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    price: number;
    billingInterval: "MONTHLY" | "YEARLY";
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

  const existingPlan = await prisma.plan.findFirst({
    where: {
      organizationId,
      slug: data.slug,
    },
  });

  if (existingPlan) {
    throw new AppError("A plan with this slug already exists", 409);
  }

  return prisma.plan.create({
    data: {
      organizationId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      billingInterval: data.billingInterval,
      isActive: true,
    },
  });
}

export async function updatePlan(
  organizationId: string,
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    billingInterval?: "MONTHLY" | "YEARLY";
    isActive?: boolean;
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

  const plan = await prisma.plan.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  if (data.slug && data.slug !== plan.slug) {
    const existingPlan = await prisma.plan.findFirst({
      where: {
        organizationId,
        slug: data.slug,
        NOT: {
          id,
        },
      },
    });

    if (existingPlan) {
      throw new AppError("A plan with this slug already exists", 409);
    }
  }

  return prisma.plan.update({
    where: {
      id,
    },
    data,
  });
}

export async function deactivatePlan(organizationId: string, id: string) {
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

  const plan = await prisma.plan.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!plan) {
    throw new AppError("Plan not found", 404);
  }

  return prisma.plan.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
}
