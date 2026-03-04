import request from "supertest";
import app from "../../index";
import { connectTestDB, closeTestDB } from "../setup";
import { UserModel } from "../../models/user.model";

let ownerToken: string;
let branchId: string;

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

describe("Branch Integration", () => {

  it("should create branch", async () => {
    const res = await request(app)
      .post("/api/branch/create")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Branch 1",
        location: "Kathmandu"
      });

    branchId = res.body.data._id;

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("should fetch branches", async () => {
    const res = await request(app)
      .get("/api/branch/my-branches")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should reject branch creation without token", async () => {
    const res = await request(app)
      .post("/api/branch/create")
      .send({ name: "X", location: "Y" });

    expect(res.status).toBe(401);
  });

  

  it("should reject invalid branch ID on delete", async () => {
    const res = await request(app)
      .delete("/api/branch/invalidid")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("should reject branch creation without name", async () => {
  const res = await request(app)
    .post("/api/branch/create")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({});

  expect(res.status).toBeGreaterThanOrEqual(400);
});

it("should reject branch creation without token", async () => {
  const res = await request(app)
    .post("/api/branch/create")
    .send({ name: "NoAuth", location: "KTm" });

  expect(res.status).toBe(401);
});



it("should reject invalid branch ID format", async () => {
  const res = await request(app)
    .delete("/api/branch/notanid")
    .set("Authorization", `Bearer ${ownerToken}`);

  expect(res.status).toBeGreaterThanOrEqual(400);
});

});