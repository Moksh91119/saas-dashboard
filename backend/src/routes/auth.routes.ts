import { Router } from "express";

import {
  loginController,
  meController,
  registerController,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.get("/me", authenticate, meController);

export default router;
