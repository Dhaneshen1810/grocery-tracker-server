import { FastifyInstance } from "fastify";

/**
 * Minimal Push Subscription document
 * Stored exactly as received from the browser
 */
export type PushSubscriptionDoc = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  created_at: Date;
  updated_at: Date;
};

export const NotificationProvider = (fastify: FastifyInstance) => {
  const db = fastify.mongo.db;

  if (!db) {
    throw new Error("Database connection not initialized");
  }

  const collection = db.collection<PushSubscriptionDoc>("push_subscriptions");

  return {
    /**
     * Save or update a push subscription
     * Endpoint is the unique identifier
     */
    async upsertSubscription(
      subscription: Pick<PushSubscriptionDoc, "endpoint" | "keys">
    ) {
      const now = new Date();

      if (
        !subscription?.endpoint ||
        !subscription?.keys?.p256dh ||
        !subscription?.keys?.auth
      ) {
        throw new Error("Invalid push subscription");
      }

      await collection.updateOne(
        { endpoint: subscription.endpoint },
        {
          $set: {
            keys: subscription.keys,
            updated_at: now,
          },
          $setOnInsert: {
            endpoint: subscription.endpoint,
            created_at: now,
          },
        },
        { upsert: true }
      );

      return { success: true };
    },

    /**
     * Get all stored push subscriptions
     * Used by cron jobs or bulk notifications
     */
    async getAllSubscriptions() {
      return await collection.find({}).toArray();
    },

    /**
     * Remove dead / expired subscriptions
     * Call when web-push returns 404 or 410
     */
    async deleteSubscription(endpoint: string) {
      if (!endpoint) return { success: false };

      await collection.deleteOne({ endpoint });
      return { success: true };
    },
  };
};
