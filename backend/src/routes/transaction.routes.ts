import { Router } from "express";

import {
  createTransactionController,
  getTransactionController,
  listTransactionsController,
} from "../controllers/transaction.controller.js";

const router = Router();

router.get("/", listTransactionsController);

router.get("/:id", getTransactionController);

router.post("/", createTransactionController);

export default router;
