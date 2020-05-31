self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', () => {
  self.clients.matchAll({
    type: 'window',
  }).then((clients) => {
    clients.client.forEach((client) => {
      client.navigate(client.url);
    });
  });
});
