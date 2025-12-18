import Fastify from "fastify";
import app from "./app";

const fastify = Fastify({ logger: true });

async function start() {
  try {
    await fastify.register(app);

    const port = Number(process.env.PORT) || 3000;

    const address = await fastify.listen({
      port,
      host: "0.0.0.0",
    });

    fastify.log.info(`Server listening at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
