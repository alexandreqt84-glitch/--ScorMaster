// Serveur unique : l'appli + une API JSON. Aucune dépendance npm.
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 3000;
const DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const FILE = path.join(DIR, "parties.json");
const SFILE = path.join(DIR, "settings.json");
const PUB = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json" };

fs.mkdirSync(DIR, { recursive: true });
let parties = [];
try { parties = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch (e) {}
const persist = () => { fs.writeFileSync(FILE + ".tmp", JSON.stringify(parties)); fs.renameSync(FILE + ".tmp", FILE); };
// Réglages (favoris, préférences, profil, records, derniers réglages de partie) : { clé: { v, t } }, la valeur la plus récente gagne.
let settings = {};
try { settings = JSON.parse(fs.readFileSync(SFILE, "utf8")); } catch (e) {}
const persistSettings = () => { fs.writeFileSync(SFILE + ".tmp", JSON.stringify(settings)); fs.renameSync(SFILE + ".tmp", SFILE); };
const reply = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-cache" });
  res.end(Buffer.isBuffer(body) || typeof body === "string" ? body : JSON.stringify(body));
};

http.createServer((req, res) => {
  const url = new URL(req.url, "http://local");
  if (url.pathname === "/api/settings" && req.method === "GET") return reply(res, 200, { entries: settings });
  if (url.pathname === "/api/settings" && req.method === "POST") {
    let raw = "";
    req.on("data", c => { raw += c; if (raw.length > 4e6) req.destroy(); });
    req.on("end", () => {
      let inc;
      try { inc = JSON.parse(raw).entries; if (!inc || typeof inc !== "object") throw new Error("entrées manquantes"); } catch (e) { return reply(res, 400, { error: "réglages invalides" }); }
      for (const k of Object.keys(inc)) {
        const e = inc[k];
        if (!e || typeof e.t !== "number" || k.length > 200) continue;
        if (!settings[k] || e.t > settings[k].t) settings[k] = { v: e.v, t: e.t };
      }
      try { persistSettings(); } catch (e) { console.error("Écriture impossible dans " + SFILE + " :", e.message); return reply(res, 500, { error: "écriture impossible" }); }
      reply(res, 200, { entries: settings });
    });
    return;
  }
  if (url.pathname === "/api/parties" && req.method === "GET") return reply(res, 200, parties);
  if (url.pathname === "/api/parties" && req.method === "POST") {
    let raw = "";
    req.on("data", c => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on("end", () => {
      try {
        const p = JSON.parse(raw);
        if (!p.id) throw new Error("id manquant");
        parties = [p, ...parties.filter(x => x.id !== p.id)];
        try { persist(); } catch (e) { console.error("Écriture impossible dans " + FILE + " :", e.message); return reply(res, 500, { error: "écriture impossible" }); }
        reply(res, 200, { ok: true });
      } catch (e) { reply(res, 400, { error: "partie invalide" }); }
    });
    return;
  }
  if (url.pathname === "/api/parties" && req.method === "DELETE") { parties = []; persist(); return reply(res, 200, { ok: true }); }
  const del = url.pathname.match(/^\/api\/parties\/(.+)$/);
  if (del && req.method === "DELETE") {
    parties = parties.filter(x => x.id !== decodeURIComponent(del[1]));
    persist(); return reply(res, 200, { ok: true });
  }
  let file = path.normalize(path.join(PUB, url.pathname === "/" ? "index.html" : url.pathname));
  if (!file.startsWith(PUB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(PUB, "index.html");
  const st = fs.statSync(file), etag = '"' + st.size + "-" + Math.round(st.mtimeMs) + '"';
  if (req.headers["if-none-match"] === etag) { res.writeHead(304, { ETag: etag, "Cache-Control": "no-cache" }); return res.end(); }
  res.setHeader("ETag", etag);
  reply(res, 200, fs.readFileSync(file), TYPES[path.extname(file)] || "application/octet-stream");
}).listen(PORT, () => console.log("Serveur prêt sur le port " + PORT));
