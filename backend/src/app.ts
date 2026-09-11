import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import planRoutes from "./routes/plan.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/dashboard", authenticate, dashboardRoutes);
app.use("/api/customers", authenticate, customerRoutes);
app.use("/api/plans", authenticate, planRoutes);
app.use("/api/subscriptions", authenticate, subscriptionRoutes);
app.use("/api/transactions", authenticate, transactionRoutes);
app.use("/api/activity", authenticate, activityRoutes);
app.use("/api/auth", authRoutes);
app.use(errorHandler);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      message: "SaaSFlow API is running",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

export default app;
