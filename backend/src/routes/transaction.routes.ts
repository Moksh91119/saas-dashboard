import { Router } from "express";

import {
  createTransactionController,
  getTransactionController,
  listTransactionsController,
} from "../controllers/transaction.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import {
  createTransactionSchema,
  transactionListQuerySchema,
} from "../validators/transaction.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validateQuery(transactionListQuerySchema),
  listTransactionsController,
);

router.get("/:id", getTransactionController);

router.post(
  "/",
  requireRole("ADMIN"),
  validateBody(createTransactionSchema),
  createTransactionController,
);

export default router;
