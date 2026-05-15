import { describe, expect, test, mock, beforeEach, afterAll } from "bun:test";
import { buildApp, mockPrisma } from "../setup";
import type { FastifyInstance } from "fastify";

// Mock Bun.password
const mockHash = mock().mockResolvedValue("hashed_password");
const mockVerify = mock().mockResolvedValue(true);
Bun.password = { hash: mockHash, verify: mockVerify } as any;

describe("Auth Routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    
    // Clear mocks before each test
    mockPrisma.user.findUnique.mockClear();
    mockPrisma.user.create.mockClear();
    mockPrisma.channel.create.mockClear();
    mockPrisma.$transaction.mockClear();
    mockHash.mockClear();
    mockVerify.mockClear();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe("POST /auth/signup", () => {
    const payload = {
      firstName: "John",
      lastName: "Doe",
      handle: "johndoe",
      email: "test@example.com",
      password: "password123",
    };

    test("returns 201 on successful signup", async () => {
      // Setup repo mocks
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // no existing user
      
      // Simulate transaction callback returning user
      mockPrisma.$transaction.mockImplementationOnce(async (callback: any) => {
        mockPrisma.user.create.mockResolvedValueOnce({ id: "user1", email: payload.email });
        return callback(mockPrisma);
      });

      const response = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe("User created successfully");
    });

    test("returns 400 on invalid input", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload: { email: "bad-email" }, // missing fields
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.code).toBe("VALIDATION_ERROR");
    });

    test("returns 409 if user already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "user1" }); // user exists

      const response = await app.inject({
        method: "POST",
        url: "/auth/signup",
        payload,
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.code).toBe("CONFLICT");
    });
  });

  describe("POST /auth/signin", () => {
    const payload = {
      email: "test@example.com",
      password: "password123",
    };

    test("returns 200 and sets cookie on success", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "user1", password: "hashed_password" });
      mockVerify.mockResolvedValueOnce(true);

      const response = await app.inject({
        method: "POST",
        url: "/auth/signin",
        payload,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBe("Login successful");
      
      // Check for set-cookie header
      const cookies = response.headers["set-cookie"] as string[];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("access_token=");
    });

    test("returns 401 on bad credentials", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "POST",
        url: "/auth/signin",
        payload,
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.code).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /auth/signout", () => {
    test("returns 200 and clears cookie when authenticated", async () => {
      // First generate a real token to bypass jwtVerify
      const token = app.jwt.sign({ id: "user1" });

      const response = await app.inject({
        method: "POST",
        url: "/auth/signout",
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      
      const cookies = response.headers["set-cookie"] as string[];
      expect(cookies[0]).toContain("access_token=;"); // cleared cookie
    });

    test("returns error when not authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/signout",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /auth/me", () => {
    test("returns user when authenticated", async () => {
      const token = app.jwt.sign({ id: "user1" });
      
      mockPrisma.user.findUnique.mockResolvedValueOnce({ 
        id: "user1", 
        email: "test@example.com",
        firstName: "John"
      });

      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe("user1");
    });

    test("returns error when not authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/auth/me",
      });

      expect(response.statusCode).toBe(401);
    });
  });
  
  describe("GET /health", () => {
    test("returns 200", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("ok");
    });
  });
});
