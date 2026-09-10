import { Router } from "express";

import {
  createCustomerController,
  deleteCustomerController,
  getCustomerController,
  listCustomersController,
  updateCustomerController,
} from "../controllers/customer.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerListQuerySchema,
} from "../validators/customer.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validateQuery(customerListQuerySchema),
  listCustomersController,
);

router.get("/:id", getCustomerController);

router.post("/", validateBody(createCustomerSchema), createCustomerController);

router.patch(
  "/:id",
  validateBody(updateCustomerSchema),
  updateCustomerController,
);

router.delete("/:id", requireRole("ADMIN"), deleteCustomerController);

export default router;
