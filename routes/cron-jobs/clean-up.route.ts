import { FastifyInstance } from "fastify";
import { GroceryProvider } from "../../src/providers/grocery-items.provider";

async function cronRoutes(fastify: FastifyInstance) {
  fastify.get("/cron-jobs/clean-up", async (request, reply) => {
    const groceryProvider = GroceryProvider(fastify);

    await groceryProvider.cleanUpItems();

    return { ok: true };
  });
}

export default cronRoutes;
