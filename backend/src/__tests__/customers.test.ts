import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { login } from "./helpers.js";

describe("Customer authorization", () => {
  it("allows members to create customers but only admins to delete them", async () => {
    const memberToken = await login("jordan@saasflow.dev");
    const adminToken = await login("alex@saasflow.dev");
    const email = `customer-${Date.now()}@example.com`;

    const createResponse = await request(app)
      .post("/api/customers")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        name: "Authorization Customer",
        email,
        companyName: "Authorization Test Co",
        country: "United States",
      });

    expect(createResponse.status).toBe(201);
    const customerId = createResponse.body.data.id as string;

    const memberDeleteResponse = await request(app)
      .delete(`/api/customers/${customerId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(memberDeleteResponse.status).toBe(403);

    const adminDeleteResponse = await request(app)
      .delete(`/api/customers/${customerId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(adminDeleteResponse.status).toBe(204);
  });
});
