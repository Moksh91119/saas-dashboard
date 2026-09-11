import prisma from "../config/prisma.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../middlewares/error.middleware.js";

export async function registerUser(data: {
  organizationName: string;
  organizationSlug: string;
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = data.email.trim().toLowerCase();

  const existingOrganization = await prisma.organization.findUnique({
    where: {
      slug: data.organizationSlug,
    },
  });

  if (existingOrganization) {
    throw new AppError("Organization slug already exists", 400);
  }

  const passwordHash = await hashPassword(data.password);

  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: data.organizationName,
        slug: data.organizationSlug,
      },
    });

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "ADMIN",
      },
    });

    return {
      organization,
      user,
    };
  });

  const authUser = {
    id: result.user.id,
    organizationId: result.organization.id,
    role: result.user.role,
    email: result.user.email,
  };

  return {
    user: {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    },
    organization: {
      id: result.organization.id,
      name: result.organization.name,
      slug: result.organization.slug,
    },
    token: generateToken(authUser),
  };
}

export async function loginUser(data: { email: string; password: string }) {
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      isActive: true,
    },
    include: {
      organization: true,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordValid = await comparePassword(data.password, user.passwordHash);

  if (!passwordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  const authUser = {
    id: user.id,
    organizationId: user.organizationId,
    role: user.role,
    email: user.email,
  };

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    organization: {
      id: user.organization.id,
      name: user.organization.name,
      slug: user.organization.slug,
    },
    token: generateToken(authUser),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isActive: true,
    },
    include: {
      organization: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: {
      id: user.organization.id,
      name: user.organization.name,
      slug: user.organization.slug,
    },
  };
}
