import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";
import { login } from "./helpers.js";

describe("Plan authorization", () => {
  it("restricts plan mutations to admins", async () => {
    const memberToken = await login("jordan@saasflow.dev");
    const adminToken = await login("alex@saasflow.dev");
    const slug = `authorization-${Date.now()}`;
    const planData = {
      name: "Authorization Plan",
      slug,
      price: 49,
      billingInterval: "MONTHLY",
    };

    const memberCreateResponse = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${memberToken}`)
      .send(planData);
    expect(memberCreateResponse.status).toBe(403);

    const adminCreateResponse = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(planData);
    expect(adminCreateResponse.status).toBe(201);
    const planId = adminCreateResponse.body.data.id as string;

    const memberPatchResponse = await request(app)
      .patch(`/api/plans/${planId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ price: 59 });
    expect(memberPatchResponse.status).toBe(403);

    const adminPatchResponse = await request(app)
      .patch(`/api/plans/${planId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 59 });
    expect(adminPatchResponse.status).toBe(200);

    const memberDeleteResponse = await request(app)
      .delete(`/api/plans/${planId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    expect(memberDeleteResponse.status).toBe(403);

    const adminDeleteResponse = await request(app)
      .delete(`/api/plans/${planId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminDeleteResponse.status).toBe(200);
  });
});
