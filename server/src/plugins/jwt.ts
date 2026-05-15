import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

export const jwtPlugin = fp(async (app) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error("JWT_SECRET environment variable is not set");

  await app.register(jwt, {
    secret: jwtSecret,
    cookie: {
      cookieName: "access_token",
      signed: false,
      // we will not sign the cookie because we will use JWT to verify the token and we will also set the token in the Authorization header for API requests, so we don't need to sign the cookie.
    },
  });
});
