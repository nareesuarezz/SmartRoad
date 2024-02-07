self.addEventListener('push', function (event) {
<<<<<<< HEAD
  const options = {
    body: event.data.text(),
  };

  event.waitUntil(self.registration.showNotification('Notificación SmartRoad', options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
});
=======
    const options = {
        body: event.data.text(),
    };
    event.waitUntil(self.registration.showNotification('Notificación SmartRoad', options));
});
self.addEventListener('notificationclick', function (event) { event.notification.close(); });
>>>>>>> 425789f4b608171d5f1ba2c9b57c00035ee8b649
