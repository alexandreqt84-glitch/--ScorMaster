// Service worker ScoreMaster : fonctionne hors ligne. Changer VERSION à chaque mise à jour des fichiers.
const VERSION = "2.8.6-pwa37";
const CACHE = "scoremaster-" + VERSION;
const FILES = ["./", "index.html", "style.css", "theme2.css", "manifest.json", "icon.svg",
  "config.js", "core.js", "cloud.js", "fx.js", "app.js", "extras.js", "extras2.js", "extras3.js", "extras4.js", "extras5.js", "extras6.js", "extras7.js", "extras8.js", "extras9.js", "extras10.js", "extras11.js", "extras12.js", "extras13.js", "extras14.js", "theme2.js",
  "cat-cartes.js", "cat-autres.js", "cat-plus.js", "cat-populaires.js", "cat-populaires2.js", "cat-famille.js", "cat-ajouts.js", "cat-ajouts2.js", "cat-ajouts3.js", "cat-variantes.js", "cat-variantes-pop.js", "cat-variantes-3.js", "cat-limites.js", "cat-usuel.js",
  "play-solo.js", "play-party.js", "play-variantes.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(FILES.map(f => c.add(f)))).then(() => self.skipWaiting())); // un fichier manquant ne bloque plus l'installation
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
  e.respondWith(fetch(req, { cache: "no-cache" }).then(r => {   // fichiers : réseau d'abord (mise à jour immédiate), cache si hors ligne
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  }).catch(() => caches.match(req)));
});
