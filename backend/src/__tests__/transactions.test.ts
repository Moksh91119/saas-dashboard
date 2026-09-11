import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { getSeededResources, login, registerOrganization } from "./helpers.js";

describe("Transaction authorization and business rules", () => {
  it("rejects unauthorized and cross-tenant transaction writes", async () => {
    const memberToken = await login("jordan@saasflow.dev");
    const adminToken = await login("alex@saasflow.dev");
    const resources = await getSeededResources(adminToken);
    const subscriptionId = resources.subscriptions[0].id as string;
    const customerId = resources.subscriptions[0].customerId as string;
    const mismatchCustomerId = resources.customers.find(
      (customer: { id: string }) => customer.id !== customerId,
    ).id as string;
    const transactionData = {
      customerId,
      subscriptionId,
      amount: 29,
      currency: "USD",
      type: "CHARGE",
      status: "SUCCEEDED",
    };

    const memberResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${memberToken}`)
      .send(transactionData);
    expect(memberResponse.status).toBe(403);

    const adminResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(transactionData);
    expect(adminResponse.status).toBe(201);

    const otherOrganizationToken =
      await registerOrganization("TransactionOther");
    const otherCustomerResponse = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${otherOrganizationToken}`)
      .send({
        name: "Other Organization Customer",
        email: `other-transaction-${Date.now()}@example.com`,
      });
    expect(otherCustomerResponse.status).toBe(201);

    const crossTenantResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...transactionData,
        customerId: otherCustomerResponse.body.data.id,
        subscriptionId: undefined,
      });
    expect(crossTenantResponse.status).toBe(404);

    const mismatchResponse = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        ...transactionData,
        customerId: mismatchCustomerId,
      });
    expect(mismatchResponse.status).toBe(404);
  });
});
