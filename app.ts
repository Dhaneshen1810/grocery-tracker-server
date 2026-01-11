import { FastifyPluginAsync } from "fastify";
import heartbeatRoute from "./routes/heartbeat.route";
import groceryItemsRoute from "./routes/grocery-items.route";
import cleanUpRoute from "./routes/cron-jobs/clean-up.route";
import pushNotificationsRoute from "./routes/push-notifications.route";
import fastifyMongodb from "@fastify/mongodb";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";

dotenv.config();

const app: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyMongodb, {
    url: process.env.DATABASE_URL as string,
    forceClose: true,
  });

  fastify.register(fastifyCors, {
    origin: "*", // allow all origins (developement only)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  fastify.register(heartbeatRoute);
  fastify.register(groceryItemsRoute);
  fastify.register(cleanUpRoute);
  fastify.register(pushNotificationsRoute);

  fastify.get("/", async () => {
    return { hello: "world" };
  });
};

export default app;
