import { describe, it, expect, beforeEach, afterAll } from "bun:test";
import { userRoutes } from "../src/routes/user-routes";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

// Helper function to process requests easily through Elysia
const req = (path: string, options?: RequestInit) => {
  const url = `http://localhost${path}`; // The host doesn't matter for local .handle()
  return userRoutes.handle(new Request(url, options));
};

describe("User API Endpoints", () => {
  beforeEach(async () => {
    // Clear data before each test for consistency
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("POST /api/users", () => {
    it("should register a user successfully", async () => {
      const response = await req("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@gmail.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty("message", "User created successfully");
    });

    it("should fail if email is already registered", async () => {
      // First registration
      await req("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "duplicate@gmail.com",
          password: "password123",
        }),
      });

      // Second registration with same email
      const response = await req("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Another User",
          email: "duplicate@gmail.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data).toHaveProperty("message", "User already exists");
    });

    it("should fail validation if name is too long", async () => {
      const response = await req("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "A".repeat(300),
          email: "longname@gmail.com",
          password: "password123",
        }),
      });

      // TypeBox Validation error returns 422
      expect(response.status).toBe(422);
    });

    it("should fail validation if email is invalid format", async () => {
      const response = await req("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "not-an-email",
          password: "password123",
        }),
      });

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/login", () => {
    beforeEach(async () => {
      // Create a user to test login against
      await req("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Login User",
          email: "login@gmail.com",
          password: "password123",
        }),
      });
    });

    it("should login successfully and return a token", async () => {
      const response = await req("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "login@gmail.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("message", "Login successful");
      expect(data).toHaveProperty("token");
      expect(typeof data.token).toBe("string");
    });

    it("should fail if email is not registered", async () => {
      const response = await req("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "unknown@gmail.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty("message", "User not found");
    });

    it("should fail if password is wrong", async () => {
      const response = await req("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "login@gmail.com",
          password: "wrongpassword",
        }),
      });

      // Currently implemented as 404 User not found when credentials don't match
      expect(response.status).toBe(404); 
    });
  });

  describe("GET /api/users (Protected)", () => {
    let validToken = "";

    beforeEach(async () => {
      const regRes = await req("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Fetch User",
          email: "fetch@gmail.com",
          password: "password123",
        }),
      });

      const loginRes = await req("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "fetch@gmail.com",
          password: "password123",
        }),
      });
      const data = await loginRes.json();
      validToken = data.token;
    });

    it("should successfully fetch users with a valid token", async () => {
      const response = await req("/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("data");
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data[0].email).toBe("fetch@gmail.com");
    });

    it("should fail if Authorization header is missing", async () => {
      const response = await req("/api/users", {
        method: "GET",
      });

      expect(response.status).toBe(401);
    });

    it("should fail if token is invalid", async () => {
      const response = await req("/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer fake-token-123`,
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/logout (Protected)", () => {
    let validToken = "";

    beforeEach(async () => {
      const regRes = await req("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Logout User",
          email: "logout@gmail.com",
          password: "password123",
        }),
      });

      const loginRes = await req("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "logout@gmail.com",
          password: "password123",
        }),
      });
      const data = await loginRes.json();
      validToken = data.token;
    });

    it("should successfully logout and invalidate token", async () => {
      // 1. Hit logout
      const logoutRes = await req("/api/logout", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      expect(logoutRes.status).toBe(200);
      const logoutData = await logoutRes.json();
      expect(logoutData).toHaveProperty("message", "Logout successful");

      // 2. Try fetching users again, should fail now
      const fetchRes = await req("/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });

      expect(fetchRes.status).toBe(401);
    });

    it("should fail logout if token is invalid", async () => {
      const response = await req("/api/logout", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer invalid-token`,
        },
      });

      expect(response.status).toBe(401);
    });
  });
});
