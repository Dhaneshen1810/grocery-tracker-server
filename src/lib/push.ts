import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:dan.moonian@gmail.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);
