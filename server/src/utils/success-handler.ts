import type { FastifyReply } from "fastify";

type ResponseType<T> = {
  reply: FastifyReply;
  statusCode?: number;
  success: boolean;
  message?: string;
  data?: T;
};

export function sendResponse<T>({
  reply,
  statusCode = 200,
  success,
  message,
  data,
}: ResponseType<T>) {
  return reply.status(statusCode).send({
    success,
    message,
    data,
  });
}


// usage:
// return sendResponse({
//   reply,
//   success: true,
//   message: "User fetched",
//   data: user,
// });
// 
// =
// 
// return reply.status(404).send({
//   success: false,
//   message: error.message,
//   data: null,
// });