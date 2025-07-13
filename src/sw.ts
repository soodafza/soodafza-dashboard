import { precacheAndRoute } from 'workbox-precaching';
import { Queue } from 'workbox-background-sync';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
const txQueue = new Queue('txQueue');

self.addEventListener('fetch', (evt) => {
  const { request } = evt;
  if (request.url.endsWith('/tx') && request.method === 'POST') {
    evt.respondWith(
      fetch(request.clone()).catch(async () => {
        await txQueue.pushRequest({ request });
        return new Response(JSON.stringify({ queued: true }), { status: 202 });
      }),
    );
  }
});
