import request from "supertest";
import app from "../index"; // adjust path

describe("Application Initialization", () => {
  it("should return welcome message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Welcome to the API");
  });

  it("should return welcome message on root", async () => {
  const res = await request(app).get("/");

  expect(res.status).toBe(200);
  expect(res.body.message).toBeDefined();
  });

});