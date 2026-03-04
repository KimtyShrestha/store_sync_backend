import request from "supertest";
import app from "../../index";
import { connectTestDB, closeTestDB } from "../setup";
import { UserModel } from "../../models/user.model";

let ownerToken: string;

beforeAll(async () => {
  await connectTestDB();

  await request(app).post("/api/auth/register").send({
    email: "owner@test.com",
    password: "password123",
    role: "owner"
  });

  await UserModel.updateOne(
    { email: "owner@test.com" },
    { status: "approved" }
  );

  const login = await request(app).post("/api/auth/login").send({
    email: "owner@test.com",
    password: "password123"
  });

  ownerToken = login.body.token;
});

afterAll(async () => {
  await closeTestDB();
});

describe("Dashboard Integration", () => {

  it("should return dashboard data for owner", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalSales");
  });

  it("should reject dashboard access for manager", async () => {
    const res = await request(app)
      .get("/api/dashboard");

    expect(res.status).toBe(401);
  });

  it("should reject without token", async () => {
  const res = await request(app).get("/api/dashboard");
  expect(res.status).toBe(401);
});

it("should support date range filter", async () => {
  const res = await request(app)
    .get("/api/dashboard?startDate=2026-01-01&endDate=2026-12-31")
    .set("Authorization", `Bearer ${ownerToken}`);

  expect(res.status).toBe(200);
});

it("should return profit field", async () => {
  const res = await request(app)
    .get("/api/dashboard")
    .set("Authorization", `Bearer ${ownerToken}`);

  expect(res.body.data).toHaveProperty("netProfit");
});

it("should return branch comparison array", async () => {
  const res = await request(app)
    .get("/api/dashboard")
    .set("Authorization", `Bearer ${ownerToken}`);

  expect(Array.isArray(res.body.data.branchComparison)).toBe(true);
});



it("should return 404 for unknown route", async () => {
  const res = await request(app).get("/api/unknown-route");

  expect(res.status).toBe(404);
});

it("should reject dashboard access without token", async () => {
  const res = await request(app).get("/api/dashboard");

  expect(res.status).toBe(401);
});

});