// path: modules/auth/auth.routes.ts

// auth routes
import type { FastifyInstance } from "fastify";
import { signup, signin, signout, getMe } from "./auth.controllers";

const authRoutes = async (app: FastifyInstance) => {
  app.post("/signup", signup);
  app.post("/signin", signin);
  app.post("/signout", { preHandler: app.authenticate }, signout);
  app.get("/me", { preHandler: app.authenticate }, getMe);
};

export default authRoutes;
