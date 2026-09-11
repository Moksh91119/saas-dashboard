import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { registerOrganization } from "./helpers.js";

describe("Tenant isolation", () => {
  it("hides customers, plans, subscriptions, transactions, and activity across organizations", async () => {
    const organizationAToken = await registerOrganization("TenantA");
    const organizationBToken = await registerOrganization("TenantB");

    const customerResponse = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${organizationAToken}`)
      .send({
        name: "Tenant A Customer",
        email: `tenant-a-${Date.now()}@example.com`,
      });
    expect(customerResponse.status).toBe(201);
    const customerId = customerResponse.body.data.id as string;

    const planResponse = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${organizationAToken}`)
      .send({
        name: "Tenant A Plan",
        slug: `tenant-a-${Date.now()}`,
        price: 99,
        billingInterval: "MONTHLY",
      });
    expect(planResponse.status).toBe(201);
    const planId = planResponse.body.data.id as string;

    const subscriptionResponse = await request(app)
      .post("/api/subscriptions")
      .set("Authorization", `Bearer ${organizationAToken}`)
      .send({ customerId, planId, status: "ACTIVE" });
    expect(subscriptionResponse.status).toBe(201);
    const subscriptionId = subscriptionResponse.body.data.id as string;

    const transactionResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${organizationAToken}`)
      .send({
        customerId,
        subscriptionId,
        amount: 99,
        currency: "USD",
        type: "CHARGE",
        status: "SUCCEEDED",
      });
    expect(transactionResponse.status).toBe(201);
    const transactionId = transactionResponse.body.data.id as string;

    const activitiesResponse = await request(app)
      .get("/api/activity?limit=100")
      .set("Authorization", `Bearer ${organizationAToken}`);
    expect(activitiesResponse.status).toBe(200);
    const activityId = activitiesResponse.body.data.activities[0].id as string;

    const hiddenResourceRequests = [
      request(app).get(`/api/customers/${customerId}`),
      request(app).get(`/api/plans/${planId}`),
      request(app).get(`/api/subscriptions/${subscriptionId}`),
      request(app).get(`/api/transactions/${transactionId}`),
      request(app).get(`/api/activity/${activityId}`),
    ];

    for (const resourceRequest of hiddenResourceRequests) {
      const response = await resourceRequest.set(
        "Authorization",
        `Bearer ${organizationBToken}`,
      );
      expect(response.status).toBe(404);
    }
  });
});
