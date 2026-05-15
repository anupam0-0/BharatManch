import type { ZodType } from "zod";
import { AppError } from "./errors/app-error";

export function validateSchema<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError("VALIDATION_ERROR", result.error.message);
  }
  return result.data;
}
