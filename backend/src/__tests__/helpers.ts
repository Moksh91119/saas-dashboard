import request from "supertest";
import app from "../app.js";

export const seededPassword = "saasflow-dev-password";

export async function login(email: string, password = seededPassword) {
  const response = await request(app).post("/api/auth/login").send({
    email,
    password,
  });

  expectSuccessful(response, 200);
  return response.body.data.token as string;
}

export async function registerOrganization(label: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      organizationName: `${label} Organization`,
      organizationSlug: `${label.toLowerCase()}-${suffix}`,
      name: `${label} Admin`,
      email: `${label.toLowerCase()}-${suffix}@example.com`,
      password: "test-password-123",
    });

  expectSuccessful(response, 201);
  return response.body.data.token as string;
}

export function expectSuccessful(
  response: { status: number; body: unknown },
  status: number,
) {
  if (response.status !== status) {
    throw new Error(
      `Expected status ${status}, received ${response.status}: ${JSON.stringify(response.body)}`,
    );
  }
}

export async function getSeededResources(token: string) {
  const [customersResponse, plansResponse, subscriptionsResponse] =
    await Promise.all([
      request(app)
        .get("/api/customers?limit=100")
        .set("Authorization", `Bearer ${token}`),
      request(app).get("/api/plans").set("Authorization", `Bearer ${token}`),
      request(app)
        .get("/api/subscriptions")
        .set("Authorization", `Bearer ${token}`),
    ]);

  expectSuccessful(customersResponse, 200);
  expectSuccessful(plansResponse, 200);
  expectSuccessful(subscriptionsResponse, 200);

  return {
    customers: customersResponse.body.data.customers,
    plans: plansResponse.body.data,
    subscriptions: subscriptionsResponse.body.data,
  };
}
