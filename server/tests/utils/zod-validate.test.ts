import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { validateSchema } from "../../src/utils/zod-validate";
import { AppError } from "../../src/utils/errors/app-error";

describe("validateSchema", () => {
  const schema = z.object({
    name: z.string().min(2),
    age: z.number().positive(),
  });

  test("returns valid parsed data when input matches schema", () => {
    const input = { name: "John", age: 30 };
    const result = validateSchema(schema, input);
    
    expect(result).toEqual({ name: "John", age: 30 });
  });

  test("throws AppError with VALIDATION_ERROR when input is invalid", () => {
    const invalidInput = { name: "J", age: -5 };

    let caughtError: AppError | undefined;
    try {
      validateSchema(schema, invalidInput);
    } catch (err) {
      if (err instanceof AppError) {
        caughtError = err;
      }
    }

    expect(caughtError).toBeDefined();
    expect(caughtError?.code).toBe("VALIDATION_ERROR");
    expect(caughtError?.statusCode).toBe(400);
  });

  test("strips unknown fields if schema allows", () => {
    const input = { name: "Jane", age: 25, extra: "field" };
    const result = validateSchema(schema, input);
    
    expect(result).toEqual({ name: "Jane", age: 25 });
  });
});
