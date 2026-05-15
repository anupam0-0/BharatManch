import Fastify from "fastify";
import prismaPlugin from "./plugins/prisma";
import { cookiePlugin } from "./plugins/cookies";
import { jwtPlugin } from "./plugins/jwt";
import { authPlugin } from "./plugins/auth";
import { errorHandler } from "./utils/errors/error-handler";
import authRoutes from "./modules/auth/auth.routes";
import cors from "@fastify/cors";

const PORT = 4000;

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: ["http://localhost:3000"],
    credentials: true, // for cookies
  });
  await app.register(prismaPlugin);
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(authPlugin);

  app.setErrorHandler(errorHandler);

  app.get("/health", async () => {
    return { status: "ok", body: "Server is healthy!" };
  });

  await app.register(authRoutes, { prefix: "/auth" });

  return app;
}

const app = await main();

const start = async () => {
  try {
    await app.listen({ port: PORT });
    // console.log(`Server running on port ${PORT}`);
    app.log.info(`Server running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

// graceful shutdown by codex
const gracefulShutdown = async () => {
  app.log.info("Shutting down...");

  await app.close();

  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
