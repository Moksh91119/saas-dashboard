import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("Authentication", () => {
  it("rejects /auth/me without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  it("logs in the seeded admin", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "alex@saasflow.dev",
      password: "saasflow-dev-password",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
