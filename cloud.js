// Comptes joueurs (Supabase) : connexion par pseudo + mot de passe, sauvegarde en ligne par compte, classement général.
// Sans configuration (config.js vide) : l'appli reste 100 % locale.
const Cloud = {
  SK: "sm_session", UK: "sm_uid", board: null, boardT: 0, boardErr: "", _pp: null, _last: "", msg: "",
  cfg() { const c = window.SM_CLOUD || {}; return c.url && c.key ? { url: c.url.replace(/\/+$/, ""), key: c.key } : null; },
  enabled() { return !!Cloud.cfg(); },
  session() { try { return JSON.parse(localStorage.getItem(Cloud.SK)); } catch (e) { return null; } },
  active() { return Cloud.enabled() && !!Cloud.session(); },
  pseudo() { const s = Cloud.session(); return s && s.pseudo || ""; },
  email: p => Core.norm(p).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + "@scoremaster.app",
  _store(d, pseudo) {
    const prev = Cloud.session() || {};
    const s = { access: d.access_token, refresh: d.refresh_token, exp: Date.now() + (d.expires_in || 3600) * 1000 - 60000, uid: (d.user && d.user.id) || prev.uid,
      pseudo: pseudo || (d.user && d.user.user_metadata && d.user.user_metadata.pseudo) || prev.pseudo || "" };
    try { localStorage.setItem(Cloud.SK, JSON.stringify(s)); } catch (e) {} return s;
  },
  async _auth(path, body) {
    const c = Cloud.cfg(), r = await fetch(c.url + "/auth/v1/" + path, { method: "POST", headers: { "Content-Type": "application/json", apikey: c.key }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.msg || d.error_description || d.message || d.error || ("Erreur " + r.status));
    return d;
  },
  async token() {
    let s = Cloud.session(); if (!s) throw new Error("non connecté");
    if (Date.now() < s.exp) return s.access;
    try { const d = await Cloud._auth("token?grant_type=refresh_token", { refresh_token: s.refresh }); return Cloud._store(d).access; }
    catch (e) { if (navigator.onLine !== false && /invalid|expired|not found|Erreur 4/i.test(e.message)) { /* session périmée */ } throw e; }
  },
  async rest(method, path, body, extra) {
    const c = Cloud.cfg(), t = await Cloud.token(), ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(c.url + "/rest/v1/" + path, { method, signal: ctl.signal, headers: { "Content-Type": "application/json", apikey: c.key, Authorization: "Bearer " + t, ...(extra || {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.text().catch(() => "")) || r.status);
      const tx = await r.text(); return tx ? JSON.parse(tx) : null;
    } finally { clearTimeout(to); }
  },
  // ----- compte -----
  _wipeLocal() {
    ["sm_parties", "sm_parties_pending", Core.SK, Core.SK + "_d", "sm_current_cartes", "sm_current_autres", Core.KEY].forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    Core.store = null; Core.dirty = {}; Core.hist = null; Core.histT = 0;
  },
  async _after(d, pseudo) {
    const s = Cloud._store(d, pseudo), last = localStorage.getItem(Cloud.UK);
    if (last && last !== s.uid) Cloud._wipeLocal();            // autre compte sur ce téléphone : on repart propre
    else { Core._load(); Object.keys(Core.store).forEach(k => Core.dirty[k] = 1); Core._save(); Core._spq(Core._lp().map(p => p.id)); }   // données locales rattachées au compte
    try { localStorage.setItem(Cloud.UK, s.uid); } catch (e) {}
    if (!Core.me().nom) Core.setMe({ ...Core.me(), nom: s.pseudo });
    await Core.sync(); await Core.list(); Cloud.pushProfile(true); return s;
  },
  async signup(pseudo, pw) {
    pseudo = (pseudo || "").trim();
    if (pseudo.length < 2 || pseudo.length > 20) throw new Error("Le pseudo doit faire 2 à 20 caractères.");
    if (!/[a-z0-9]/i.test(Core.norm(pseudo))) throw new Error("Le pseudo doit contenir des lettres ou des chiffres.");
    if ((pw || "").length < 6) throw new Error("Le mot de passe doit faire au moins 6 caractères.");
    let d; try { d = await Cloud._auth("signup", { email: Cloud.email(pseudo), password: pw, data: { pseudo } }); }
    catch (e) { throw new Error(/already|registered|exists/i.test(e.message) ? "Ce pseudo est déjà pris." : e.message); }
    if (!d.access_token) throw new Error("Compte créé mais la confirmation par e-mail est activée dans Supabase : désactive « Confirm email » (voir LISEZ-MOI-COMPTES.txt).");
    return Cloud._after(d, pseudo);
  },
  async login(pseudo, pw) {
    pseudo = (pseudo || "").trim(); if (!pseudo || !pw) throw new Error("Pseudo et mot de passe requis.");
    let d; try { d = await Cloud._auth("token?grant_type=password", { email: Cloud.email(pseudo), password: pw }); }
    catch (e) { throw new Error(/invalid|credentials/i.test(e.message) ? "Pseudo ou mot de passe incorrect." : e.message); }
    return Cloud._after(d, null);
  },
  logout() { try { localStorage.removeItem(Cloud.SK); } catch (e) {} Cloud._wipeLocal(); try { localStorage.removeItem(Cloud.UK); } catch (e) {} },
  // ----- passerelle utilisée par Core (mêmes chemins que l'ancien serveur) -----
  async call(url, method, bodyText) {
    const uid = Cloud.session().uid, body = bodyText ? JSON.parse(bodyText) : null;
    if (url === "api/parties") {
      if (method === "GET") { const rows = await Cloud.rest("GET", "parties?select=data&order=updated_at.desc&limit=5000"); return rows.map(r => r.data); }
      if (method === "POST") { await Cloud.rest("POST", "parties?on_conflict=owner,id", { owner: uid, id: body.id, data: body, updated_at: new Date().toISOString() }, { Prefer: "resolution=merge-duplicates,return=minimal" }); return { ok: true }; }
      if (method === "DELETE") { await Cloud.rest("DELETE", "parties?owner=eq." + uid, undefined, { Prefer: "return=minimal" }); return { ok: true }; }
    }
    const m = url.match(/^api\/parties\/(.+)$/);
    if (m && method === "DELETE") { await Cloud.rest("DELETE", "parties?owner=eq." + uid + "&id=eq." + encodeURIComponent(decodeURIComponent(m[1])), undefined, { Prefer: "return=minimal" }); return { ok: true }; }
    if (url === "api/settings") {
      const rows = await Cloud.rest("GET", "reglages?select=entries&user_id=eq." + uid), cur = (rows && rows[0] && rows[0].entries) || {};
      if (method === "GET") return { entries: cur };
      const inc = (body && body.entries) || {}; let ch = false;
      Object.keys(inc).forEach(k => { const e = inc[k]; if (e && typeof e.t === "number" && (!cur[k] || e.t > cur[k].t)) { cur[k] = { v: e.v, t: e.t }; ch = true; } });
      if (ch) await Cloud.rest("POST", "reglages?on_conflict=user_id", { user_id: uid, entries: cur, updated_at: new Date().toISOString() }, { Prefer: "resolution=merge-duplicates,return=minimal" });
      return { entries: cur };
    }
    throw new Error("route inconnue");
  },
  // ----- classement général -----
  _mine() {
    const me = Core.me(), nom = me.nom || Cloud.pseudo(), k = Core.norm(nom), out = {};
    ["cartes", "autres"].forEach(m => { const r = Core.stats(Core.hist || [], m).find(x => Core.norm(x.nom) === k); if (r) out[m] = { pg: r.pg, jouees: r.jouees, victoires: r.victoires, defaites: r.defaites, egalites: r.egalites, taux: r.taux, serie: r.serie, niveau: r.niveau }; });
    return out;
  },
  pushProfile(now) {
    if (!Cloud.active() || !Core.hist) return; clearTimeout(Cloud._pp);
    const go = async () => {
      try {
        const s = Cloud.session(), me = Core.me(), stats = Cloud._mine(), sig = JSON.stringify([stats, me.emoji, s.pseudo]);
        if (sig === Cloud._last) return;
        await Cloud.rest("POST", "profiles?on_conflict=user_id", { user_id: s.uid, pseudo: s.pseudo, avatar: me.emoji || "🎲", stats, updated_at: new Date().toISOString() }, { Prefer: "resolution=merge-duplicates,return=minimal" });
        Cloud._last = sig;
      } catch (e) { /* hors ligne : réessayé plus tard */ }
    };
    if (now) return go(); Cloud._pp = setTimeout(go, 1500);
  },
  async loadBoard() {
    Cloud.boardT = Date.now();
    try { Cloud.board = await Cloud.rest("GET", "profiles?select=user_id,pseudo,avatar,stats,updated_at&limit=500"); Cloud.boardErr = ""; }
    catch (e) { Cloud.boardErr = "Impossible de charger le classement (hors ligne ?)."; }
  }
};
