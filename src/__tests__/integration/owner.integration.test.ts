import request from "supertest";
import app from "../../index";
import { connectTestDB, closeTestDB } from "../setup";
import { UserModel } from "../../models/user.model";

let token: string;

beforeAll(async () => {
  await connectTestDB();

  // Register owner
  await request(app).post("/api/auth/register").send({
    email: "owner@test.com",
    password: "password123",
    role: "owner",
  });

  // Approve owner
  await UserModel.updateOne(
    { email: "owner@test.com" },
    { status: "approved" }
  );

  // Login owner
  const login = await request(app).post("/api/auth/login").send({
    email: "owner@test.com",
    password: "password123",
  });

  token = login.body.token;

  if (!token) {
    throw new Error("Owner login failed. Token not generated.");
  }
});

afterAll(async () => {
  await closeTestDB();
});

describe("Owner Routes", () => {

  it("should create manager", async () => {
    const res = await request(app)
      .post("/api/owner/create-manager")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "manager1@test.com",
        password: "password123",
      });

    expect(res.status).toBe(200); // change to 201 if needed
    expect(res.body.success).toBe(true);
  });

  it("should deny access without token", async () => {
    const res = await request(app)
      .get("/api/owner/managers");

    expect(res.status).toBe(401);
  });

  it("should reject create-manager without token", async () => {
    const res = await request(app)
      .post("/api/owner/create-manager")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "noauth@test.com",
        password: "password123"
      });

    expect(res.status).toBe(401);
  });

  it("should deny access with invalid role", async () => {
    // Register manager
    await request(app).post("/api/auth/register").send({
      email: "manager2@test.com",
      password: "password123",
      role: "manager",
    });

    // Approve manager
    await UserModel.updateOne(
      { email: "manager2@test.com" },
      { status: "approved" }
    );

    const login = await request(app).post("/api/auth/login").send({
      email: "manager2@test.com",
      password: "password123",
    });

    const managerToken = login.body.token;

    const res = await request(app)
      .get("/api/owner/managers")
      .set("Authorization", `Bearer ${managerToken}`);

    expect([401, 403]).toContain(res.status);
  });

});