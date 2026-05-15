import { describe, expect, test, mock, beforeEach } from "bun:test";
import authRepo from "../../src/modules/auth/auth.repo";
import { AppError } from "../../src/utils/errors/app-error";
import { Prisma } from "../../src/generated/prisma/client";

const mockPrisma = {
  user: {
    findUnique: mock(),
    create: mock(),
  },
  channel: {
    create: mock(),
  },
  $transaction: mock(),
} as any;

describe("Auth Repo", () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockClear();
    mockPrisma.user.create.mockClear();
    mockPrisma.channel.create.mockClear();
    mockPrisma.$transaction.mockClear();
  });

  describe("getUserByEmail", () => {
    test("calls prisma.user.findUnique with correct args", async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: "1" });
      
      const result = await authRepo.getUserByEmail(mockPrisma, "test@example.com");
      
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        select: expect.anything(),
      });
      expect(result).toEqual({ id: "1" });
    });
  });

  describe("getUserWithPasswordByEmail", () => {
    test("calls prisma.user.findUnique without select restriction", async () => {
      await authRepo.getUserWithPasswordByEmail(mockPrisma, "test@example.com");
      
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("createUser", () => {
    test("creates user and excludes handle", async () => {
      await authRepo.createUser(mockPrisma, {
        firstName: "John",
        lastName: "Doe",
        handle: "johndoe",
        email: "test@example.com",
        password: "password123",
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "test@example.com",
          password: "password123",
        },
        select: expect.anything(),
      });
    });
  });

  describe("createUserWithChannel", () => {
    const input = {
      firstName: "John",
      lastName: "Doe",
      handle: "John Doe Channel!!!",
      email: "test@example.com",
      password: "password123",
    };

    test("throws validation error for invalid handle after slugify", async () => {
      let caughtError;
      try {
        await authRepo.createUserWithChannel(mockPrisma, { ...input, handle: "---" });
      } catch (err) {
        caughtError = err;
      }
      expect(caughtError).toBeInstanceOf(AppError);
      expect((caughtError as AppError).code).toBe("VALIDATION_ERROR");
    });

    test("executes transaction to create user and channel", async () => {
      // Mock transaction to immediately invoke the callback
      mockPrisma.$transaction.mockImplementationOnce(async (callback: any) => {
        return callback(mockPrisma);
      });

      mockPrisma.user.create.mockResolvedValueOnce({ id: "user1" });
      mockPrisma.channel.create.mockResolvedValueOnce({ id: "channel1" });

      const result = await authRepo.createUserWithChannel(mockPrisma, input);

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.channel.create).toHaveBeenCalledWith({
        data: {
          handle: "john-doe-channel", // testing the slugifyHandle logic
          name: "John Doe",
          links: [],
          userId: "user1",
        }
      });
      expect(result).toEqual({ id: "user1" });
    });

    test("handles P2002 unique constraint errors", async () => {
      const p2002Error = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.8.0",
        meta: { target: ["email"] }
      });

      mockPrisma.$transaction.mockRejectedValueOnce(p2002Error);

      let caughtError;
      try {
        await authRepo.createUserWithChannel(mockPrisma, input);
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(AppError);
      expect((caughtError as AppError).code).toBe("CONFLICT");
      expect((caughtError as AppError).message).toBe("Email already exists");
    });
  });

  describe("getUserById", () => {
    test("calls prisma.user.findUnique by id", async () => {
      await authRepo.getUserById(mockPrisma, "user1");
      
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user1" },
        select: expect.anything(),
      });
    });
  });
});
