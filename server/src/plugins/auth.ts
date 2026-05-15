import fp from "fastify-plugin";
import type { FastifyRequest } from "fastify";

export const authPlugin = fp(async (app) => {
    app.decorate("authenticate", async (request: FastifyRequest) => {
        await request.jwtVerify();
    });
});
