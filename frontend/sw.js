self.addEventListener('push', function (event) {
  const options = {
    body: event.data.text(),
  };

  event.waitUntil(self.registration.showNotification('Notificación SmartRoad', options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
});
git 