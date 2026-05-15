import { describe, expect, test, mock, beforeEach } from "bun:test";

// Mock the repo first before importing services
const mockRepo = {
  getUserWithPasswordByEmail: mock(),
  createUserWithChannel: mock(),
  getUserById: mock(),
};

mock.module("../../src/modules/auth/auth.repo.ts", () => ({
  default: mockRepo
}));

import authServices from "../../src/modules/auth/auth.services";
import { AppError } from "../../src/utils/errors/app-error";
import type { PrismaClient } from "../../src/generated/prisma/client";

// Mock Bun.password
const mockHash = mock().mockResolvedValue("hashed_password");
const mockVerify = mock().mockResolvedValue(true);

const originalBunPassword = Bun.password;
Bun.password = {
  hash: mockHash,
  verify: mockVerify,
} as any;


describe("Auth Services", () => {
  const mockPrisma = {} as PrismaClient;

  beforeEach(() => {
    mockRepo.getUserWithPasswordByEmail.mockClear();
    mockRepo.createUserWithChannel.mockClear();
    mockRepo.getUserById.mockClear();
    mockHash.mockClear();
    mockVerify.mockClear();
  });

  describe("userSignup", () => {
    const input = {
      firstName: "John",
      lastName: "Doe",
      handle: "johndoe",
      email: "Test@Example.com",
      password: "password123",
    };

    test("throws CONFLICT if user already exists", async () => {
      mockRepo.getUserWithPasswordByEmail.mockResolvedValueOnce({ id: "123" });

      let caughtError;
      try {
        await authServices.userSignup(mockPrisma, input);
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(AppError);
      expect((caughtError as AppError).code).toBe("CONFLICT");
      expect(mockRepo.getUserWithPasswordByEmail).toHaveBeenCalledWith(mockPrisma, "test@example.com");
    });

    test("hashes password and creates user if email is unique", async () => {
      mockRepo.getUserWithPasswordByEmail.mockResolvedValueOnce(null);
      mockRepo.createUserWithChannel.mockResolvedValueOnce({ id: "123", email: "test@example.com" });

      const result = await authServices.userSignup(mockPrisma, input);

      expect(mockHash).toHaveBeenCalledWith("password123");
      expect(mockRepo.createUserWithChannel).toHaveBeenCalledWith(mockPrisma, {
        ...input,
        email: "test@example.com",
        password: "hashed_password",
      });
      expect(result).toEqual({ id: "123", email: "test@example.com" } as any);
    });
  });

  describe("userSignIn", () => {
    const input = {
      email: "Test@Example.com",
      password: "password123",
    };

    test("throws UNAUTHORIZED if user not found", async () => {
      mockRepo.getUserWithPasswordByEmail.mockResolvedValueOnce(null);

      let caughtError;
      try {
        await authServices.userSignIn(mockPrisma, input);
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(AppError);
      expect((caughtError as AppError).code).toBe("UNAUTHORIZED");
    });

    test("throws UNAUTHORIZED if password mismatch", async () => {
      mockRepo.getUserWithPasswordByEmail.mockResolvedValueOnce({ id: "123", password: "hashed_password" });
      mockVerify.mockResolvedValueOnce(false); // mock verification failure

      let caughtError;
      try {
        await authServices.userSignIn(mockPrisma, input);
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(AppError);
      expect((caughtError as AppError).code).toBe("UNAUTHORIZED");
    });

    test("returns user if email and password are correct", async () => {
      const dbUser = { id: "123", password: "hashed_password" };
      mockRepo.getUserWithPasswordByEmail.mockResolvedValueOnce(dbUser);
      mockVerify.mockResolvedValueOnce(true); 

      const result = await authServices.userSignIn(mockPrisma, input);

      expect(result).toEqual(dbUser as any);
      expect(mockVerify).toHaveBeenCalledWith("password123", "hashed_password");
    });
  });

  describe("getMe", () => {
    test("throws NOT_FOUND if user not found", async () => {
      mockRepo.getUserById.mockResolvedValueOnce(null);

      let caughtError;
      try {
        await authServices.getMe(mockPrisma, "123");
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(AppError);
      expect((caughtError as AppError).code).toBe("NOT_FOUND");
    });

    test("returns user if found", async () => {
      const dbUser = { id: "123", email: "test@example.com" };
      mockRepo.getUserById.mockResolvedValueOnce(dbUser);

      const result = await authServices.getMe(mockPrisma, "123");

      expect(result).toEqual(dbUser as any);
    });
  });
});
