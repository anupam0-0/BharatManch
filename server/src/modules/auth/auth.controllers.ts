// path: modules/auth/auth.controllers.ts
import type { FastifyRequest, FastifyReply } from "fastify";
import { signInSchema, signUpSchema } from "./auth.schema.ts";
import authServices from "./auth.services.ts";
import { validateSchema } from "../../utils/zod-validate.ts";
import { sendResponse } from "../../utils/success-handler.ts";

// signup
const signup = async (req: FastifyRequest, reply: FastifyReply) => {
      const user = validateSchema(signUpSchema, req.body);
      const newUser = await authServices.userSignup(req.server.prisma, user);
      // also check if handle is unique or not, thorw error is handle already there

      return sendResponse({
            reply,
            statusCode: 201,
            success: true,
            message: "User created successfully",
            data: newUser,
      });
};

// signin
const signin = async (req: FastifyRequest, reply: FastifyReply) => {
      // validate input
      const inputData = validateSchema(signInSchema, req.body);
      // const inputData = signInSchema.parse(req.body); // dont use this chee

      // login service
      const user = await authServices.userSignIn(req.server.prisma, inputData);

      const token = await reply.jwtSign({ id: user.id });
      reply.setCookie("access_token", token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
      });

      return sendResponse({
            reply,
            statusCode: 200,
            success: true,
            message: "Login successful",
      });
};

// signout
const signout = (_req: FastifyRequest, reply: FastifyReply) => {
      reply.clearCookie("access_token", { path: "/" });

      return sendResponse({
            reply,
            statusCode: 200,
            success: true,
            message: "Signout successful",
      });
};

// get me
const getMe = async (req: FastifyRequest, reply: FastifyReply) => {
      // get user id
      const userId = req.user.id;

      const user = await authServices.getMe(req.server.prisma, userId);
      return sendResponse({
            reply,
            statusCode: 200,
            success: true,
            message: "Fetched users details",
            data: user,
      });
};

export { signup, signin, signout, getMe };
