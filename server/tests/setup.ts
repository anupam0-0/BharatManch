import Fastify from "fastify";
import { cookiePlugin } from "../src/plugins/cookies";
import { jwtPlugin } from "../src/plugins/jwt";
import { authPlugin } from "../src/plugins/auth";
import authRoutes from "../src/modules/auth/auth.routes";
import channelRoutes from "../src/modules/channel/channel.routes";
import { errorHandler } from "../src/utils/errors/error-handler";
import { mock } from "bun:test";

export const mockPrisma = {
  user: {
    findUnique: mock(),
    create: mock(),
  },
  channel: {
    findUnique: mock(),
    findFirst: mock(),
    update: mock(),
    create: mock(),
  },
  $transaction: mock(),
} as any;

export async function buildApp() {
  // Ensure JWT secret is set for tests
  process.env.JWT_SECRET = "test-secret-key-123456789";

  const app = Fastify({ logger: false });
  app.setErrorHandler(errorHandler);

  // Decorate with mock prisma instead of registering real prisma plugin
  app.decorate("prisma", mockPrisma);

  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(authPlugin);

  // Register routes
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(channelRoutes, { prefix: "/channels" });

  
  
  app.get("/health", async () => {
    return { status: "ok", body: "Server is healthy!" };
  });

  await app.ready();
  return app;
}
