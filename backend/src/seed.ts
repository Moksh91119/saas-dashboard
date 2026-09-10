import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

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
        joinedAt: new Date(Date.now() - data.daysAgo * 24 * 60 * 60 * 1000),
      },
    });

    customers.push(customer);
  }

  // --------------------------------------------------
  // Subscriptions
  // --------------------------------------------------

  const now = new Date();

  const subscriptions = [
    {
      customer: customers[0],
      plan: growthPlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[1],
      plan: starterPlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[2],
      plan: scalePlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[3],
      plan: growthPlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[4],
      plan: starterPlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[5],
      plan: growthPlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[6],
      plan: scalePlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[7],
      plan: starterPlan,
      status: "TRIAL" as const,
    },
    {
      customer: customers[8],
      plan: growthPlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[9],
      plan: starterPlan,
      status: "ACTIVE" as const,
    },
    {
      customer: customers[10],
      plan: growthPlan,
      status: "PAST_DUE" as const,
    },
    {
      customer: customers[11],
      plan: starterPlan,
      status: "CANCELLED" as const,
    },
  ];

  const createdSubscriptions = [];

  for (const data of subscriptions) {
    const startedAt = new Date(
      now.getTime() - Math.floor(Math.random() * 150) * 24 * 60 * 60 * 1000,
    );

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
          data.status === "CANCELLED"
            ? new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
            : null,
        endedAt:
          data.status === "CANCELLED"
            ? new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
            : null,
      },
    });

    createdSubscriptions.push(subscription);

    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: subscription.id,
        userId: admin.id,
        eventType: "CREATED",
        toPlanId: data.plan.id,
        toStatus: data.status,
        metadata: {
          source: "seed",
        },
      },
    });
  }

  // --------------------------------------------------
  // Transactions
  // --------------------------------------------------

  for (let i = 0; i < 40; i++) {
    const subscriptionIndex = i % createdSubscriptions.length;
    const subscription = createdSubscriptions[subscriptionIndex];

    const plan =
      subscription.planId === starterPlan.id
        ? starterPlan
        : subscription.planId === growthPlan.id
          ? growthPlan
          : scalePlan;

    const occurredAt = new Date(
      now.getTime() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000,
    );

    await prisma.transaction.create({
      data: {
        organizationId: organization.id,
        customerId: subscription.customerId,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: "USD",
        type: "CHARGE",
        status: i % 13 === 0 ? "FAILED" : "SUCCEEDED",
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
