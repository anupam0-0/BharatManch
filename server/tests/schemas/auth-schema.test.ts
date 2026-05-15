import { describe, expect, test } from "bun:test";
import { signInSchema, signUpSchema } from "../../src/modules/auth/auth.schema";

describe("Auth Schemas", () => {
  describe("signInSchema", () => {
    test("accepts valid input", () => {
      const result = signInSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    test("rejects invalid email", () => {
      const result = signInSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    test("rejects short password", () => {
      const result = signInSchema.safeParse({
        email: "test@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("signUpSchema", () => {
    test("accepts valid input", () => {
      const result = signUpSchema.safeParse({
        firstName: "John",
        lastName: "Doe",
        handle: "johndoe",
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    test("rejects missing fields", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    test("rejects short first name", () => {
      const result = signUpSchema.safeParse({
        firstName: "J",
        lastName: "Doe",
        handle: "johndoe",
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
    
    test("rejects short handle", () => {
      const result = signUpSchema.safeParse({
        firstName: "John",
        lastName: "Doe",
        handle: "john", // min 6
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });
});
