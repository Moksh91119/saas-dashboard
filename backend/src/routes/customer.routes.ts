import { Router } from "express";

import {
  createCustomerController,
  deleteCustomerController,
  getCustomerController,
  listCustomersController,
  updateCustomerController,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listCustomersController);

router.get("/:id", getCustomerController);

router.post("/", createCustomerController);

router.patch("/:id", updateCustomerController);

router.delete("/:id", deleteCustomerController);

export default router;
