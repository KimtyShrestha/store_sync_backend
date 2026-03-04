import request from "supertest";
import app from "../../index";
import { connectTestDB, closeTestDB } from "../setup";
import { UserModel } from "../../models/user.model";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Authentication Integration", () => {

  it("should register a new owner", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "owner@test.com",
        password: "password123",
        role: "owner"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should reject missing email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        password: "password123"
      });

    expect(res.status).toBe(400);
  });

  it("should login approved owner", async () => {
    await UserModel.updateOne(
      { email: "owner@test.com" },
      { status: "approved" }
    );

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "owner@test.com",
        password: "password123"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it("should reject login if not approved", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        email: "pending@test.com",
        password: "password123",
        role: "owner"
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "pending@test.com",
        password: "password123"
      });

    expect(res.status).toBe(403);
  });

  it("should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "owner@test.com",
        password: "wrongpassword"
      });

    expect(res.status).toBe(401);
  });

  it("should reject duplicate registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "owner@test.com",
        password: "password123",
        role: "owner"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("should reject invalid email format", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "invalid-email",
        password: "password123",
        role: "owner"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("should reject short password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "short@test.com",
        password: "123",
        role: "owner"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("should reject missing role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "norole@test.com",
        password: "password123"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("should reject login without password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "owner@test.com"
      });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

});