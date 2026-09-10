import { Router } from "express";

import {
  createTransactionController,
  getTransactionController,
  listTransactionsController,
} from "../controllers/transaction.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listTransactionsController);

router.get("/:id", getTransactionController);

router.post("/", createTransactionController);

export default router;
