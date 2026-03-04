import request from "supertest";
import app from "../../index";
import { connectTestDB, closeTestDB } from "../setup";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Security Tests", () => {

  it("should reject malformed JWT", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", "Bearer malformed.jwt.token");

    expect(res.status).toBe(401);
  });

  it("should reject access to owner routes without role", async () => {
    const res = await request(app)
      .post("/api/owner/create-manager");

    expect(res.status).toBe(401);
  });

  it("should reject branch access without token", async () => {
    const res = await request(app)
      .get("/api/branch/my-branches")

    expect(res.status).toBe(401);
  });

  it("should reject daily record without manager role", async () => {
    const res = await request(app)
      .post("/api/daily-record/today")

    expect(res.status).toBe(401);
  });

  it("should reject invalid endpoint", async () => {
    const res = await request(app).get("/api/nonexistent");
    expect(res.status).toBe(404);
  });

  it("should return 404 for completely unknown endpoint", async () => {
  const res = await request(app).get("/api/this-route-does-not-exist");

  expect(res.status).toBe(404);
});

});