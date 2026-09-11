import jwt from "jsonwebtoken";

import type { AuthUser } from "../types/auth.js";
import { env } from "../config/env.js";

const JWT_SECRET = env["JWT_SECRET"];

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export function generateToken(user: AuthUser) {
  return jwt.sign(
    {
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, JWT_SECRET);

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.userId !== "string" ||
    typeof payload.organizationId !== "string" ||
    (payload.role !== "ADMIN" && payload.role !== "MEMBER") ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    id: payload.userId,
    organizationId: payload.organizationId,
    role: payload.role,
    email: payload.email,
  };
}
