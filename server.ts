import Fastify from "fastify";
import app from "./app";

const fastify = Fastify({ logger: true });

fastify.register(app);

fastify.listen({ port: 3002 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
