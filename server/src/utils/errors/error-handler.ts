import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./app-error";

export function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      code: error.code,
      message: error.message,
    });
  }

  // ai
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      success: false,
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }

  return reply.status(500).send({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
}
