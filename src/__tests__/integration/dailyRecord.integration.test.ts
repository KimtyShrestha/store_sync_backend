import request from "supertest";
import app from "../../index";
import { connectTestDB, closeTestDB } from "../setup";
import { UserModel } from "../../models/user.model";
import { BranchModel } from "../../models/branch.model";

let ownerToken: string;
let managerToken: string;

beforeAll(async () => {
  await connectTestDB();

  // Create owner
  await request(app).post("/api/auth/register").send({
    email: "owner@test.com",
    password: "password123",
    role: "owner"
  });

  await UserModel.updateOne(
    { email: "owner@test.com" },
    { status: "approved" }
  );

  const ownerLogin = await request(app).post("/api/auth/login").send({
    email: "owner@test.com",
    password: "password123"
  });

  ownerToken = ownerLogin.body.token;

  // Create branch
  const branchRes = await request(app)
    .post("/api/branch/create")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      name: "Test Branch",
      location: "Kathmandu"
    });

  const branchId = branchRes.body.data._id;

  // Create manager via owner route
  await request(app)
    .post("/api/owner/create-manager")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({
      firstName: "Manager",
      lastName: "One",
      email: "manager@test.com",
      password: "password123"
    });

  // Approve manager (just in case)
  await UserModel.updateOne(
    { email: "manager@test.com" },
    { status: "approved" }
  );

  const managerLogin = await request(app).post("/api/auth/login").send({
    email: "manager@test.com",
    password: "password123"
  });

  managerToken = managerLogin.body.token;

  const managerId = managerLogin.body.data._id;

  //  THIS IS THE IMPORTANT PART
  await BranchModel.findByIdAndUpdate(branchId, {
    managerId: managerId
  });
});

describe("Daily Record Integration", () => {

  it("should allow manager to create daily record", async () => {
    const res = await request(app)
      .post("/api/daily-record/today")
      .set("Authorization", `Bearer ${managerToken}`)
      .send({
        salesItems: [
          { itemName: "Shirt", quantity: 5, price: 1000 }
        ],
        expenseItems: [
          { category: "Electricity", quantity: 1, price: 2000 }
        ],
        purchaseItems: [
          { category: "Stock", quantity: 10, price: 500 }
        ]
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSales).toBe(5000);
  });

  it("should reject daily record without token", async () => {
    const res = await request(app)
      .post("/api/daily-record/today")
      .send({});

    expect(res.status).toBe(401);
  });

  it("should reject owner creating daily record", async () => {
    const res = await request(app)
      .post("/api/daily-record/today")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({});

    expect(res.status).toBe(403);
  });

  it("should calculate totals correctly", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer ${managerToken}`)
    .send({
      salesItems: [
        { itemName: "A", quantity: 2, price: 100 }
      ],
      expenseItems: [],
      purchaseItems: []
    });

  expect(res.body.data.totalSales).toBe(200);
});

it("should reject negative quantity", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer ${managerToken}`)
    .send({
      salesItems: [
        { itemName: "A", quantity: -2, price: 100 }
      ]
    });

  expect(res.status).toBeGreaterThanOrEqual(400);
});

it("should reject missing salesItems", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer ${managerToken}`)
    .send({});

  expect(res.status).toBeGreaterThanOrEqual(400);
});

it("should prevent owner from accessing manager daily record", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer ${ownerToken}`)
    .send({});

  expect(res.status).toBe(403);
});

it("should update existing daily record for same date", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer ${managerToken}`)
    .send({
      salesItems: [
        { itemName: "B", quantity: 1, price: 100 }
      ]
    });

  expect(res.status).toBe(200);
});

it("should reject invalid token", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer invalidtoken`)
    .send({});

  expect(res.status).toBe(401);
});

it("should reject missing date", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer ${managerToken}`)
    .send({ salesItems: [] });

  expect(res.status).toBeGreaterThanOrEqual(400);
});

it("should reject zero quantity", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer ${managerToken}`)
    .send({
      salesItems: [{ quantity: 0, price: 100 }]
    });

  expect(res.status).toBeGreaterThanOrEqual(400);
});

it("should reject negative price", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .set("Authorization", `Bearer ${managerToken}`)
    .send({
      salesItems: [{ quantity: 5, price: -100 }]
    });

  expect(res.status).toBeGreaterThanOrEqual(400);
});


it("should reject daily record without Authorization header", async () => {
  const res = await request(app)
    .post("/api/daily-record/today")
    .send({
      salesItems: [{ quantity: 1, price: 100 }]
    });

  expect(res.status).toBe(401);
});



});
