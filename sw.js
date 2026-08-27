/* Obra em Dia — service worker
   TROQUE A VERSAO A CADA PUBLICACAO para forcar a atualizacao nos aparelhos. */
const VERSAO = 'obra-em-dia-v2';
const ARQUIVOS = [
  './', './index.html', './manifest.webmanifest',
  './icones/icon-192.png', './icones/icon-512.png', './icones/icon-512-maskable.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* rede primeiro para o HTML (pega versao nova), cache primeiro para o resto */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const ehPagina = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (ehPagina){
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(VERSAO).then(x => x.put(req, c)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => {
    const c = resp.clone(); caches.open(VERSAO).then(x => x.put(req, c)); return resp;
  }).catch(() => r)));
});
