import { describe, expect, test } from "bun:test";
import { AppError } from "../../src/utils/errors/app-error";

describe("AppError", () => {
  test("creates an instance with VALIDATION_ERROR and status 400", () => {
    const error = new AppError("VALIDATION_ERROR", "Invalid input");
    
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid input");
    expect(error instanceof Error).toBe(true);
    expect(error instanceof AppError).toBe(true);
    expect(error.name).toBe("AppError");
  });

  test("creates an instance with INTERNAL_SERVER_ERROR and status 500", () => {
    const error = new AppError("INTERNAL_SERVER_ERROR", "Server crash");
    
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  test("creates an instance with NOT_FOUND and status 404", () => {
    const error = new AppError("NOT_FOUND", "Resource missing");
    
    expect(error.statusCode).toBe(404);
  });

  test("creates an instance with UNAUTHORIZED and status 401", () => {
    const error = new AppError("UNAUTHORIZED", "Please login");
    
    expect(error.statusCode).toBe(401);
  });

  test("creates an instance with CONFLICT and status 409", () => {
    const error = new AppError("CONFLICT", "Already exists");
    
    expect(error.statusCode).toBe(409);
  });
});
