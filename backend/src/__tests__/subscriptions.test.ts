import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { getSeededResources, login } from "./helpers.js";

describe("Subscription authorization and business rules", () => {
  it("enforces role and duplicate active subscription rules", async () => {
    const memberToken = await login("jordan@saasflow.dev");
    const adminToken = await login("alex@saasflow.dev");
    const resources = await getSeededResources(adminToken);
    const customerResponse = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        name: "Subscription Test Customer",
        email: `subscription-${Date.now()}@example.com`,
      });
    expect(customerResponse.status).toBe(201);

    const customerId = customerResponse.body.data.id as string;
    const planId = resources.plans[0].id as string;
    const subscriptionData = { customerId, planId, status: "ACTIVE" };

    const memberCreateResponse = await request(app)
      .post("/api/subscriptions")
      .set("Authorization", `Bearer ${memberToken}`)
      .send(subscriptionData);
    expect(memberCreateResponse.status).toBe(403);

    const adminCreateResponse = await request(app)
      .post("/api/subscriptions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(subscriptionData);
    expect(adminCreateResponse.status).toBe(201);
    const subscriptionId = adminCreateResponse.body.data.id as string;

    const duplicateResponse = await request(app)
      .post("/api/subscriptions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(subscriptionData);
    expect(duplicateResponse.status).toBe(409);

    const cancelResponse = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(cancelResponse.status).toBe(200);

    const repeatCancelResponse = await request(app)
      .post(`/api/subscriptions/${subscriptionId}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(repeatCancelResponse.status).toBe(400);
  });
});
