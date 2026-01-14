import { FastifyPluginAsync } from "fastify";
import { NotificationProvider } from "../src/providers/push-notifications.provider";
import { GroceryProvider } from "../src/providers/grocery-items.provider";
import webpush from "web-push";

const pushNotificationsRoute: FastifyPluginAsync = async (fastify) => {
  const notificationProvider = NotificationProvider(fastify);
  const groceryProvider = GroceryProvider(fastify);

  fastify.post("/api/push/subscribe", async (req, reply) => {
    const subscription = req.body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };
    console.log({ subscription });

    await notificationProvider.upsertSubscription(subscription);

    return reply.send({ success: true });
  });

  fastify.post("/api/push/send-all", async (_req, reply) => {
    const subs = await notificationProvider.getAllSubscriptions();

    const itemsWithExpiryDate =
      await groceryProvider.getAllItemsWithExpiryDate();

    for (let item of itemsWithExpiryDate) {
      if (!item.expiryDate) {
        continue;
      }

      const expiry = new Date(item.expiryDate);
      const today = new Date();

      const expiryDateOnly = `${expiry.getFullYear()}-${expiry.getMonth()}-${expiry.getDate()}`;
      const todayDateOnly = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const tomorrowDateOnly = `${today.getFullYear()}-${today.getMonth()}-${
        today.getDate() + 1
      }`;

      if (
        expiryDateOnly === todayDateOnly ||
        expiryDateOnly === tomorrowDateOnly
      ) {
        const payload = JSON.stringify({
          title: "Time to check in",
          body: "Some items are expiring soon!",
          url: "/",
        });

        let sent = 0;
        let removed = 0;

        for (const sub of subs) {
          try {
            await webpush.sendNotification(sub, payload);
            sent++;
          } catch (err: any) {
            // Remove dead endpoints
            if (err?.statusCode === 404 || err?.statusCode === 410) {
              await notificationProvider.deleteSubscription(sub.endpoint);
              removed++;
            }
          }
        }

        return reply.send({ success: true, sent, removed });
      }
    }

    return reply.send({ success: true, message: "No expiry data" });
  });
};

export default pushNotificationsRoute;
