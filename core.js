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
  async removeAll() { Core._sp([]); Core._spq([]); Core.hist = []; try { await Core._json(Core.API, { method: "DELETE", headers: { "X-Confirm": "tout-supprimer" } }); } catch (e) {} },
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
      gid: game.id, coop: !!game.coop, joueurs: names, manches: [], quick: game.quick || [], date: new Date().toISOString(), fini: false };
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
  // Catégories de succès (ordre d'affichage)
  ACH_CATS: [["debuts", "🎲", "Premiers pas"], ["parties", "🎯", "Parties jouées"], ["victoires", "⚔️", "Victoires"], ["series", "🔥", "Séries"], ["assidu", "📅", "Assiduité"], ["variete", "🌍", "Variété"], ["exploits", "💥", "Exploits"], ["gloire", "⭐", "Gloire"]],
  // extras utiles aux succès (calculés à partir des parties du joueur)
  extras(parties, nom) {
    const k = Core.norm(nom), done = parties.filter(p => p.fini && p.joueurs.some(n => Core.norm(n) === k));
    const pr = Core.profil(parties, nom), mine = pr.mine, x = { jours: Core.jours(parties, nom), maxN: 0, podiums: 0, nuit: 0, matin: 0, weekend: 0, modes: 0, solo: 0, duo: 0, adv: 0, jeuMax: 0, jeuVicMax: 0, ecrasant: 0, serre: 0, grande: 0 };
    const modes = new Set(), adv = new Set(), par = {}, vic = {};
    done.forEach(p => { const d = new Date(p.date), h = d.getHours(), w = d.getDay(); if (h < 5) x.nuit++; else if (h < 8) x.matin++; if (w === 0 || w === 6) x.weekend++; modes.add(p.mode); });
    mine.forEach(g => {
      x.maxN = Math.max(x.maxN, g.n); par[g.jeu] = (par[g.jeu] || 0) + 1;
      if (g.n < 2) x.solo++; if (g.n === 2) x.duo++;
      if (g.n >= 3 && g.rang <= 3) x.podiums++;
      g.adv.forEach(a => adv.add(Core.norm(a)));
      if (g.res === "V") { vic[g.jeu] = (vic[g.jeu] || 0) + 1; if (g.n >= 5) x.grande++; if (!g.low && g.score >= 5 && g.marge >= g.score / 2) x.ecrasant++; if (g.score >= 5 && g.marge <= 1) x.serre++; }
    });
    x.modes = modes.size; x.adv = adv.size; x.jeuMax = Math.max(0, ...Object.values(par)); x.jeuVicMax = Math.max(0, ...Object.values(vic));
    return x;
  },
  // [emoji, nom, description, débloqué, [actuel, objectif], catégorie]
  badges(s, rang, x) {
    x = x || {}; const g = Object.keys(s.jeux).length, n = v => v || 0, A = (e, nom, d, cur, goal, cat) => [e, nom, d, cur >= goal, [Math.min(cur, goal), goal], cat];
    return [
      A("🎲", "Premier pas", "Terminer une partie", s.jouees, 1, "debuts"),
      A("🥇", "Première victoire", "Gagner une partie", s.victoires, 1, "debuts"),
      A("🧑‍🤝‍🧑", "Jamais sans amis", "Jouer une partie à 3 joueurs ou plus", n(x.maxN), 3, "debuts"),
      A("🧍", "En solo", "Jouer une partie seul", n(x.solo), 1, "debuts"),
      A("🥉", "Habitué du podium", "Finir 5 fois dans les 3 premiers (parties à 3+)", n(x.podiums), 5, "debuts"),
      A("🎯", "Régulier", "Jouer 10 parties", s.jouees, 10, "parties"),
      A("🎮", "Habitué", "Jouer 25 parties", s.jouees, 25, "parties"),
      A("🔁", "Accro", "Jouer 50 parties", s.jouees, 50, "parties"),
      A("💯", "Centenaire", "Jouer 100 parties", s.jouees, 100, "parties"),
      A("🏃", "Marathonien", "Jouer 250 parties", s.jouees, 250, "parties"),
      A("🥊", "Gagnant", "Gagner 5 parties", s.victoires, 5, "victoires"),
      A("⚔️", "Dominateur", "Gagner 10 parties", s.victoires, 10, "victoires"),
      A("🛡️", "Machine à gagner", "Gagner 25 parties", s.victoires, 25, "victoires"),
      A("🐉", "Terreur de la table", "Gagner 50 parties", s.victoires, 50, "victoires"),
      A("👑", "Roi du classement", "Être n°1 du classement", rang === 0 && s.jouees > 0 ? 1 : 0, 1, "victoires"),
      A("🔥", "En feu", "3 victoires d'affilée (record)", s.meilleureSerie, 3, "series"),
      A("⚡", "Série de 5", "5 victoires d'affilée (record)", s.meilleureSerie, 5, "series"),
      A("🚀", "Imparable", "8 victoires d'affilée (record)", s.meilleureSerie, 8, "series"),
      A("💎", "Invaincu", "100 % de victoires sur 3 parties multijoueurs ou plus", s.multi >= 3 && s.victoires === s.multi ? 3 : Math.min(2, s.multi), 3, "series"),
      A("📆", "Trois jours de suite", "Jouer 3 jours d'affilée", n(x.jours), 3, "assidu"),
      A("🗓️", "Semaine parfaite", "Jouer 7 jours d'affilée", n(x.jours), 7, "assidu"),
      A("🏖️", "Joueur du week-end", "Jouer 5 parties le samedi ou le dimanche", n(x.weekend), 5, "assidu"),
      A("🌙", "Noctambule", "Jouer une partie entre minuit et 5 h", n(x.nuit), 1, "assidu"),
      A("🌅", "Lève-tôt", "Jouer une partie entre 5 h et 8 h", n(x.matin), 1, "assidu"),
      A("🌍", "Touche-à-tout", "Jouer à 5 jeux différents", g, 5, "variete"),
      A("🧭", "Explorateur", "Jouer à 10 jeux différents", g, 10, "variete"),
      A("🗺️", "Globe-trotter", "Jouer à 20 jeux différents", g, 20, "variete"),
      A("❤️", "Fidèle", "Jouer 10 parties au même jeu", n(x.jeuMax), 10, "variete"),
      A("🎓", "Spécialiste", "Gagner 5 parties au même jeu", n(x.jeuVicMax), 5, "variete"),
      A("🃏", "Deux mondes", "Jouer en mode Cartes et en mode Autres jeux", n(x.modes), 2, "variete"),
      A("🤝", "Sociable", "Affronter 5 adversaires différents", n(x.adv), 5, "variete"),
      A("🎪", "Grande tablée", "Gagner une partie à 5 joueurs ou plus", n(x.grande), 1, "exploits"),
      A("💥", "Victoire écrasante", "Gagner avec une marge d'au moins la moitié de son score", n(x.ecrasant), 1, "exploits"),
      A("😅", "Au poil !", "Gagner avec 1 point d'écart", n(x.serre), 1, "exploits"),
      A("🥋", "Duelliste", "Jouer 10 duels (2 joueurs)", n(x.duo), 10, "exploits"),
      A("🌟", "Cent de gloire", "Atteindre 100 ⭐", s.pg, 100, "gloire"),
      A("💠", "Expert", "Atteindre 220 ⭐", s.pg, 220, "gloire"),
      A("🏆", "Grand champion", "Atteindre 540 ⭐ (niveau Champion)", s.pg, 540, "gloire"),
      A("🌌", "Légende", "Atteindre 800 ⭐", s.pg, 800, "gloire")
    ];
  },
  // jours de jeu consécutifs (jusqu'à aujourd'hui, ou hier si pas encore joué aujourd'hui)
  jours(parties, nom) {
    const k = Core.norm(nom), days = new Set(parties.filter(p => p.fini && p.joueurs.some(n => Core.norm(n) === k)).map(p => new Date(p.date).toDateString()));
    const d = new Date(); if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    let n = 0; while (days.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); } return n;
  },
  // jeux coopératifs (victoire / défaite d'équipe) et équipes dont on connaît les joueurs
  rank(p, t) {
    if (p.coop && p.victoire !== undefined) return { rk: t.map(() => p.victoire ? 1 : 2), tops: p.victoire ? 1 : 0 };
    if (p.teamOf) {
      const ts = [...new Set(p.teamOf)].map(k => t[p.teamOf.indexOf(k)]), rk = t.map(v => 1 + ts.filter(w => p.low ? w < v : w > v).length);
      return { rk, tops: ts.filter(w => !ts.some(x => p.low ? x < w : x > w)).length };
    }
    const rk = t.map(v => 1 + t.filter(w => p.low ? w < v : w > v).length); return { rk, tops: rk.filter(x => x === 1).length };
  },
  // partie par équipes avec les joueurs de chaque équipe (p.membres) -> une ligne par joueur (les stats vont à chaque personne)
  explode: parties => parties.map(p => {
    if (!p.membres || !p.fini || p.teamOf) return p;
    const flat = [], teamOf = [];
    p.joueurs.forEach((t, i) => { const ms = (p.membres[i] || []).filter(Boolean); (ms.length ? ms : [t]).forEach(n => { flat.push(n); teamOf.push(i); }); });
    return { ...p, joueurs: flat, teamOf, manches: p.manches.map(m => teamOf.map(i => m[i])), equipes: p.joueurs };
  }),
  // niveau Elo (départ 1000) calculé sur une liste de parties d'un même jeu : battre un joueur mieux classé rapporte plus
  elo(parties) {
    const m = {}, K = 24;
    Core.explode(parties).filter(p => p.fini && !p.coop && p.joueurs.length > 1).sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(p => {
      const t = Core.totals(p), d = p.joueurs.map(() => 0), ks = p.joueurs.map(n => Core.norm(n));
      ks.forEach((k, i) => { if (k && !m[k]) m[k] = { nom: p.joueurs[i].trim(), elo: 1000, n: 0 }; });
      let opp = ks.map(() => 0);
      p.joueurs.forEach((_, i) => p.joueurs.forEach((__, j) => { if (i === j || !ks[i] || !ks[j] || ks[i] === ks[j] || (p.teamOf && p.teamOf[i] === p.teamOf[j])) return; opp[i]++; }));
      p.joueurs.forEach((_, i) => p.joueurs.forEach((__, j) => {
        if (i === j || !ks[i] || !ks[j] || ks[i] === ks[j] || (p.teamOf && p.teamOf[i] === p.teamOf[j])) return;
        const s = t[i] === t[j] ? .5 : ((p.low ? t[i] < t[j] : t[i] > t[j]) ? 1 : 0), e = 1 / (1 + Math.pow(10, (m[ks[j]].elo - m[ks[i]].elo) / 400));
        d[i] += (s - e) * K / opp[i];
      }));
      ks.forEach((k, i) => { if (k) { m[k].elo += d[i]; m[k].n++; } });
    });
    return Object.values(m).map(x => ({ ...x, elo: Math.round(x.elo) })).sort((a, b) => b.elo - a.elo);
  },
  // statistiques par joueur (mode = "cartes" | "autres" | null ; days = 0 pour tout l'historique)
  stats(parties, mode, days) {
    const since = days ? Date.now() - days * 864e5 : 0, m = {};
    Core.explode(parties).filter(p => p.fini && (!mode || p.mode === mode) && (!since || new Date(p.date).getTime() >= since))
      .sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(p => {
        const t = Core.totals(p), n = p.teamOf ? new Set(p.teamOf).size : p.joueurs.length;
        const rk = Core.rank(p, t).rk, tops = Core.rank(p, t).tops;
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
    const k = Core.norm(nom), done = Core.explode(parties).filter(p => p.fini).sort((a, b) => new Date(a.date) - new Date(b.date)), mine = [];
    done.forEach((p, idx) => {
      const i = p.joueurs.findIndex(n => Core.norm(n) === k); if (i < 0) return;
      const t = Core.totals(p), n = p.teamOf ? new Set(p.teamOf).size : p.joueurs.length, rk = Core.rank(p, t).rk, tops = Core.rank(p, t).tops;
      const res = n < 2 ? "S" : rk[i] === 1 && tops === 1 ? "V" : rk[i] === 1 ? "E" : "D";
      const autres = t.filter((_, j) => j !== i && (!p.teamOf || p.teamOf[j] !== p.teamOf[i])), marge = res === "V" ? Math.abs(t[i] - (p.low ? Math.min(...autres) : Math.max(...autres))) : 0;
      mine.push({ idx, jeu: p.jeu, emoji: p.emoji, date: p.date, mode: p.mode, n, rang: rk[i], score: t[i], res, marge, low: !!p.low, adv: p.joueurs.filter((_, j) => j !== i && (!p.teamOf || p.teamOf[j] !== p.teamOf[i])) });
    });
    const evo = mine.slice(-30).map(g => { const s = Core.stats(done.slice(0, g.idx + 1)).find(x => Core.norm(x.nom) === k); return s ? s.pg : 0; });
    const hauts = mine.filter(g => !g.low && g.n > 1), bestScore = hauts.sort((a, b) => b.score - a.score)[0] || null;
    const bestMarge = mine.filter(g => g.res === "V").sort((a, b) => b.marge - a.marge)[0] || null;
    return { mine, evo, premiere: mine[0] ? mine[0].date : null, bestScore, bestMarge, points: mine.reduce((s, g) => s + g.score, 0) };
  },
  favori: jeux => Object.entries(jeux || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
};
