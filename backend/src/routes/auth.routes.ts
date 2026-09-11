import { Router } from "express";

import {
  loginController,
  meController,
  registerController,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { authRateLimiter } from "../middlewares/rate-limit.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  registerController,
);

router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  loginController,
);

router.get("/me", authenticate, meController);

export default router;
