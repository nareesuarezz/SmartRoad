self.addEventListener('push', function (event) {
  // Parsea los datos de la notificación
  const data = JSON.parse(event.data.text());

  const options = {
    body: data.description,
    icon: data.image,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
