import { describe, expect, test, mock } from "bun:test";
import { errorHandler } from "../../src/utils/errors/error-handler";
import { AppError } from "../../src/utils/errors/app-error";
import type { FastifyRequest, FastifyReply, FastifyError } from "fastify";

describe("errorHandler", () => {
  test("handles AppError correctly", () => {
    const logErrorMock = mock();
    const requestMock = { log: { error: logErrorMock } } as unknown as FastifyRequest;

    const sendMock = mock();
    const statusMock = mock().mockReturnValue({ send: sendMock });
    const replyMock = { status: statusMock } as unknown as FastifyReply;

    const appError = new AppError("NOT_FOUND", "User not found");

    errorHandler(appError, requestMock, replyMock);

    expect(logErrorMock).toHaveBeenCalledWith(appError);
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      code: "NOT_FOUND",
      message: "User not found",
    });
  });

  test("handles unknown errors as 500 INTERNAL_SERVER_ERROR", () => {
    const logErrorMock = mock();
    const requestMock = { log: { error: logErrorMock } } as unknown as FastifyRequest;

    const sendMock = mock();
    const statusMock = mock().mockReturnValue({ send: sendMock });
    const replyMock = { status: statusMock } as unknown as FastifyReply;

    const unknownError = new Error("Database connection failed") as FastifyError;

    errorHandler(unknownError, requestMock, replyMock);

    expect(logErrorMock).toHaveBeenCalledWith(unknownError);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  });
});
