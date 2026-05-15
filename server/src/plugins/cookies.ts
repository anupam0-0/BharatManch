import fp from "fastify-plugin";
import cookie from "@fastify/cookie";


export const cookiePlugin = fp(async (app) => {
  await app.register(cookie);
});

// this plugin will register the cookie plugin for fastify, which will allow us to set and get cookies in our routes and controllers. We will use this plugin to set the JWT token in the cookies when the user signs in and clear the cookies when the user signs out.
