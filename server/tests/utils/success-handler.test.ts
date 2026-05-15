import { describe, expect, test, mock } from "bun:test";
import { sendResponse } from "../../src/utils/success-handler";
import type { FastifyReply } from "fastify";

describe("sendResponse", () => {
  test("sends response with correct structure and status code", () => {
    const sendMock = mock();
    const statusMock = mock().mockReturnValue({ send: sendMock });
    
    const replyMock = {
      status: statusMock,
    } as unknown as FastifyReply;

    sendResponse({
      reply: replyMock,
      statusCode: 201,
      success: true,
      message: "Resource created",
      data: { id: 1 },
    });

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(sendMock).toHaveBeenCalledWith({
      success: true,
      message: "Resource created",
      data: { id: 1 },
    });
  });

  test("defaults to 200 status code if not provided", () => {
    const sendMock = mock();
    const statusMock = mock().mockReturnValue({ send: sendMock });
    
    const replyMock = {
      status: statusMock,
    } as unknown as FastifyReply;

    sendResponse({
      reply: replyMock,
      success: true,
      message: "Success",
    });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      success: true,
      message: "Success",
      data: undefined,
    });
  });
});
