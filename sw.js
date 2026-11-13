// Service worker ScoreMaster : fonctionne hors ligne. Changer VERSION à chaque mise à jour des fichiers.
const VERSION = "1.3.0-pwa4";
const CACHE = "scoremaster-" + VERSION;
const FILES = ["./", "index.html", "style.css", "manifest.json", "icon.svg",
  "config.js", "core.js", "cloud.js", "fx.js", "app.js",
  "cat-cartes.js", "cat-autres.js", "cat-plus.js", "cat-variantes.js", "cat-limites.js", "cat-usuel.js",
  "play-solo.js", "play-party.js", "play-variantes.js",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("scoremaster-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.includes("/api/")) return;               // l'API (serveur facultatif) n'est jamais mise en cache
  if (req.mode === "navigate") {                             // page : réseau d'abord, sinon version en cache
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); return r; }).catch(() => caches.match("index.html").then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {              // fichiers : cache d'abord, mise à jour en arrière-plan
    const net = fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
