import { FastifyInstance } from "fastify";
import { GroceryItem, GroceryItemInput } from "../types";
import { ObjectId, OptionalId } from "mongodb";
import { GroceryItemUpdateInput } from "../schemas/grocery.schema";

export const GroceryProvider = (fastify: FastifyInstance) => {
  const db = fastify.mongo.db;

  if (!db) {
    throw new Error("Database connection not initialized");
  }

  const collection = db.collection<OptionalId<GroceryItem>>("grocery_items");

  return {
    // Create new items
    async createItem(data: GroceryItemInput) {
      const now = new Date();

      const newItem: OptionalId<GroceryItem> = {
        name: data.name,
        done: false,
        created_at: now,
        updated_at: now,
      };

      const result = await collection.insertOne(newItem);

      return {
        ...newItem,
        _id: result.insertedId.toString(),
      };
    },

    // Get all items
    async getAllItems() {
      const items = await collection.find({}).toArray();

      return items.map((item) => {
        return {
          ...item,
          _id: item._id.toString(),
        };
      });
    },

    // Get all items with expiry date
    async getAllItemsWithExpiryDate() {
      const items = await collection
        .find({ expiryDate: { $exists: true } })
        .toArray();

      return items.map((item) => {
        return {
          ...item,
          _id: item._id.toString(),
        };
      });
    },

    // Get all items with expiry date
    async getExpiredData() {
      const items = await collection
        .find({ expiryDate: { $exists: true } })
        .toArray();

      const today = new Date();
      // Filter and count expired items
      const numberOfExpiredItems = items.filter((item) => {
        if (!item.expiryDate) {
          return false;
        }

        const expiryDate = new Date(item.expiryDate);
        return expiryDate < today;
      }).length;

      return {
        numberOfExpiredItems,
      };
    },

    // Update item by id
    async updateItemById(id: string, data: Partial<GroceryItemUpdateInput>) {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.done !== undefined) {
        updateData.done = data.done;
      }

      if (data.expiryDate) {
        updateData.expiryDate = new Date(data.expiryDate);
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      return result;
    },

    // Delete item by id
    async deleteItemById(id: string) {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      return result;
    },

    // Delete all items that are done and do not have an expiry date
    async cleanUpItems() {
      const result = await collection.deleteMany({
        done: true,
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          {
            expiryDate: undefined,
          },
        ],
      });

      return result;
    },

    // we can add more methods later:
    // getItem(id)
    // updateItem(id, data)
    // deleteItem(id)
  };
};
