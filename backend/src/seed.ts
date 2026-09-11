import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "./generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // --------------------------------------------------
  // Clear existing development data
  // --------------------------------------------------

  await prisma.activityLog.deleteMany();
  await prisma.subscriptionEvent.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.organization.deleteMany();

  // --------------------------------------------------
  // Organization
  // --------------------------------------------------

  const organization = await prisma.organization.create({
    data: {
      name: "SaaSFlow",
      slug: "saasflow",
    },
  });

  // --------------------------------------------------
  // Users
  // --------------------------------------------------

  const admin = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: "Alex Morgan",
      email: "alex@saasflow.dev",
      passwordHash: "development-only-password-hash",
      role: "ADMIN",
      preferences: {
        theme: "light",
        timezone: "Asia/Kolkata",
      },
    },
  });

  const member = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: "Jordan Lee",
      email: "jordan@saasflow.dev",
      passwordHash: "development-only-password-hash",
      role: "MEMBER",
      preferences: {
        theme: "dark",
        timezone: "America/New_York",
      },
    },
  });

  // --------------------------------------------------
  // Plans
  // --------------------------------------------------

  const starterPlan = await prisma.plan.create({
    data: {
      organizationId: organization.id,
      name: "Starter",
      slug: "starter",
      description: "For small teams getting started.",
      price: 29,
      billingInterval: "MONTHLY",
    },
  });

  const growthPlan = await prisma.plan.create({
    data: {
      organizationId: organization.id,
      name: "Growth",
      slug: "growth",
      description: "For growing SaaS businesses.",
      price: 79,
      billingInterval: "MONTHLY",
    },
  });

  const scalePlan = await prisma.plan.create({
    data: {
      organizationId: organization.id,
      name: "Scale",
      slug: "scale",
      description: "For larger teams with advanced needs.",
      price: 199,
      billingInterval: "MONTHLY",
    },
  });

  // --------------------------------------------------
  // Customers
  // --------------------------------------------------

  const customerData = [
    {
      name: "Emma Wilson",
      email: "emma@northstar.io",
      companyName: "Northstar",
      country: "United States",
      status: "ACTIVE" as const,
      daysAgo: 240,
    },
    {
      name: "Liam Chen",
      email: "liam@orbitlabs.co",
      companyName: "Orbit Labs",
      country: "Canada",
      status: "ACTIVE" as const,
      daysAgo: 210,
    },
    {
      name: "Olivia Smith",
      email: "olivia@pixelworks.io",
      companyName: "PixelWorks",
      country: "United Kingdom",
      status: "ACTIVE" as const,
      daysAgo: 190,
    },
    {
      name: "Noah Brown",
      email: "noah@acmecloud.com",
      companyName: "Acme Cloud",
      country: "United States",
      status: "ACTIVE" as const,
      daysAgo: 170,
    },
    {
      name: "Ava Patel",
      email: "ava@brightpath.in",
      companyName: "BrightPath",
      country: "India",
      status: "ACTIVE" as const,
      daysAgo: 150,
    },
    {
      name: "Ethan Miller",
      email: "ethan@vertexapp.com",
      companyName: "Vertex",
      country: "Australia",
      status: "ACTIVE" as const,
      daysAgo: 130,
    },
    {
      name: "Sophia Davis",
      email: "sophia@flowbase.com",
      companyName: "Flowbase",
      country: "United States",
      status: "ACTIVE" as const,
      daysAgo: 110,
    },
    {
      name: "Lucas Martin",
      email: "lucas@monarch.dev",
      companyName: "Monarch",
      country: "France",
      status: "ACTIVE" as const,
      daysAgo: 90,
    },
    {
      name: "Mia Anderson",
      email: "mia@cloudnest.io",
      companyName: "CloudNest",
      country: "Germany",
      status: "ACTIVE" as const,
      daysAgo: 75,
    },
    {
      name: "James Taylor",
      email: "james@launchpad.io",
      companyName: "Launchpad",
      country: "United States",
      status: "ACTIVE" as const,
      daysAgo: 60,
    },
    {
      name: "Isabella Thomas",
      email: "isabella@greenfield.co",
      companyName: "Greenfield",
      country: "United Kingdom",
      status: "ACTIVE" as const,
      daysAgo: 45,
    },
    {
      name: "Benjamin Moore",
      email: "benjamin@redwood.app",
      companyName: "Redwood",
      country: "United States",
      status: "INACTIVE" as const,
      daysAgo: 300,
    },
  ];

  const customers = [];

  for (const data of customerData) {
    const customer = await prisma.customer.create({
      data: {
        organizationId: organization.id,
        name: data.name,
        email: data.email,
        companyName: data.companyName,
        country: data.country,
        status: data.status,
        joinedAt: new Date(
          `2026-${String(Math.max(1, 9 - Math.floor(data.daysAgo / 45))).padStart(2, "0")}-15T12:00:00Z`,
        ),
      },
    });

    customers.push(customer);
  }

  // --------------------------------------------------
  // Subscriptions
  // --------------------------------------------------

  const now = new Date("2026-09-11T12:00:00Z");

  const subscriptions = [
    {
      customer: customers[0],
      plan: growthPlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-04-03T12:00:00Z"),
    },
    {
      customer: customers[1],
      plan: growthPlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-05-08T12:00:00Z"),
    },
    {
      customer: customers[2],
      plan: scalePlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-05-18T12:00:00Z"),
    },
    {
      customer: customers[3],
      plan: growthPlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-06-06T12:00:00Z"),
    },
    {
      customer: customers[4],
      plan: starterPlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-06-21T12:00:00Z"),
    },
    {
      customer: customers[5],
      plan: growthPlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-07-02T12:00:00Z"),
    },
    {
      customer: customers[6],
      plan: scalePlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-07-19T12:00:00Z"),
    },
    {
      customer: customers[7],
      plan: starterPlan,
      status: "TRIAL" as const,
      startedAt: new Date("2026-08-01T12:00:00Z"),
    },
    {
      customer: customers[8],
      plan: growthPlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-08-09T12:00:00Z"),
    },
    {
      customer: customers[9],
      plan: starterPlan,
      status: "ACTIVE" as const,
      startedAt: new Date("2026-08-18T12:00:00Z"),
    },
    {
      customer: customers[10],
      plan: growthPlan,
      status: "PAST_DUE" as const,
      startedAt: new Date("2026-08-25T12:00:00Z"),
    },
    {
      customer: customers[11],
      plan: starterPlan,
      status: "CANCELLED" as const,
      startedAt: new Date("2026-04-22T12:00:00Z"),
    },
  ];

  const createdSubscriptions = [];

  for (const data of subscriptions) {
    const startedAt = data.startedAt;

    const currentPeriodStart = new Date(startedAt);
    const currentPeriodEnd = new Date(startedAt);
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        organizationId: organization.id,
        customerId: data.customer.id,
        planId: data.plan.id,
        status: data.status,
        startedAt,
        currentPeriodStart,
        currentPeriodEnd,
        cancelledAt:
          data.status === "CANCELLED" ? new Date("2026-08-20T12:00:00Z") : null,
        endedAt:
          data.status === "CANCELLED" ? new Date("2026-08-20T12:00:00Z") : null,
      },
    });

    createdSubscriptions.push(subscription);
  }

  const subscriptionEvents: Prisma.SubscriptionEventCreateManyInput[] =
    createdSubscriptions.map((subscription) => ({
      subscriptionId: subscription.id,
      userId: admin.id,
      eventType: "CREATED" as const,
      toPlanId: subscription.planId,
      toStatus: subscription.status,
      metadata: {
        source: "seed",
      },
      createdAt: subscription.startedAt,
    }));

  subscriptionEvents.push(
    {
      subscriptionId: createdSubscriptions[1].id,
      userId: admin.id,
      eventType: "PLAN_CHANGED" as const,
      fromPlanId: starterPlan.id,
      toPlanId: growthPlan.id,
      createdAt: new Date("2026-06-15T12:00:00Z"),
    },
    {
      subscriptionId: createdSubscriptions[2].id,
      userId: admin.id,
      eventType: "PLAN_CHANGED" as const,
      fromPlanId: growthPlan.id,
      toPlanId: scalePlan.id,
      createdAt: new Date("2026-07-10T12:00:00Z"),
    },
    {
      subscriptionId: createdSubscriptions[11].id,
      userId: admin.id,
      eventType: "CANCELLED" as const,
      fromStatus: "ACTIVE" as const,
      toStatus: "CANCELLED" as const,
      createdAt: new Date("2026-08-20T12:00:00Z"),
    },
  );

  await prisma.subscriptionEvent.createMany({
    data: subscriptionEvents,
  });

  // --------------------------------------------------
  // Transactions
  // --------------------------------------------------

  const transactionDates = [
    "2026-04-05",
    "2026-04-18",
    "2026-04-27",
    "2026-05-04",
    "2026-05-16",
    "2026-05-29",
    "2026-06-03",
    "2026-06-14",
    "2026-06-26",
    "2026-07-02",
    "2026-07-11",
    "2026-07-23",
    "2026-08-01",
    "2026-08-08",
    "2026-08-15",
    "2026-08-22",
    "2026-08-29",
    "2026-09-01",
    "2026-09-03",
    "2026-09-05",
    "2026-04-09",
    "2026-04-22",
    "2026-05-08",
    "2026-05-21",
    "2026-06-08",
    "2026-06-19",
    "2026-07-07",
    "2026-07-18",
    "2026-07-29",
    "2026-08-05",
    "2026-08-12",
    "2026-08-19",
    "2026-08-26",
    "2026-09-02",
    "2026-09-04",
    "2026-04-14",
    "2026-05-12",
    "2026-06-12",
    "2026-07-14",
    "2026-08-14",
  ];

  for (let i = 0; i < transactionDates.length; i++) {
    const subscriptionIndex = i % createdSubscriptions.length;
    const subscription = createdSubscriptions[subscriptionIndex];

    const plan =
      subscription.planId === starterPlan.id
        ? starterPlan
        : subscription.planId === growthPlan.id
          ? growthPlan
          : scalePlan;

    const occurredAt = new Date(`${transactionDates[i]}T12:00:00Z`);

    await prisma.transaction.create({
      data: {
        organizationId: organization.id,
        customerId: subscription.customerId,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: "USD",
        type: "CHARGE",
        status:
          i % 13 === 0 ? "FAILED" : i % 11 === 0 ? "PENDING" : "SUCCEEDED",
        description: `${plan.name} subscription payment`,
        occurredAt,
      },
    });
  }

  // --------------------------------------------------
  // Activity logs
  // --------------------------------------------------

  const activities = [
    {
      action: "CUSTOMER_CREATED",
      description: "Created customer account",
    },
    {
      action: "SUBSCRIPTION_UPDATED",
      description: "Updated subscription",
    },
    {
      action: "TRANSACTION_CREATED",
      description: "Created transaction",
    },
    {
      action: "SUBSCRIPTION_PLAN_CHANGED",
      description: "Changed subscription plan",
    },
    {
      action: "CUSTOMER_UPDATED",
      description: "Updated customer information",
    },
    {
      action: "SUBSCRIPTION_CANCELLED",
      description: "Cancelled subscription",
    },
  ];

  for (let i = 0; i < 20; i++) {
    const customer = customers[i % customers.length];

    await prisma.activityLog.create({
      data: {
        organizationId: organization.id,
        userId: i % 2 === 0 ? admin.id : member.id,
        action: activities[i % activities.length].action,
        description: `${activities[i % activities.length].description} for ${customer.name}`,
        entityType: "CUSTOMER",
        entityId: customer.id,
        metadata: {
          source: "seed",
        },
        createdAt: new Date(now.getTime() - i * 6 * 60 * 60 * 1000),
      },
    });
  }

  console.log("✅ Database seed completed");
  console.log(`Organization: ${organization.name}`);
  console.log(`Users: 2`);
  console.log(`Plans: 3`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Subscriptions: ${createdSubscriptions.length}`);
  console.log(`Transactions: 40`);
  console.log(`Activity logs: 20`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
