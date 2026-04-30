import Fastify from "fastify";

const app = Fastify();
const PORT = 4000;

app.get("/", async () => {
  return { message: "Hello from BharatManch Backend!" };
});

const start = async () => {
  try {
    await app.listen({ port: PORT });
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();