import type { Request, Response } from "express";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";

export async function registerController(req: Request, res: Response) {
  try {
    const { organizationName, organizationSlug, name, email, password } =
      req.body;

    if (
      !organizationName ||
      !organizationSlug ||
      !name ||
      !email ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message:
          "organizationName, organizationSlug, name, email, and password are required",
      });

      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });

      return;
    }

    const result = await registerUser({
      organizationName,
      organizationSlug,
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    res.status(message.includes("already exists") ? 409 : 500).json({
      success: false,
      message,
    });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

      return;
    }

    const result = await loginUser({
      email,
      password,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
}

export async function meController(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const user = await getCurrentUser(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load user";

    res.status(message === "User not found" ? 404 : 500).json({
      success: false,
      message,
    });
  }
}
