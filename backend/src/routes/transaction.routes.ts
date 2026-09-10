import { Router } from "express";

import {
  createTransactionController,
  getTransactionController,
  listTransactionsController,
} from "../controllers/transaction.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listTransactionsController);

router.get("/:id", getTransactionController);

router.post("/", requireRole("ADMIN"), createTransactionController);

export default router;
