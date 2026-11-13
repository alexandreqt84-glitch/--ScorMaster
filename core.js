// Moteur : stockage, profil, mode, totaux, classement, statistiques
const Core = {
  VERSION: "1.3.0",
  OPTS: { sound: 1, haptic: 1, fond: 1, confetti: 1, grand: 0, veille: 1 },
  // ---------- réglages : favoris, préférences, profil, records, derniers réglages de partie ----------
  // Chaque valeur est { v, t } (t = date de modification). Copie locale instantanée (localStorage) + copie serveur
  // (server/data/settings.json) partagée entre appareils : pour chaque clé, la modification la plus récente gagne.
  SK: "sm_store", store: null, dirty: {}, status: "wait", _pt: null,
  _load() {
    if (Core.store) return Core.store;
    let s = null; try { s = JSON.parse(localStorage.getItem(Core.SK)); } catch (e) {}
    try { Core.dirty = JSON.parse(localStorage.getItem(Core.SK + "_d")) || {}; } catch (e) { Core.dirty = {}; }
    if (!s || typeof s !== "object") {
      s = {}; const t = Date.now(), put = (k, v) => { s[k] = { v, t }; Core.dirty[k] = 1; }, ls = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
      const o = ls("sm_opts") || {}; Object.keys(o).forEach(k => put("opt." + k, o[k]));          // anciennes données (v1.1.0)
      (ls("sm_favs") || []).forEach(id => put("fav." + id, true));
      if (ls("sm_me")) put("me", ls("sm_me"));
      Object.keys(localStorage).filter(k => k.startsWith("sm_best_")).forEach(k => put("best." + k.slice(8), Number(localStorage.getItem(k))));
    }
    Core.store = s; Core._save(); return s;
  },
  _save() { try { localStorage.setItem(Core.SK, JSON.stringify(Core.store)); localStorage.setItem(Core.SK + "_d", JSON.stringify(Core.dirty)); } catch (e) {} },
  get(k, d) { const e = Core._load()[k]; return e === undefined ? d : e.v; },
  set(k, v) { Core._load()[k] = { v, t: Date.now() }; Core.dirty[k] = 1; Core._save(); clearTimeout(Core._pt); Core._pt = setTimeout(Core.push, 400); },
  _merge(entries, mark) {
    let changed = false; const s = Core._load();
    Object.keys(entries || {}).forEach(k => { const e = entries[k]; if (e && typeof e.t === "number" && (!s[k] || e.t > s[k].t)) { s[k] = e; changed = true; if (mark) Core.dirty[k] = 1; else delete Core.dirty[k]; } });
    return changed;
  },
  async push() {
    const keys = Object.keys(Core.dirty); if (!keys.length) { if (Core.status === "wait") Core.status = "ok"; return true; }
    const entries = {}, s = Core._load(); keys.forEach(k => { if (s[k]) entries[k] = s[k]; });
    try {
      const d = await Core._json("api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entries }) });
      keys.forEach(k => { if (s[k] && entries[k] && s[k].t === entries[k].t) delete Core.dirty[k]; });
      Core._merge(d.entries); Core._save(); Core.status = "ok"; return true;
    } catch (e) { Core.status = "off"; return false; }
  },
  // récupère les réglages du serveur (et lui envoie ce qu'il n'a pas) ; renvoie true si quelque chose a changé ici
  async sync() {
    try {
      const d = (await Core._json("api/settings")).entries || {}, s = Core._load(), changed = Core._merge(d);
      Object.keys(s).forEach(k => { if (!d[k] || d[k].t < s[k].t) Core.dirty[k] = 1; });
      Core._save(); Core.status = "ok"; await Core.push(); return changed;
    } catch (e) { Core.status = "off"; return false; }
  },
  pending: () => Object.keys(Core.dirty).length,
  opt(k) { const v = Core.get("opt." + k); return v === undefined ? (k === "fond" && window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : Core.OPTS[k]) : v; },
  setOpt(k, v) { Core.set("opt." + k, v); },
  favs() { const s = Core._load(); return Object.keys(s).filter(k => k.startsWith("fav.") && s[k].v).map(k => k.slice(4)); },
  toggleFav(id) { const on = !Core.favs().includes(id); Core.set("fav." + id, on); return on; },
  best(id) { const v = Core.get("best." + id); return v === undefined || v === null ? null : Number(v); },
  setBest(id, v) { Core.set("best." + id, Number(v)); },
  bests() { const s = Core._load(); return Object.keys(s).filter(k => k.startsWith("best.")).map(k => ({ id: k.slice(5), v: s[k].v })); },
  setup(id) { return Core.get("setup." + id) || null; },
  setSetup(id, o) { Core.set("setup." + id, o); },
  API: "api/parties", KEY: "sm_current",
  esc: s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])),
  norm: s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(),
  uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6),

  hist: null, histT: 0, PK: "sm_parties", PQ: "sm_parties_pending", server: null,
  // Historique : copie locale (localStorage) toujours tenue à jour ; le serveur (facultatif) est utilisé s'il répond.
  _lp() { try { const d = JSON.parse(localStorage.getItem(Core.PK)); return Array.isArray(d) ? d : []; } catch (e) { return []; } },
  _sp(a) { try { localStorage.setItem(Core.PK, JSON.stringify(a)); return true; } catch (e) { return false; } },
  _pq() { try { const d = JSON.parse(localStorage.getItem(Core.PQ)); return Array.isArray(d) ? d : []; } catch (e) { return []; } },
  _spq(a) { try { localStorage.setItem(Core.PQ, JSON.stringify(a)); } catch (e) {} },
  async _json(url, opt = {}) {
    if (typeof Cloud !== "undefined" && Cloud.active()) return Cloud.call(url, opt.method || "GET", opt.body);   // compte connecté : sauvegarde en ligne
    const c = new AbortController(), to = setTimeout(() => c.abort(), 5000);
    try { const r = await fetch(url, { ...opt, signal: c.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); } finally { clearTimeout(to); }
  },
  async list() {
    let loc = Core._lp();
    try {
      const pend = Core._pq();
      for (const id of pend.slice()) { const p = loc.find(x => x.id === id); if (!p) { Core._spq(Core._pq().filter(x => x !== id)); continue; } await Core._json(Core.API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }); Core._spq(Core._pq().filter(x => x !== id)); }
      const d = await Core._json(Core.API);
      if (!Array.isArray(d)) throw new Error("pas de serveur");
      Core.server = true; const keep = new Set(Core._pq()); loc = [...loc.filter(x => keep.has(x.id) && !d.some(y => y.id === x.id)), ...d]; Core._sp(loc);
    } catch (e) { Core.server = false; }
    Core.hist = loc; Core.histT = Date.now(); if (typeof Cloud !== "undefined") Cloud.pushProfile(); return loc;
  },
  async save(p) {
    const loc = [p, ...Core._lp().filter(x => x.id !== p.id)];
    if (!Core._sp(loc)) return false;
    if (Core.hist) Core.hist = [p, ...Core.hist.filter(x => x.id !== p.id)];
    try { await Core._json(Core.API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }); Core.server = true; }
    catch (e) { if (Core.server !== false) { const q = Core._pq(); if (!q.includes(p.id)) Core._spq([...q, p.id]); } }
    if (typeof Cloud !== "undefined") Cloud.pushProfile();
    return true;
  },
  async removeAll() { Core._sp([]); Core._spq([]); Core.hist = []; try { await Core._json(Core.API, { method: "DELETE" }); } catch (e) {} },
  async remove(id) { Core._sp(Core._lp().filter(x => x.id !== id)); Core._spq(Core._pq().filter(x => x !== id)); if (Core.hist) Core.hist = Core.hist.filter(x => x.id !== id); try { await Core._json(Core.API + "/" + encodeURIComponent(id), { method: "DELETE" }); } catch (e) {} },

  // une partie en cours PAR MODE (Cartes / Autres jeux) : on ne voit jamais celle de l'autre mode
  _cur(m) { return Core.KEY + "_" + m; },
  current(m = Core.mode()) {
    try { // reprise de l'ancienne partie en cours unique (v1.3.0 et avant)
      const old = JSON.parse(localStorage.getItem(Core.KEY));
      if (old) { const om = old.mode === "autres" ? "autres" : "cartes"; if (!localStorage.getItem(Core._cur(om))) localStorage.setItem(Core._cur(om), JSON.stringify(old)); }
      localStorage.removeItem(Core.KEY);
    } catch (e) {}
    try { return JSON.parse(localStorage.getItem(Core._cur(m))); } catch (e) { return null; }
  },
  setCurrent(p, m = Core.mode()) { p ? localStorage.setItem(Core._cur(m), JSON.stringify(p)) : localStorage.removeItem(Core._cur(m)); },
  mode() { return localStorage.getItem("sm_mode") === "autres" ? "autres" : "cartes"; },
  setMode(m) { localStorage.setItem("sm_mode", m); },
  me() { return Core.get("me") || { nom: "", emoji: "🎲" }; },
  setMe(m) { Core.set("me", m); },

  create(game, names, target, limite, usuel) {
    return { id: Core.uid(), mode: game.mode, jeu: game.name, emoji: game.emoji, low: !!game.low, target: target || 0, limite: limite || 0, usuel: usuel || 0,
      joueurs: names, manches: [], quick: game.quick || [], date: new Date().toISOString(), fini: false };
  },
  totals: p => p.joueurs.map((_, i) => p.manches.reduce((s, m) => s + (Number(m[i]) || 0), 0)),
  ranking(p) {
    const t = Core.totals(p);
    return t.map((total, i) => ({ i, nom: p.joueurs[i], total })).sort((a, b) => p.low ? a.total - b.total : b.total - a.total);
  },
  leaders(p) { const r = Core.ranking(p); return r.filter(x => x.total === r[0].total).map(x => x.i); },
  // joueurs dont le score de la manche dépasse la limite (valeur absolue)
  // joueurs dont le score dépasse le seuil « inhabituel » (confirmation demandée, sans bloquer)
  inhabituel: (p, sc) => !p.usuel ? [] : sc.map((v, i) => Math.abs(Number(v) || 0) > p.usuel ? p.joueurs[i] : null).filter(Boolean),
  depasse: (p, sc) => !p.limite ? [] : sc.map((v, i) => Math.abs(Number(v) || 0) > p.limite ? p.joueurs[i] : null).filter(Boolean),
  targetReached: p => !!p.target && Core.totals(p).some(t => t >= p.target),

  // ---------- gloire, niveaux, badges ----------
  // Gloire (⭐) : +2 par partie jouée ; victoire +8 +2 par adversaire (max 8) ; égalité en tête = moitié ; 2e à 3 joueurs ou + = +nb de joueurs ;
  // série de victoires : +2 par victoire d'affilée à partir de la 2e (max +10).
  LEVELS: [[0, "Novice", "🌱"], [20, "Apprenti", "🎯"], [60, "Joueur", "🎮"], [120, "Confirmé", "⚔️"], [220, "Expert", "💎"], [360, "Maître", "🔥"], [540, "Champion", "🏆"], [800, "Légende", "👑"]],
  VICTOIRE: 14, // gloire moyenne gagnée avec une victoire à 2 joueurs (sert à estimer « N victoires pour passer devant »)
  level(pg) {
    let i = 0; Core.LEVELS.forEach((l, k) => { if (pg >= l[0]) i = k; });
    const cur = Core.LEVELS[i], nx = Core.LEVELS[i + 1];
    return { i, nom: cur[1], emoji: cur[2], next: nx ? nx[0] : null, nextNom: nx ? nx[1] : null, pct: nx ? Math.round(100 * (pg - cur[0]) / (nx[0] - cur[0])) : 100 };
  },
  badges(s, rang) {
    const g = Object.keys(s.jeux).length;
    return [
      ["👑", "Roi du classement", "Être n°1 du classement", rang === 0 && s.jouees > 0, [rang === 0 ? 1 : 0, 1]],
      ["🥇", "Première victoire", "Gagner une partie", s.victoires >= 1, [s.victoires, 1]],
      ["🔥", "En feu", "3 victoires d'affilée en cours", s.serie >= 3, [s.serie, 3]],
      ["⚡", "Série de 5", "5 victoires d'affilée (record)", s.meilleureSerie >= 5, [s.meilleureSerie, 5]],
      ["🎯", "Régulier", "Jouer 10 parties", s.jouees >= 10, [s.jouees, 10]],
      ["💯", "Centenaire", "Jouer 100 parties", s.jouees >= 100, [s.jouees, 100]],
      ["⚔️", "Dominateur", "Gagner 10 parties", s.victoires >= 10, [s.victoires, 10]],
      ["💎", "Invaincu", "100 % de victoires sur 3 parties multijoueurs ou +", s.multi >= 3 && s.victoires === s.multi, [s.multi >= 3 && s.victoires === s.multi ? 3 : Math.min(2, s.multi), 3]],
      ["🌍", "Touche-à-tout", "Jouer à 5 jeux différents", g >= 5, [g, 5]],
      ["🌟", "Cent de gloire", "Atteindre 100 ⭐", s.pg >= 100, [s.pg, 100]],
      ["🏆", "Grand champion", "Atteindre 540 ⭐ (niveau Champion)", s.pg >= 540, [s.pg, 540]]
    ];
  },
  // jours de jeu consécutifs (jusqu'à aujourd'hui, ou hier si pas encore joué aujourd'hui)
  jours(parties, nom) {
    const k = Core.norm(nom), days = new Set(parties.filter(p => p.fini && p.joueurs.some(n => Core.norm(n) === k)).map(p => new Date(p.date).toDateString()));
    const d = new Date(); if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    let n = 0; while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); } return n;
  },
  // statistiques par joueur (mode = "cartes" | "autres" | null ; days = 0 pour tout l'historique)
  stats(parties, mode, days) {
    const since = days ? Date.now() - days * 864e5 : 0, m = {};
    parties.filter(p => p.fini && (!mode || p.mode === mode) && (!since || new Date(p.date).getTime() >= since))
      .sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(p => {
        const t = Core.totals(p), n = p.joueurs.length;
        const rk = t.map(v => 1 + t.filter(w => p.low ? w < v : w > v).length), tops = rk.filter(x => x === 1).length;
        p.joueurs.forEach((nom, i) => {
          const k = Core.norm(nom); if (!k) return;
          const r = m[k] || (m[k] = { nom: nom.trim(), jouees: 0, multi: 0, victoires: 0, defaites: 0, egalites: 0, points: 0, pg: 0, serie: 0, meilleureSerie: 0, forme: [], jeux: {}, vic: {}, bat: {}, perdu: {}, derniere: 0 });
          r.jouees++; r.points += t[i]; r.jeux[p.jeu] = (r.jeux[p.jeu] || 0) + 1; r.derniere = Math.max(r.derniere, new Date(p.date).getTime()); r.pg += 2;
          if (n < 2) return;
          r.multi++;
          const val = 8 + 2 * Math.min(n, 8);
          if (rk[i] === 1 && tops === 1) {
            r.victoires++; r.serie++; r.meilleureSerie = Math.max(r.meilleureSerie, r.serie); r.vic[p.jeu] = (r.vic[p.jeu] || 0) + 1;
            r.pg += val + (r.serie >= 2 ? Math.min(r.serie - 1, 5) * 2 : 0); r.forme.push("V");
          } else if (rk[i] === 1) { r.egalites++; r.serie = 0; r.pg += Math.round(val / 2); r.forme.push("E"); }
          else { r.defaites++; r.serie = 0; if (rk[i] === 2 && n >= 3) r.pg += n; r.forme.push("D"); }
          p.joueurs.forEach((o, j) => {
            const ko = Core.norm(o); if (j === i || !ko || ko === k) return;
            if (rk[i] < rk[j]) r.bat[ko] = (r.bat[ko] || 0) + 1; else if (rk[i] > rk[j]) r.perdu[ko] = (r.perdu[ko] || 0) + 1;
          });
        });
      });
    const top = o => { const e = Object.entries(o).sort((a, b) => b[1] - a[1])[0]; return e && m[e[0]] ? { nom: m[e[0]].nom, n: e[1] } : null; };
    return Object.values(m).map(r => ({ ...r, forme: r.forme.slice(-5), taux: r.multi ? Math.round(100 * r.victoires / r.multi) : 0, moy: r.jouees ? Math.round(r.points / r.jouees) : 0,
      nemesis: top(r.perdu), victime: top(r.bat), meilleurJeu: (e => e ? e[0] : null)(Object.entries(r.vic).sort((a, b) => b[1] - a[1])[0]), niveau: Core.level(r.pg) }))
      .sort((a, b) => b.pg - a.pg || b.victoires - a.victoires || a.jouees - b.jouees);
  },
  // détail d'un joueur : ses parties (avec résultat), évolution de sa gloire, records
  profil(parties, nom) {
    const k = Core.norm(nom), done = parties.filter(p => p.fini).sort((a, b) => new Date(a.date) - new Date(b.date)), mine = [];
    done.forEach((p, idx) => {
      const i = p.joueurs.findIndex(n => Core.norm(n) === k); if (i < 0) return;
      const t = Core.totals(p), n = p.joueurs.length, rk = t.map(v => 1 + t.filter(w => p.low ? w < v : w > v).length), tops = rk.filter(x => x === 1).length;
      const res = n < 2 ? "S" : rk[i] === 1 && tops === 1 ? "V" : rk[i] === 1 ? "E" : "D";
      const autres = t.filter((_, j) => j !== i), marge = res === "V" ? Math.abs(t[i] - (p.low ? Math.min(...autres) : Math.max(...autres))) : 0;
      mine.push({ idx, jeu: p.jeu, emoji: p.emoji, date: p.date, mode: p.mode, n, rang: rk[i], score: t[i], res, marge, low: !!p.low, adv: p.joueurs.filter((_, j) => j !== i) });
    });
    const evo = mine.slice(-30).map(g => { const s = Core.stats(done.slice(0, g.idx + 1)).find(x => Core.norm(x.nom) === k); return s ? s.pg : 0; });
    const hauts = mine.filter(g => !g.low && g.n > 1), bestScore = hauts.sort((a, b) => b.score - a.score)[0] || null;
    const bestMarge = mine.filter(g => g.res === "V").sort((a, b) => b.marge - a.marge)[0] || null;
    return { mine, evo, premiere: mine[0] ? mine[0].date : null, bestScore, bestMarge, points: mine.reduce((s, g) => s + g.score, 0) };
  },
  favori: jeux => Object.entries(jeux || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
};
