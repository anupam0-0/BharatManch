import { describe, expect, test, beforeEach, afterAll } from "bun:test";
import { buildApp, mockPrisma } from "../setup";
import type { FastifyInstance } from "fastify";

describe("Channel Routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
    
    mockPrisma.channel.findUnique.mockClear();
    mockPrisma.channel.findFirst.mockClear();
    mockPrisma.channel.update.mockClear();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe("GET /channels/me", () => {
    test("returns channel for authenticated user", async () => {
      const token = app.jwt.sign({ id: "user1" });
      
      mockPrisma.channel.findUnique.mockResolvedValueOnce({ 
        id: "channel1", 
        userId: "user1",
        handle: "mychannel"
      });

      const response = await app.inject({
        method: "GET",
        url: "/channels/me",
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe("channel1");
      expect(mockPrisma.channel.findUnique).toHaveBeenCalledWith({
        where: { userId: "user1" }
      });
    });

    test("returns 401 without token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/channels/me",
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("GET /channels/:handle", () => {
    test("returns channel by handle", async () => {
      mockPrisma.channel.findFirst.mockResolvedValueOnce({ 
        id: "channel2", 
        handle: "somechannel"
      });

      const response = await app.inject({
        method: "GET",
        url: "/channels/somechannel",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.handle).toBe("somechannel");
      expect(mockPrisma.channel.findFirst).toHaveBeenCalledWith({
        where: { handle: "somechannel" }
      });
    });

    test("returns null/empty if channel not found", async () => {
      mockPrisma.channel.findFirst.mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "GET",
        url: "/channels/unknown",
      });

      expect(response.statusCode).toBe(200); // the controller currently returns null directly
      const body = JSON.parse(response.body);
      expect(body).toBeNull();
    });
  });

  describe("GET /channels/:handle/videos", () => {
    test("returns channel videos (currently returns channel)", async () => {
      mockPrisma.channel.findFirst.mockResolvedValueOnce({ 
        id: "channel2", 
        handle: "somechannel"
      });

      const response = await app.inject({
        method: "GET",
        url: "/channels/somechannel/videos",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.handle).toBe("somechannel"); // The controller currently calls getChannelByHandle
    });
  });

  describe("PUT /channels/me", () => {
    const payload = {
      name: "New Name",
      description: "New description"
    };

    test("updates and returns channel for authenticated user", async () => {
      const token = app.jwt.sign({ id: "user1" });
      
      mockPrisma.channel.update.mockResolvedValueOnce({ 
        id: "channel1", 
        userId: "user1",
        name: "New Name",
        description: "New description"
      });

      const response = await app.inject({
        method: "PUT",
        url: "/channels/me",
        payload,
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.name).toBe("New Name");
      expect(mockPrisma.channel.update).toHaveBeenCalledWith({
        where: { userId: "user1" },
        data: payload
      });
    });

    test("returns 400 on invalid payload", async () => {
      const token = app.jwt.sign({ id: "user1" });
      
      const response = await app.inject({
        method: "PUT",
        url: "/channels/me",
        payload: {
          name: "", // min length 1
        },
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.code).toBe("VALIDATION_ERROR");
    });

    test("returns 401 without token", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/channels/me",
        payload
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
