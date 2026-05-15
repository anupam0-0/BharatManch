import "fastify";
import "@fastify/jwt";
import type { PrismaClient } from "../generated/prisma/client";
import type { FastifyRequest } from "fastify";

declare module "fastify" {
  export interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

// ai
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string };
    user: { id: string };
  }
}
// withot this declaration, TypeScript will throw an error when we try to access app.prisma in our routes or controllers, because it doesn't know that we've added this property to the Fastify instance.
