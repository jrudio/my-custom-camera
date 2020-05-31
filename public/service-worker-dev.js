self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', () => {
  self.clients.matchAll({
    type: 'window',
  }).then((clients) => {
    if (!clients) {
      return;
    } else if (clients && !clients.client) {
      return;
    }

    clients.client.forEach((client) => {
      client.navigate(client.url);
    });
  });
});
