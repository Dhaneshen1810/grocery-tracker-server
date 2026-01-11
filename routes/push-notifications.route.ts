import { FastifyPluginAsync } from "fastify";
import { NotificationProvider } from "../src/providers/push-notifications.provider";
import webpush from "web-push";

const pushNotificationsRoute: FastifyPluginAsync = async (fastify) => {
  const notificationProvider = NotificationProvider(fastify);

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

    const payload = JSON.stringify({
      title: "Test Notification",
      body: "If you see this, push is working 🎉",
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
  });
};

export default pushNotificationsRoute;
