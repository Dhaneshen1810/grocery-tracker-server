import { FastifyPluginAsync } from "fastify";

const heartbeatRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get("/heartbeat", async () => {
    try {
      const db = fastify.mongo.db;

      if (!db) {
        throw new Error("No database connection");
      }

      // Run a simple command to verify DB health
      await db.command({ ping: 1 });

      return {
        status: "ok",
        database: "connected",
        timeStamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "error",
        database: "disconnected",
        message: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  });
};

export default heartbeatRoute;
