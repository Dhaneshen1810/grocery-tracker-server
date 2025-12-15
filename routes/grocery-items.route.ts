import { FastifyPluginAsync } from "fastify";
import { GroceryProvider } from "../src/providers/grocery-items.provider";
import { GroceryItemSchema } from "../src/schemas/grocery.schema";

const groceryRoute: FastifyPluginAsync = async (fastify) => {
  const groceryProvider = GroceryProvider(fastify);

  // CREATE item
  fastify.post("/grocery-items", async (request, reply) => {
    try {
      // Validate using Zod
      const parsed = GroceryItemSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          status: "error",
          message: parsed.error.format(),
        });
      }

      // parsed.data is fully typed and safe to use
      const item = await groceryProvider.createItem(parsed.data);

      return reply.status(201).send({
        status: "success",
        item,
      });
    } catch (error) {
      return reply.status(500).send({
        status: "error",
        message: (error as Error).message,
      });
    }
  });

  // GET all items
  fastify.get("/grocery-items", async (_, reply) => {
    try {
      const items = await groceryProvider.getAllItems();

      return reply.status(200).send({
        status: "success",
        items,
      });
    } catch (error) {
      return reply.status(500).send({
        status: "error",
        message: (error as Error).message,
      });
    }
  });

  // GET all items with expiry date
  fastify.get("/grocery-items/expiry", async (_, reply) => {
    try {
      const items = await groceryProvider.getAllItemsWithExpiryDate();

      return reply.status(200).send({
        status: "success",
        items,
      });
    } catch (error) {
      return reply.status(500).send({
        status: "error",
        message: (error as Error).message,
      });
    }
  });

  // GET data about expired items
  fastify.get("/grocery-items/expired-data", async (_, reply) => {
    try {
      const data = await groceryProvider.getExpiredData();

      return reply.status(200).send({
        status: "success",
        data,
      });
    } catch (error) {
      return reply.status(500).send({
        status: "error",
        message: (error as Error).message,
      });
    }
  });

  // UPDATE item by id
  fastify.put("/grocery-items/:id", async (request, reply) => {
    try {
      const id = (request.params as { id: string }).id;

      // Partial update schema: allow optional fields
      const UpdateSchema = GroceryItemSchema.partial();

      const parsed = UpdateSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          status: "error",
          message: parsed.error.flatten(),
        });
      }

      const result = await groceryProvider.updateItemById(id, parsed.data);

      if (result.matchedCount === 0) {
        return reply.status(404).send({
          status: "error",
          message: "Item not found",
        });
      }

      return reply.send({
        status: "success",
        message: "Item updated",
      });
    } catch (error) {
      return reply.status(500).send({
        status: "error",
        message: (error as Error).message,
      });
    }
  });

  // DELETE item by id
  fastify.delete("/grocery-items/:id", async (request, reply) => {
    try {
      const id = (request.params as { id: string }).id;

      const result = await groceryProvider.deleteItemById(id);

      return reply.send({
        status: "success",
        message: "Item deleted",
      });
    } catch (error) {
      return reply.status(500).send({
        status: "error",
        message: (error as Error).message,
      });
    }
  });
};

export default groceryRoute;
