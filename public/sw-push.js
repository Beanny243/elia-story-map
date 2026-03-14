// Service Worker for Push Notifications - Eliamap
self.addEventListener("push", (event) => {
  let data = { title: "Eliamap", body: "You have a new notification", icon: "/favicon.ico" };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("Failed to parse push data:", e);
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [{ action: "open", title: "View" }],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
