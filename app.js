// ScoreMaster — une appli, deux modes (cartes / autres jeux), pages par hash
const $ = s => document.querySelector(s);
const E = Core.esc;
const MODES = { cartes: { nom: "Cartes", emoji: "🃏" }, autres: { nom: "Autres jeux", emoji: "🎲" } };
const ALL = [
  ...window.CAT_CARTES.map(g => ({ ...g, mode: "cartes" })),
  ...window.CAT_AUTRES.map(g => ({ ...g, mode: "autres" }))
];
const free = mode => ({ id: "libre-" + mode, name: "Jeu libre", emoji: "✏️", cat: "Libre", mode, min: 1, max: 12, dp: 2,
  low: false, rules: [], scoring: [], winner: [], quick: [], targets: [] });
const gamesOf = mode => [...ALL.filter(g => g.mode === mode), free(mode)];
const findGame = id => ALL.find(g => g.id === id) || [free("cartes"), free("autres")].find(g => g.id === id);
const AVATARS = ["🎲", "🃏", "👑", "🦊", "🐼", "🦁", "🐙", "🚀", "⚡", "🔥", "🌈", "🍀"];

const isMe = n => !!Core.me().nom && Core.norm(n) === Core.norm(Core.me().nom);
const avatarHtml = me => me.photo ? `<img src="${me.photo}" alt="">` : me.emoji;
const mini = n => isMe(n) ? `<span class="av mini">${avatarHtml(Core.me())}</span> ` : "";

// Photo choisie : recadrée en carré 256 px, compressée (≈ 20 Ko)
function photoToAvatar(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error("Ce fichier n'est pas une image."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture impossible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image illisible."));
      img.onload = () => {
        const size = 256, side = Math.min(img.width, img.height), c = document.createElement("canvas");
        c.width = c.height = size;
        c.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Accepte les parties du nouveau format et celles des anciennes sauvegardes ScoreMaster
function normalizeGame(g) {
  if (g.joueurs && g.manches) return { ...g, id: String(g.id), mode: g.mode || (ALL.find(x => x.name === g.jeu) || {}).mode || "cartes", fini: g.fini !== false };
  if (!g.players || !g.rounds) return null;
  const info = ALL.find(x => x.id === g.gameId) || ALL.find(x => x.name === g.name);
  const m = String(g.date || "").match(/(\d+)\/(\d+)\/(\d+)[ ,]+(\d+):(\d+)/);
  return { id: String(g.id), mode: info ? info.mode : "cartes", jeu: g.name, emoji: info ? info.emoji : "✏️", low: !!g.lowWins, target: g.target || 0,
    joueurs: g.players.map(p => p.name), manches: g.rounds, quick: [], fini: true,
    date: m ? new Date(+m[3], m[2] - 1, +m[1], +m[4], +m[5]).toISOString() : new Date(Number(g.id) || Date.now()).toISOString() };
}

const S = { hist: [], _cur: { cartes: Core.current("cartes"), autres: Core.current("autres") }, get cur() { return this._cur[Core.mode()] || null; }, set cur(v) { this._cur[Core.mode()] = v; }, last: null, pick: null, np: 2, names: [], q: "", filter: "tout", edit: null, focus: 0, pf: "tout", vi: 0, run: null, res: null, stops: [], lim: "auto", limv: "", per: "tout", sort: "pg", goal: null, rh: null, page: null };

const limiteAuto = (g, vv, np) => { const f = window.LIM && window.LIM[g.id]; return f === undefined ? 0 : Math.max(0, typeof f === "function" ? f({ v: vv ? vv[0] : "", np }) : f); };
const usuelAuto = (g, vv) => { const f = window.USUEL && window.USUEL[g.id]; return f === undefined ? 0 : Math.max(0, typeof f === "function" ? f({ v: vv ? vv[0] : "" }) : f); };
const nbJoueurs = g => g.min === g.max ? g.min + " joueurs" : g.min + "–" + g.max + " joueurs";
const label = g => g.teams ? "équipe" : "joueur";
const dateFr = d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const back = `<a class="back" href="#/">← Accueil</a>`, backPlus = `<a class="back" href="#/plus">← Plus</a>`;
const chips = () => `<div class="chips">${["tout", "cartes", "autres"].map(f =>
  `<button data-a="filter" data-v="${f}" class="${S.filter === f ? "on" : ""}">${f === "tout" ? "Tout" : MODES[f].emoji + " " + MODES[f].nom}</button>`).join("")}</div>`;
const inPer = p => S.per === "tout" || Date.now() - new Date(p.date) <= Number(S.per) * 864e5;
const PERS = [["tout", "Depuis toujours"], ["30", "30 jours"], ["7", "Cette semaine"]];
const SORTS = [["pg", "⭐ Gloire"], ["vic", "🏆 Victoires"], ["taux", "📈 Réussite"]];
const SORT = { pg: (a, b) => b.pg - a.pg || b.victoires - a.victoires || a.jouees - b.jouees, vic: (a, b) => b.victoires - a.victoires || b.pg - a.pg,
  taux: (a, b) => (b.jouees >= 3) - (a.jouees >= 3) || b.taux - a.taux || b.jouees - a.jouees };
const chipRow = (list, key, cur) => `<div class="chips">${list.map(([k, t]) => `<button data-a="${key}" data-v="${k}" class="${cur === k ? "on" : ""}">${t}</button>`).join("")}</div>`;
const face = n => isMe(n) ? `<span class="av">${avatarHtml(Core.me())}</span>`
  : `<span class="av" style="background:hsl(${[...Core.norm(n)].reduce((h, c) => h * 31 + c.charCodeAt(0), 7) % 360} 55% 34%)">${E((n.trim()[0] || "?").toUpperCase())}</span>`;
const forme = f => `<span class="forme">${f.length ? f.map(r => `<i class="d ${r}" title="${{ V: "Victoire", D: "Défaite", E: "Égalité" }[r]}">${r}</i>`).join("") : "<small>—</small>"}</span>`;
const xp = s => `<div class="xp"><div class="xpt"><b>${s.niveau.emoji} ${s.niveau.nom}</b><small>${s.niveau.next ? s.pg + " / " + s.niveau.next + " ⭐ → " + s.niveau.nextNom : s.pg + " ⭐ · niveau max !"}</small></div>
  <div class="bar"><i style="width:${s.niveau.pct}%"></i></div></div>`;
const detailStats = (s, rang, all) => `${xp(s)}
  <div class="kpis"><div><b>${s.victoires}</b><small>victoires</small></div><div><b>${s.defaites}</b><small>défaites</small></div><div><b>${s.meilleureSerie}</b><small>meilleure série</small></div></div>
  <div class="kpis"><div><b>${s.taux}%</b><small>réussite</small></div><div><b>${s.jouees}</b><small>parties</small></div><div><b>${s.moy}</b><small>points moy.</small></div></div>
  <div class="row"><span>Forme (5 dernières)</span>${forme(s.forme)}</div>
  ${s.serie >= 2 ? `<div class="row"><span>Série en cours</span><b>🔥 ${s.serie} victoires</b></div>` : ""}
  ${s.meilleurJeu ? `<div class="row"><span>Jeu fétiche</span><b>${E(s.meilleurJeu)}</b></div>` : ""}
  ${s.nemesis ? `<div class="row"><span>😈 Bête noire</span><b>${E(s.nemesis.nom)} <small>(${s.nemesis.n}×)</small></b></div>` : ""}
  ${s.victime ? `<div class="row"><span>🎯 Tu domines</span><b>${E(s.victime.nom)} <small>(${s.victime.n}×)</small></b></div>` : ""}
  <div class="badges">${Core.badges(s, rang).filter(b => b[3]).map(([e, n, d]) => `<span class="bdg" title="${E(d)}">${e} ${n}</span>`).join("") || "<small>Aucun succès débloqué pour l'instant.</small>"}</div><a class="link" href="#/succes">🏆 Voir tous les succès →</a>`;
// défi : combien de gloire pour passer devant / prendre le trône
function defiHtml(byPg) {
  const me = Core.me(); if (!me.nom) return `<p>👤 Crée ton profil pour te mesurer aux autres et viser la 1<sup>re</sup> place.</p><a class="btn main" href="#/profil">Créer mon profil</a>`;
  const i = byPg.findIndex(x => Core.norm(x.nom) === Core.norm(me.nom)); if (i < 0) return `<p>Joue une partie sous le nom <b>${E(me.nom)}</b> pour entrer dans la course au trône. 👑</p><a class="btn main" href="#/nouvelle">🎮 Jouer maintenant</a>`;
  const m = byPg[i], king = byPg[0], up = byPg[i - 1];
  if (i === 0) { const sec = byPg[1]; return sec ? `<p>👑 <b>Tu règnes sur le classement !</b> Tu as <b>${m.pg - sec.pg} ⭐</b> d'avance sur ${E(sec.nom)}. Une seule défaite peut tout changer : défends ta couronne !</p><div class="bar big"><i style="width:100%"></i></div>`
    : `<p>👑 Tu es seul au sommet. Invite des amis à jouer pour défendre ta couronne !</p>`; }
  const gapKing = king.pg - m.pg + 1, gapUp = up.pg - m.pg + 1, wins = Math.ceil(gapKing / Core.VICTOIRE);
  return `<p>Tu es <b>#${i + 1}</b> avec <b>${m.pg} ⭐</b>.<br>⚔️ Il te manque <b>${gapUp} ⭐</b> pour dépasser <b>${E(up.nom)}</b>.<br>👑 Le trône de <b>${E(king.nom)}</b> est à <b>${gapKing} ⭐</b> — environ <b>${wins} victoire${wins > 1 ? "s" : ""}</b>.</p>
    <div class="bar big"><i style="width:${Math.max(4, Math.round(100 * m.pg / king.pg))}%"></i></div><small>${Math.round(100 * m.pg / king.pg)} % de la gloire du roi</small>`;
}
const inMode = (p, m = Core.mode()) => (p.mode === "autres" ? "autres" : "cartes") === m;
const histMode = (m = Core.mode()) => S.hist.filter(p => inMode(p, m));
const histFiltered = () => histMode().filter(p => p.fini);
const known = () => [...new Set(S.hist.flatMap(p => p.joueurs.map(n => n.trim())).filter(Boolean))];

// ---------- accueil : sélecteur de jeu ----------
function pickerHtml() {
  const q = Core.norm(S.q);
  const pf = Core.mode() === "autres" ? S.pf : "tout";
  const fv = Core.favs(), rank = g => fv.includes(g.id) ? 0 : 1;
  return gamesOf(Core.mode()).map((g, i) => [g, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(x => x[0]).filter(g => (pf === "tout" || (pf === "play" && g.play) || (pf === "solo" && g.solo)) && (!q || Core.norm(g.name).includes(q) || Core.norm(g.cat).includes(q))).map(g =>
    `<button class="choice ${S.pick && S.pick.id === g.id ? "on" : ""}" data-a="pick" data-v="${g.id}">
      <span>${fv.includes(g.id) ? "⭐ " : ""}${g.emoji} ${E(g.name)}${g.play ? " ▶️" : ""}</span><small>${g.id.startsWith("libre") ? "au choix" : g.solo ? "solo" : nbJoueurs(g)}</small></button>`).join("")
    || `<p class="empty">Aucun jeu trouvé</p>`;
}
function limiteHtml(g, vv) {
  const auto = limiteAuto(g, vv, S.np);
  return `<label for="lim">📏 Limite de points par manche</label><select id="lim">
      <option value="auto" ${S.lim === "auto" ? "selected" : ""}>Automatique ${auto ? "(" + auto + " points, selon le jeu et la variante)" : "(aucune pour ce jeu)"}</option>
      <option value="0" ${S.lim === "0" ? "selected" : ""}>Sans limite</option>
      <option value="custom" ${S.lim === "custom" ? "selected" : ""}>Je choisis le nombre…</option></select>
    ${S.lim === "custom" ? `<input id="limv" type="number" min="1" inputmode="numeric" placeholder="Points maximum par manche" value="${E(S.limv)}">` : ""}`;
}
const favBtn = g => g.id.startsWith("libre") ? "" : `<button class="star ${Core.favs().includes(g.id) ? "on" : ""}" data-a="fav" data-v="${g.id}" aria-label="Favori" title="Ajouter aux favoris">${Core.favs().includes(g.id) ? "⭐" : "☆"}</button>`;
// joueurs les plus fréquents (raccourcis sous les champs de noms)
const frequent = () => { const c = {}; S.hist.forEach(p => p.joueurs.forEach(n => { n = n.trim(); if (n) c[n] = (c[n] || 0) + 1; })); return Object.entries(c).sort((a, b) => b[1] - a[1]).map(x => x[0]); };
function setupHtml() {
  const g = S.pick; if (!g) return "";
  const vv = S.vi && g.variants ? g.variants[S.vi - 1] : null, goals = [...new Set([vv && vv[2] && vv[2].target, g.target, ...(g.targets || [])].filter(Boolean))];
  const part = (t, a) => a && a.length ? `<details><summary>${t}</summary>${a.map(x => `<p>${E(x)}</p>`).join("")}</details>` : "";
  if (g.solo) return `<div class="detail"><h3>${g.emoji} ${E(g.name)} ${favBtn(g)}</h3><small>${g.cat} · jeu solo · jouable ici</small>
      ${part("📖 But et déroulement", g.rules)}${part("🧮 Comptage des points", g.scoring)}${part("🏁 Fin de partie", g.winner)}</div>
    <button class="btn main" data-a="launch">▶️ Jouer maintenant</button><p class="empty"><small>🏅 Ton record est sauvegardé avec tes réglages.</small></p>`;
  const opts = []; for (let n = Math.max(1, g.min); n <= g.max; n++) opts.push(`<option value="${n}" ${n === S.np ? "selected" : ""}>${n} ${label(g)}${n > 1 ? "s" : ""}</option>`);
  return `<div class="detail"><h3>${g.emoji} ${E(g.name)} ${favBtn(g)}</h3><small>${g.id.startsWith("libre") ? "Règles libres" : g.cat + " · " + nbJoueurs(g)}</small>
      ${part("📖 But et déroulement", g.rules)}${part("🧮 Comptage des points", g.scoring)}${part("🏁 Fin de partie", g.winner)}</div>
    ${g.variants ? `<label for="vr">🧩 Variante</label><select id="vr"><option value="0">Règles classiques</option>${g.variants.map((x, k) => `<option value="${k + 1}" ${S.vi === k + 1 ? "selected" : ""}>${E(x[0])}</option>`).join("")}</select>${vv ? `<p class="alert">🧩 <b>${E(vv[0])}</b> : ${E(vv[1])}</p>` : ""}` : ""}
    <label for="np">Nombre de ${label(g)}s</label><select id="np" data-a="np">${opts.join("")}</select>
    ${Array.from({ length: S.np }, (_, i) => `<input class="nm" list="known" placeholder="Nom du ${label(g)} ${i + 1}" value="${E(S.names[i] || "")}">`).join("")}
    ${(fq => fq.length ? `<div class="chips recentp"><small>Récents :</small>${fq.map(n => `<button data-a="nm" data-v="${E(n)}">${E(n)}</button>`).join("")}</div>` : "")(frequent().filter(n => !S.names.map(Core.norm).includes(Core.norm(n))).slice(0, 6))}
    <datalist id="known">${known().map(k => `<option value="${E(k)}">`).join("")}</datalist>
    ${g.play ? `<button class="btn main" data-a="launch">▶️ Jouer maintenant</button><p class="empty"><small>${g.min < 2 ? "1 joueur = contre l'IA (si le jeu en a une). " : ""}Le téléphone passe de main en main.</small></p>` : ""}
    ${limiteHtml(g, vv)}
    <label for="goal">🎯 Objectif (comptage manuel)</label><select id="goal">${goals.map(t => `<option value="${t}" ${S.goal === t ? "selected" : ""}>${t} points</option>`).join("")}<option value="" ${S.goal === 0 ? "selected" : ""}>Sans objectif</option></select>
    <button class="btn ${g.play ? "" : "main"}" data-a="create">${g.play ? "📝 Compter les points à la main" : "Créer la partie"}</button>`;
}

// gloire gagnée grâce à la partie qui vient de se terminer
function gloire(p) {
  const pm = p.mode === "autres" ? "autres" : "cartes", after = Core.stats(S.hist, pm), before = Core.stats(S.hist.filter(x => x.id !== p.id), pm), f = (a, n) => a.find(x => Core.norm(x.nom) === Core.norm(n));
  const gain = n => { const a = f(after, n), b = f(before, n), d = a ? a.pg - (b ? b.pg : 0) : 0; return d > 0 ? `<br><small class="gain">+${d} ⭐</small>` : ""; };
  const msgs = [];
  if (after[0] && (!before[0] || Core.norm(before[0].nom) !== Core.norm(after[0].nom)) && p.joueurs.length > 1) msgs.push(`👑 <b>${E(after[0].nom)}</b> prend la tête du classement !`);
  p.joueurs.forEach(n => { const a = f(after, n), b = f(before, n); if (a && (!b || a.niveau.i > b.niveau.i)) msgs.push(`⬆️ <b>${E(a.nom)}</b> passe <b>${a.niveau.emoji} ${a.niveau.nom}</b> !`); });
  return { gain, banner: msgs.map(m => `<div class="alert gold">${m}</div>`).join("") };
}

const spark = v => {
  if (v.length < 2) return `<p class="empty"><small>Joue encore quelques parties pour voir ta courbe.</small></p>`;
  const W = 300, H = 90, mx = Math.max(...v), mn = Math.min(...v), r = Math.max(1, mx - mn), pts = v.map((y, i) => [Math.round(i * W / (v.length - 1)), Math.round(H - 8 - (y - mn) / r * (H - 22))]);
  const line = pts.map(q => q.join(",")).join(" "), last = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Évolution de la gloire"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(var(--rgb))" stop-opacity=".45"/><stop offset="1" stop-color="rgb(var(--rgb))" stop-opacity="0"/></linearGradient></defs>
    <polygon points="0,${H} ${line} ${W},${H}" fill="url(#sg)"/><polyline points="${line}" fill="none" stroke="rgb(var(--rgb))" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="5" fill="#fff"/></svg><div class="sparkl"><small>${v[0]} ⭐</small><small>${v.length} parties</small><small><b>${v[v.length - 1]} ⭐</b></small></div>`;
};
const soloRecords = () => Core.bests().map(x => ({ g: findGame(x.id), v: x.v })).filter(x => x.g);
const RES = { V: ["🏆", "Victoire", "V"], D: ["💔", "Défaite", "D"], E: ["🤝", "Égalité", "E"], S: ["🧍", "Solo", "S"] };
function profilStats(me, all, rang, st) {
  const pr = Core.profil(S.hist, me.nom), find = a => a.find(x => Core.norm(x.nom) === Core.norm(me.nom));
  const sc = find(Core.stats(S.hist, "cartes")), sa = find(Core.stats(S.hist, "autres")), week = pr.mine.filter(g => Date.now() - new Date(g.date) <= 7 * 864e5).length;
  const modeBox = (m, x) => `<div class="mbox"><b>${MODES[m].emoji} ${MODES[m].nom}</b>${x ? `<span>${x.jouees} parties · ${x.victoires} 🏆 · ${x.taux} %</span><small>${x.pg} ⭐</small>` : `<span><small>Pas encore joué</small></span>`}</div>`;
  const games = Object.entries(st.jeux).map(([j, n]) => ({ j, n, v: st.vic[j] || 0 })).sort((a, b) => b.n - a.n || b.v - a.v).slice(0, 8);
  const rivals = [...new Set([...Object.keys(st.bat), ...Object.keys(st.perdu)])].map(key => { const o = all.find(x => Core.norm(x.nom) === key); return o ? { nom: o.nom, v: st.bat[key] || 0, d: st.perdu[key] || 0 } : null; })
    .filter(Boolean).sort((a, b) => (b.v + b.d) - (a.v + a.d)).slice(0, 6);
  const solo = soloRecords();
  return `<section class="card"><h2>📊 Mes statistiques</h2>
      <p>${rang === 0 ? "👑 Tu es <b>n°1</b> du classement !" : `Tu es <b>#${rang + 1}</b> sur ${all.length} au classement.`}${week ? ` Cette semaine : <b>${week}</b> partie${week > 1 ? "s" : ""}.` : ""}</p>${detailStats(st, rang)}
      <a class="btn main" href="#/classement">${rang === 0 ? "👑 Voir mon trône" : "⚔️ Aller chercher la 1re place"}</a></section>
    <section class="card"><h2>📈 Évolution de ma gloire</h2>${spark(pr.evo)}</section>
    <section class="card"><h2>🎛️ Par mode</h2><div class="mboxes">${modeBox("cartes", sc)}${modeBox("autres", sa)}</div></section>
    ${games.length ? `<section class="card"><h2>🎮 Mes jeux</h2><div class="scroll"><table class="tbl left"><thead><tr><th>Jeu</th><th>Parties</th><th>🏆</th><th>Réussite</th></tr></thead><tbody>${games.map(g => `<tr><td>${E(g.j)}</td><td>${g.n}</td><td>${g.v}</td><td>${g.n ? Math.round(100 * g.v / g.n) : 0} %</td></tr>`).join("")}</tbody></table></div></section>` : ""}
    ${rivals.length ? `<section class="card"><h2>🤝 Face à face</h2>${rivals.map(r => `<div class="vs"><div class="vst"><b>${face(r.nom)} ${E(r.nom)}</b><small>${r.v} 🏆 · ${r.d} 💔</small></div><div class="vsb"><i style="width:${Math.round(100 * r.v / (r.v + r.d || 1))}%"></i></div></div>`).join("")}<small>Barre = part de mes victoires contre chaque joueur.</small></section>` : ""}
    <section class="card"><h2>🏆 Mes records</h2>
      <div class="row"><span>Joueur depuis le</span><b>${pr.premiere ? new Date(pr.premiere).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}</b></div>
      <div class="row"><span>Points marqués au total</span><b>${pr.points}</b></div>
      ${pr.bestScore ? `<div class="row"><span>Meilleur score</span><b>${pr.bestScore.score} <small>${pr.bestScore.emoji || ""} ${E(pr.bestScore.jeu)}</small></b></div>` : ""}
      ${pr.bestMarge && pr.bestMarge.marge ? `<div class="row"><span>Plus large victoire</span><b>+${pr.bestMarge.marge} <small>${pr.bestMarge.emoji || ""} ${E(pr.bestMarge.jeu)}</small></b></div>` : ""}
      <div class="row"><span>Meilleure série</span><b>🔥 ${st.meilleureSerie} victoire${st.meilleureSerie > 1 ? "s" : ""}</b></div>
      ${solo.map(x => `<div class="row"><span>🏅 Record ${E(x.g.name)}</span><b>${E(x.v)}</b></div>`).join("")}</section>
    <section class="card"><h2>🕒 Mes dernières parties</h2>${pr.mine.slice(-8).reverse().map(g => `<div class="gm"><i class="d ${g.res === "S" ? "E" : g.res}">${RES[g.res][2]}</i><span class="who"><b>${g.emoji || ""} ${E(g.jeu)}</b><small>${dateFr(g.date)}${g.adv.length ? " · vs " + E(g.adv.slice(0, 3).join(", ")) : " · solo"}</small></span><em>${g.n > 1 ? "#" + g.rang + " · " : ""}${g.score}</em></div>`).join("")}</section>`;
}
// jeu du jour : même jeu toute la journée, pour chaque mode
function jeuDuJour(m) {
  const l = gamesOf(m).filter(g => !g.id.startsWith("libre")); if (!l.length) return null;
  const d = new Date(), k = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
  return l[(k * 7 + (m === "autres" ? 3 : 0)) % l.length];
}
// ---------- pages ----------
const PAGES = {
  "": () => {
    const m = Core.mode(), me = Core.me(), all = Core.stats(S.hist, m), rang = all.findIndex(s => Core.norm(s.nom) === Core.norm(me.nom)), st = all[rang];
    const recent = histFiltered().slice(0, 3), h = new Date().getHours(), hi = h < 6 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
    const jours = me.nom ? Core.jours(histMode(), me.nom) : 0, dj = jeuDuJour(m);
    return `<section class="card hero"><div class="hello"><span class="av big2">${avatarHtml(me)}</span><div><h1>${hi}${me.nom ? " " + E(me.nom) : ""} 👋</h1>
        <small>${st ? st.niveau.emoji + " " + st.niveau.nom + " · " + st.pg + " ⭐" + (rang >= 0 ? " · #" + (rang + 1) + (rang === 0 ? " 👑" : "") : "") : me.nom ? "Joue ta première partie !" : "Crée ton profil pour suivre tes stats"}</small></div></div>
      ${jours >= 2 ? `<div class="flame">🔥 <b>${jours}</b> jours de jeu d'affilée</div>` : ""}
      <a class="btn main" href="#/nouvelle">🎮 Nouvelle partie</a>
      <div class="row2"><button class="btn" data-a="surprise">🎲 Surprise-moi</button><a class="btn" href="${me.nom ? "#/classement" : "#/profil"}">${me.nom ? (rang === 0 ? "👑 Mon trône" : "⚔️ Classement") : "👤 Mon profil"}</a></div></section>
    ${S.cur ? `<section class="card"><h2>Partie en cours</h2><p>${S.cur.emoji} ${E(S.cur.jeu)} · ${S.cur.manches.length} manche(s)</p>
      <a class="btn main" href="#/partie">▶️ Reprendre la partie</a></section>` : ""}
    ${dj ? `<section class="card daily"><h2>🌟 Jeu du jour</h2><div class="dj"><span class="djicon">${dj.emoji}</span><div><b>${E(dj.name)}</b><small>${dj.solo ? "Solo · bats ton record" : nbJoueurs(dj)}${dj.play ? " · jouable ici" : ""}</small></div></div>
      <button class="btn" data-a="play" data-v="${dj.id}">${dj.solo ? "▶️ Jouer maintenant" : "🎮 Lancer ce jeu"}</button></section>` : ""}
    ${all.length ? `<section class="card"><h2>🏅 Haut du classement ${MODES[m].emoji}</h2>${all.slice(0, 3).map((x, k) => `<div class="minirk"><span>${["🥇", "🥈", "🥉"][k]}</span>${face(x.nom)}<b>${E(x.nom)}</b><em>${x.pg} ⭐</em></div>`).join("")}
      <a class="btn" href="#/classement">Voir tout le classement</a></section>` : ""}
    <section class="card"><h2>Dernières parties ${MODES[m].emoji}</h2>${recent.map(p => `<div class="recent"><span>${p.emoji} ${E(p.jeu)} <small>${dateFr(p.date)}</small></span>
      <b>🏆 ${E(Core.ranking(p)[0].nom)}</b></div>`).join("") || "Aucune partie enregistrée."}${recent.length ? `<a class="btn" href="#/historique">📜 Tout l'historique</a>` : ""}</section>`;
  },

  nouvelle: () => { const m = Core.mode(); return `${back}<section class="card"><h1>Nouvelle partie</h1>
      <p>Mode ${MODES[m].emoji} <b>${MODES[m].nom}</b> — choisis un jeu, puis règle la partie.</p>
      ${m === "autres" ? `<div class="chips">${[["tout", "Tout"], ["play", "▶️ Jouables ici"], ["solo", "🧍 Solo"]].map(([k, t]) => `<button data-a="pf" data-v="${k}" class="${S.pf === k ? "on" : ""}">${t}</button>`).join("")}</div>` : ""}
      <input id="q" type="search" placeholder="🔍 Rechercher un jeu…" value="${E(S.q)}" autocomplete="off">
      <div class="picker" id="picker">${pickerHtml()}</div><div id="setup">${setupHtml()}</div></section>`; },

  plus: () => `<section class="card menu"><h2>Plus</h2>
      <a href="#/jeux"><i>📚</i>Jeux et règles</a><a href="#/historique"><i>📜</i>Historique</a>
      <a href="#/stats"><i>📊</i>Statistiques</a><a href="#/succes"><i>🏆</i>Succès</a>
      <a href="#/general"><i>🌍</i>Classement général</a><a href="#/compte"><i>👥</i>Mon compte</a>
      <a href="#/aide"><i>💡</i>Aide et nouveautés</a><a href="#/parametres"><i>⚙️</i>Paramètres</a></section>`,

  compte: () => {
    if (!Cloud.enabled()) return `${backPlus}<section class="card"><h1>👥 Comptes joueurs</h1><p>Les comptes ne sont pas encore activés sur cette installation. Ton jeu fonctionne normalement, avec les données gardées sur ce téléphone.</p></section>`;
    if (Cloud.active()) return `${backPlus}<section class="card"><h1>👤 Mon compte</h1>
      <div class="row"><span>Pseudo</span><b>${E(Cloud.pseudo())}</b></div>
      <div class="row"><span>Sauvegarde</span><b>${Core.server === false ? "📱 Hors ligne (envoi au retour du réseau)" : "☁️ En ligne"}</b></div>
      <small>Tes parties, favoris, profil et records sont rattachés à ton compte : retrouve-les sur n'importe quel téléphone en te connectant.</small>
      <a class="btn main" href="#/general">🌍 Classement général</a>
      <button class="btn" data-a="sync">🔄 Synchroniser maintenant</button>
      <button class="btn" data-a="logout">🚪 Se déconnecter</button></section>`;
    return `${backPlus}<section class="card"><h1>👥 Mon compte</h1>
      <p>Crée ton compte pour retrouver tes parties sur tous tes appareils et apparaître au classement général.</p>
      <label for="cPseudo">Pseudo</label><input id="cPseudo" placeholder="Ton pseudo" autocomplete="username" autocapitalize="off" maxlength="20">
      <label for="cPass" style="margin-top:12px">Mot de passe</label><input id="cPass" type="password" placeholder="6 caractères minimum" autocomplete="current-password">
      <p id="cMsg" role="status"><small>${E(Cloud.msg || "")}</small></p>
      <button class="btn main" data-a="login">🔑 Se connecter</button>
      <button class="btn" data-a="signup">✨ Créer mon compte</button>
      <small>Tes données d'avant la connexion sur ce téléphone seront rattachées à ton compte.</small></section>`;
  },

  general: () => {
    const mode = Core.mode();
    if (!Cloud.enabled()) return `${backPlus}<section class="card"><h1>🌍 Classement général</h1><p>Les comptes ne sont pas activés sur cette installation.</p></section>`;
    if (!Cloud.active()) return `${backPlus}<section class="card"><h1>🌍 Classement général</h1><p>Connecte-toi pour voir le classement de tous les joueurs.</p><a class="btn main" href="#/compte">👥 Me connecter</a></section>`;
    if (Date.now() - Cloud.boardT > 15000) Cloud.loadBoard().then(() => { if (S.page === "general" && !typing()) draw(); });
    const me = Cloud.session().uid, rows = (Cloud.board || []).filter(p => p.stats && p.stats[mode]).sort((a, b) => b.stats[mode].pg - a.stats[mode].pg);
    return `${backPlus}<section class="card"><h1>🌍 Classement général ${MODES[mode].emoji}</h1><p><small>Tous les joueurs ayant un compte · mode ${MODES[mode].nom}.</small></p>
      <div class="list">${rows.map((p, k) => { const s = p.stats[mode]; return `<div class="row ${p.user_id === me ? "me" : ""}"><span>${["🥇", "🥈", "🥉"][k] || k + 1 + "."} ${E(p.avatar || "🎲")} <b>${E(p.pseudo)}</b>${p.user_id === me ? " (toi)" : ""}<br><small>${s.niveau ? s.niveau.emoji + " " + s.niveau.nom + " · " : ""}${s.jouees} partie(s) · ${s.victoires} 🏆</small></span><b>${s.pg} ⭐</b></div>`; }).join("") || `<p class="empty">${Cloud.boardT && !Cloud.board ? (Cloud.boardErr || "Chargement…") : "Personne n'est encore classé : termine une partie !"}</p>`}</div>
      ${Cloud.boardErr && Cloud.board ? `<small>${E(Cloud.boardErr)}</small>` : ""}</section>`;
  },


  stats: () => {
    const done = histFiltered(), all = Core.stats(S.hist, Core.mode()), days = [...Array(7)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - (6 - k)); return d; });
    const perDay = days.map(d => done.filter(p => new Date(p.date).toDateString() === d.toDateString()).length), mx = Math.max(1, ...perDay);
    const games = {}; done.forEach(p => games[p.jeu] = (games[p.jeu] || 0) + 1);
    const top = Object.entries(games).sort((a, b) => b[1] - a[1]).slice(0, 6), tm = Math.max(1, ...top.map(x => x[1]));
    const rounds = done.reduce((t, p) => t + p.manches.length, 0);
    return `${backPlus}<section class="card"><h1>📊 Statistiques</h1><p>Parties du mode ${MODES[Core.mode()].emoji} <b>${MODES[Core.mode()].nom}</b> uniquement.</p>
      <div class="kpis"><div><b>${done.length}</b><small>parties</small></div><div><b>${all.length}</b><small>joueurs</small></div><div><b>${rounds}</b><small>manches</small></div></div></section>
      <section class="card"><h2>📅 7 derniers jours</h2><div class="bars7">${perDay.map((n, k) => `<div><i style="height:${Math.max(6, Math.round(100 * n / mx))}%" class="${n ? "" : "z"}"><u>${n || ""}</u></i><small>${days[k].toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3)}</small></div>`).join("")}</div></section>
      <section class="card"><h2>🎮 Jeux les plus joués</h2>${top.map(([n, c]) => `<div class="vs"><div class="vst"><b>${E(n)}</b><small>${c} partie${c > 1 ? "s" : ""}</small></div><div class="vsb ok"><i style="width:${Math.round(100 * c / tm)}%"></i></div></div>`).join("") || `<p class="empty">Aucune partie pour l'instant.</p>`}</section></section>`;
  },

  succes: () => {
    const me = Core.me(), all = Core.stats(S.hist), rang = all.findIndex(x => Core.norm(x.nom) === Core.norm(me.nom)), st = all[rang];
    if (!st) return `${backPlus}<section class="card empty"><h1>🏆 Succès</h1><p>${me.nom ? "Termine une partie sous le nom <b>" + E(me.nom) + "</b> pour débloquer tes premiers succès." : "Crée ton profil pour débloquer des succès."}</p><a class="btn main" href="${me.nom ? "#/nouvelle" : "#/profil"}">${me.nom ? "🎮 Jouer maintenant" : "👤 Créer mon profil"}</a></section>`;
    const bs = Core.badges(st, rang), got = bs.filter(x => x[3]).length;
    return `${backPlus}<section class="card"><h1>🏆 Succès</h1><p><b>${got}</b> débloqué${got > 1 ? "s" : ""} sur ${bs.length}</p><div class="bar big"><i style="width:${Math.round(100 * got / bs.length)}%"></i></div></section>
      <div class="ach">${bs.map(([e, n, d, ok, pr]) => `<div class="a ${ok ? "ok" : ""}"><span>${e}</span><b>${n}</b><small>${d}</small>${pr && !ok ? `<div class="bar"><i style="width:${Math.min(100, Math.round(100 * pr[0] / pr[1]))}%"></i></div><small>${pr[0]} / ${pr[1]}</small>` : ok ? `<small class="gain">✔ Débloqué</small>` : ""}</div>`).join("")}</div>`;
  },

  aide: () => `${backPlus}<section class="card"><h1>💡 Aide et nouveautés</h1><p>ScoreMaster v${Core.VERSION}</p>
      <details open><summary>⭐ Comment fonctionne la gloire ?</summary><p>+2 par partie jouée.</p><p>Victoire : +8, plus +2 par adversaire (maximum 8).</p><p>Égalité en tête : la moitié d'une victoire. 2e place à 3 joueurs ou plus : +1 par joueur.</p><p>Série de victoires : +2 de plus à chaque victoire d'affilée (maximum +10).</p></details>
      <details><summary>🎖️ Les niveaux</summary>${Core.LEVELS.map(l => `<div class="row"><span>${l[2]} ${l[1]}</span><b>${l[0]} ⭐</b></div>`).join("")}</details>
      <details><summary>🧭 Astuces</summary><p>⭐ sur un jeu = favori, il passe en tête de liste.</p><p>Les noms récents se remplissent d'un appui.</p><p>« Annuler la dernière manche » corrige une faute de saisie.</p><p>Touche une manche du tableau pour la modifier.</p><p>Les boutons − et + changent le score de 1.</p></details>
      <details><summary>🆕 Nouveautés de la ${Core.VERSION}</summary><p>Nouveau thème sombre animé, couleurs différentes selon la page.</p><p>Classement avec gloire, niveaux, podium et défi.</p><p>Profil complet, succès, statistiques.</p><p>Favoris, joueurs récents, préférences, rejouer et partager.</p></details></section>`,

  jeux: () => {
    const m = Core.mode(), games = gamesOf(m).filter(g => !g.id.startsWith("libre"));
    const cats = [...new Set(games.map(g => g.cat))];
    return `${backPlus}<section class="card"><h1>${MODES[m].emoji} Jeux et règles</h1><p>${games.length} jeux en mode ${MODES[m].nom}. Change de mode avec le bouton du haut.</p></section>` +
      cats.map(c => `<section class="card"><h2>${E(c)}</h2>${games.filter(g => g.cat === c).map(g => `<details><summary>${g.emoji} ${E(g.name)} <small>· ${g.solo ? "solo" : nbJoueurs(g)}${g.play ? " · ▶️ jouable" : ""}</small></summary>
        ${[...(g.rules || []), ...(g.scoring || []), ...(g.winner || [])].map(x => `<p>${E(x)}</p>`).join("")}
        ${(g.variants || []).map(x => `<p>🧩 <b>${E(x[0])}</b> : ${E(x[1])}</p>`).join("")}
        ${(l => l ? `<p>📏 Limite par manche (automatique) : <b>${l} points</b></p>` : "")(limiteAuto(g, null, g.dp || 2))}
        <button class="btn" data-a="play" data-v="${g.id}">🎮 Jouer à ce jeu</button></details>`).join("")}</section>`).join("");
  },

  partie: () => {
    const p = S.cur; if (!p) return `${back}<section class="card empty"><p>Aucune partie en cours.</p></section>`;
    const t = Core.totals(p), lead = p.manches.length ? Core.leaders(p) : [], rank = Core.ranking(p), max = Math.max(1, ...t.map(Math.abs));
    const ed = S.edit, val = i => ed !== null ? p.manches[ed][i] : "";
    return `${back}<section class="card"><h1>${p.emoji} ${E(p.jeu)}</h1>
      <p>${MODES[p.mode || "cartes"].emoji} ${MODES[p.mode || "cartes"].nom}${p.variante ? " · 🧩 " + E(p.variante) : ""}${p.target ? " · objectif " + p.target + " pts" : ""}${p.limite ? " · 📏 max " + p.limite + " pts par manche" : ""}${p.low ? " · le plus petit score gagne" : ""}</p>
      ${Core.targetReached(p) ? `<div class="alert">🎯 Objectif atteint : tu peux terminer la partie.</div>` : ""}</section>
    <section class="card"><h2>📋 Tableau des scores</h2><div class="scroll"><table class="tbl">
      <thead><tr><th>#</th>${p.joueurs.map(n => `<th>${E(n)}</th>`).join("")}</tr></thead>
      <tbody>${p.manches.map((m, r) => `<tr data-a="edit" data-v="${r}" class="${ed === r ? "on" : ""}"><th>${r + 1}</th>${m.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")
        || `<tr><td colspan="${p.joueurs.length + 1}"><small>Aucune manche</small></td></tr>`}</tbody>
      <tfoot><tr><th>Σ</th>${t.map((v, i) => `<td class="${lead.includes(i) ? "lead" : ""}">${v}</td>`).join("")}</tr></tfoot></table></div>
      <small>Touche une manche pour la modifier.</small></section>
    <section class="card"><h2>${ed !== null ? "✏️ Modifier la manche " + (ed + 1) : "➕ Nouvelle manche"}</h2>
      ${(o => o ? `<p class="alert">🎯 <b>Objectif de la manche ${ed !== null ? ed + 1 : p.manches.length + 1}</b> : ${E(o)}</p>` : "")(objectifDe(p, ed !== null ? ed + 1 : p.manches.length + 1))}
      <p class="limrow"><small>📏 ${p.limite ? "Limite : " + p.limite + " points par manche" : "Pas de limite par manche"}${p.usuel ? " · ⚠️ confirmation au-dessus de " + p.usuel : ""}</small> <button class="link" data-a="limit">✏️ Changer</button></p>
      ${p.joueurs.map((n, i) => `<div class="line"><label for="s${i}">${E(n)}</label><div class="stp"><button type="button" class="mini2" data-a="stp" data-v="${i}:-1" aria-label="Moins 1">−</button><input id="s${i}" class="sc" data-i="${i}" type="number" inputmode="numeric" placeholder="0" value="${val(i)}"><button type="button" class="mini2" data-a="stp" data-v="${i}:1" aria-label="Plus 1">+</button></div></div>`).join("")}
      ${p.quick.length ? `<div class="pills">${p.quick.map((q, k) => `<button data-a="quick" data-v="${k}">${E(q[0])}</button>`).join("")}</div>` : ""}
      <button class="btn main" data-a="add">${ed !== null ? "💾 Enregistrer" : "✅ Valider la manche"}</button>
      ${ed !== null ? `<button class="btn" data-a="cancel">↩️ Annuler</button><button class="btn danger" data-a="del">🗑️ Supprimer cette manche</button>` : ""}</section>
    <section class="card"><h2>🏅 Classement</h2>${rank.map((x, k) => `<div class="rk"><span>${["🥇", "🥈", "🥉"][k] || k + 1}</span><b>${E(x.nom)}</b><em>${x.total}</em>
      <div class="bar"><i style="width:${Math.round(100 * Math.abs(x.total) / max)}%"></i></div></div>`).join("")}</section>
    <section class="card"><button class="btn main" data-a="end">🏁 Terminer la partie</button>${p.manches.length ? `<button class="btn" data-a="undo">↩️ Annuler la dernière manche</button>` : ""}<button class="btn danger" data-a="drop">🗑️ Abandonner</button></section>`;
  },

  jouer: () => {
    const g = S.run && findGame(S.run.id); if (!g) return `${back}<section class="card empty"><p>Aucun jeu lancé.</p></section>`;
    const rules = [...(g.rules || []), ...(g.scoring || []), ...(g.winner || [])];
    return `${back}<section class="card game"><h1>${g.emoji} ${E(g.name)}</h1><div id="gbox"></div><div id="gend"></div></section>
      <section class="card"><details><summary>📖 Règles</summary>${rules.map(x => `<p>${E(x)}</p>`).join("")}</details></section>`;
  },

  fin: () => {
    const p = S.last; if (!p) return `${back}<section class="card empty"><h1>🏁 Fin de partie</h1><p>Aucune partie terminée pour l'instant.</p><a class="btn main" href="#/nouvelle">🎮 Nouvelle partie</a></section>`;
    const gl = gloire(p), r = Core.ranking(p), win = Core.leaders(p).map(i => p.joueurs[i]).join(" & ");
    return `<section class="card"><div class="trophy">🏆</div><h1 style="text-align:center">${E(win)}</h1>
      <p style="text-align:center">gagne à ${p.emoji} ${E(p.jeu)}</p>${gl.banner}${r.map((x, k) => `<div class="rk"><span>${["🥇", "🥈", "🥉"][k] || k + 1}</span><b>${E(x.nom)}${gl.gain(x.nom)}</b><em>${x.total}</em></div>`).join("")}
      <button class="btn main" data-a="again">🔁 Rejouer avec les mêmes joueurs</button><button class="btn" data-a="share">📤 Partager le résultat</button><a class="btn" href="#/nouvelle">🎮 Nouvelle partie</a><a class="btn" href="#/historique">📜 Historique</a></section>`;
  },

  historique: () => {
    const list = histFiltered();
    return `${backPlus}<section class="card"><h1>📜 Historique ${MODES[Core.mode()].emoji}</h1><p>Parties du mode <b>${MODES[Core.mode()].nom}</b>. Change de mode avec le sélecteur en haut.</p></section>` + (list.map(p => `<section class="card"><details>
      <summary>${p.emoji} ${E(p.jeu)} <small>· ${dateFr(p.date)} · 🏆 ${E(Core.ranking(p)[0].nom)}</small></summary>
      <div class="scroll"><table class="tbl"><thead><tr><th>#</th>${p.joueurs.map(n => `<th>${E(n)}</th>`).join("")}</tr></thead>
      <tbody>${p.manches.map((m, r) => `<tr><th>${r + 1}</th>${m.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody>
      <tfoot><tr><th>Σ</th>${Core.totals(p).map(v => `<td>${v}</td>`).join("")}</tr></tfoot></table></div>
      <button class="btn danger" data-a="rm" data-v="${p.id}">🗑️ Supprimer</button></details></section>`).join("")
      || `<section class="card empty"><p>Aucune partie terminée.</p></section>`);
  },

  classement: () => {
    const mode = Core.mode(), days = S.per === "tout" ? 0 : Number(S.per);
    const byPg = Core.stats(S.hist, mode, days), st = [...byPg].sort(SORT[S.sort]), list = histFiltered().filter(inPer);
    const games = {}; list.forEach(p => games[p.jeu] = (games[p.jeu] || 0) + 1);
    const king = byPg[0], val = x => S.sort === "vic" ? x.victoires + " 🏆" : S.sort === "taux" ? x.taux + " %" : x.pg + " ⭐";
    const pod = [1, 0, 2].map(k => { const x = st[k]; return x ? `<div class="pod p${k + 1}"><span class="pav">${k === 0 ? `<i class="crown">👑</i>` : ""}${face(x.nom)}</span><b>${E(x.nom)}</b><small>${val(x)}</small><div class="blk"><span>${k + 1}</span></div></div>` : `<div class="pod"></div>`; }).join("");
    return `${back}<section class="card"><h1>🏅 Classement ${MODES[mode].emoji}</h1><p><small>Mode ${MODES[mode].nom} uniquement.</small></p>${chipRow(PERS, "per", S.per)}
      <div class="kpis"><div><b>${list.length}</b><small>parties</small></div><div><b>${st.length}</b><small>joueurs</small></div><div><b>${E(Core.favori(games))}</b><small>jeu favori</small></div></div></section>
    ${king ? `<section class="card throne"><div class="crownbig">👑</div><h2>${S.per === "7" ? "Roi de la semaine" : S.per === "30" ? "Roi du mois" : "Roi de la colline"}</h2>
        <div class="kingline"><div><b>${E(king.nom)}</b><small>${king.niveau.emoji} ${king.niveau.nom} · ${king.pg} ⭐${king.serie >= 2 ? " · 🔥 " + king.serie + " victoires d'affilée" : ""}</small></div></div>
        <div class="podium">${pod}</div></section>` : ""}
    <section class="card"><h2>⚔️ Ton défi</h2>${defiHtml(byPg)}<small class="gl">⭐ Gloire : +2 par partie, victoire +8 (+2 par adversaire), série de victoires en bonus.</small></section>
    <section class="card"><h2>Classement des joueurs</h2>${chipRow(SORTS, "sort", S.sort)}<div class="list">${st.map((s, k) => `<details class="pl ${k === 0 ? "king" : ""}"><summary>
        <span class="pos">${["🥇", "🥈", "🥉"][k] || k + 1}</span>${face(s.nom)}<span class="who"><b>${E(s.nom)}${byPg[0] === s ? " 👑" : ""}</b><small>${s.niveau.emoji} ${s.niveau.nom} · ${s.jouees} partie(s) · ${s.taux} %</small></span>${forme(s.forme.slice(-3))}<em>${val(s)}</em></summary>
        <div class="pbody">${detailStats(s, byPg.indexOf(s))}</div></details>`).join("")
        || `<p class="empty">Termine une partie pour voir le classement.</p>`}</div></section>`;
  },

  profil: () => {
    const me = Core.me(), all = Core.stats(S.hist), rang = all.findIndex(s => Core.norm(s.nom) === Core.norm(me.nom)), st = all[rang];
    return `${back}<section class="card"><h1>👤 Mon profil</h1>
      <div class="av big">${avatarHtml(me)}</div>
      <label for="photoFile" class="btn">📷 ${me.photo ? "Changer la photo" : "Importer une photo"}</label>
      <input id="photoFile" type="file" accept="image/*" hidden>
      ${me.photo ? `<button class="btn danger" data-a="rmphoto">🗑️ Retirer la photo</button>` : ""}
      <label for="meName" style="margin-top:18px">Mon nom</label><input id="meName" value="${E(me.nom)}" placeholder="Ton prénom" autocomplete="off">
      <label>Ou choisis un avatar</label><div class="emojis">${AVATARS.map(a => `<button data-a="avatar" data-v="${a}" class="${!me.photo && a === me.emoji ? "on" : ""}">${a}</button>`).join("")}</div>
      <button class="btn main" data-a="saveme">💾 Enregistrer</button></section>
    ${st ? profilStats(me, all, rang, st) : `<section class="card empty"><h2>📊 Mes statistiques</h2><p>${me.nom ? "Termine une partie sous le nom <b>" + E(me.nom) + "</b> pour voir tes statistiques ici." : "Enregistre ton nom ci-dessus pour suivre tes statistiques."}</p><a class="btn main" href="#/nouvelle">🎮 Jouer maintenant</a></section>`}`;
  },

  parametres: () => {
    const done = S.hist.filter(p => p.fini).length;
    return `${backPlus}<section class="card"><h1>⚙️ Paramètres</h1><p>Gère les données et les options de ScoreMaster.</p></section>
    <section class="card"><h2>📱 Application</h2>
      <div class="row"><span>Nom</span><b>ScoreMaster</b></div>
      <div class="row"><span>Version</span><b>${Core.VERSION}</b></div>
      <div class="row"><span>Stockage</span><b>${done} partie${done > 1 ? "s" : ""}</b></div>
      <div class="row"><span>Mode actuel</span><b>${MODES[Core.mode()].emoji} ${MODES[Core.mode()].nom}</b></div></section>
    <section class="card"><h2>🎛️ Préférences</h2>${[["sound", "🔊", "Sons des jeux"], ["haptic", "📳", "Vibrations légères"], ["fond", "✨", "Fond et effets animés"], ["confetti", "🎉", "Confettis de victoire"], ["grand", "🔠", "Texte plus grand"], ["veille", "💡", "Écran allumé pendant une partie"]]
      .map(([k, e, t]) => `<button class="sw ${Core.opt(k) ? "on" : ""}" data-a="opt" data-v="${k}" role="switch" aria-checked="${!!Core.opt(k)}"><span>${e} ${t}</span><i></i></button>`).join("")}
      <small>Ces réglages sont sauvegardés sur ton téléphone (et partagés entre appareils si un serveur est branché).</small></section>
    <section class="card"><h2>☁️ Sauvegarde des réglages</h2><p>Favoris, préférences, profil, records et derniers réglages de chaque jeu sont gardés sur ton téléphone. Si tu as un serveur ScoreMaster, ils y sont aussi copiés.</p>
      <div class="row"><span>État</span><b>${Core.status === "ok" && !Core.pending() ? "✅ À jour" : Core.status === "off" ? "📱 Enregistré sur le téléphone" + (Core.pending() ? " (" + Core.pending() + " en attente)" : "") : "⏳ En cours…"}</b></div>
      <div class="row"><span>Favoris</span><b>${Core.favs().length}</b></div>
      <button class="btn" data-a="sync">🔄 Synchroniser maintenant</button></section>
    <section class="card"><h2>💾 Données</h2><p>Sauvegarde tes parties dans un fichier ou restaure une sauvegarde précédente (les anciennes sauvegardes ScoreMaster sont acceptées).</p>
      <button class="btn" data-a="export">📤 Exporter mes parties</button>
      <label for="importFile" class="btn">📥 Importer une sauvegarde</label>
      <input id="importFile" type="file" accept=".json,application/json" hidden></section>
    <section class="card danger"><h2>⚠️ Zone dangereuse</h2><p>La suppression de l'historique est définitive.</p>
      <button class="btn danger" data-a="wipe">🗑️ Supprimer toutes les parties</button></section>`;
  }
};

// ---------- routage ----------
const NEED = ["", "nouvelle", "jeux", "historique", "classement", "profil", "parametres", "fin", "stats", "succes", "general"];
const typing = () => /^(INPUT|SELECT|TEXTAREA)$/.test((document.activeElement || {}).tagName || "");
let rendering = null, redo = false;
// Un seul rendu à la fois : si on change de page pendant un rendu, on refait un seul rendu final (plus de page périmée qui écrase la bonne).
function draw() {
  if (rendering) { redo = true; return rendering; }
  rendering = (async () => { try { do { redo = false; await render(); } while (redo); } catch (e) { console.error(e); } finally { rendering = null; } })();
  return rendering;
}
async function render() {
  S.stops.splice(0).forEach(f => { try { f(); } catch (e) {} });
  const page = location.hash.slice(2).split("/")[0], mode = Core.mode(); S.rh = location.hash;
  // navigation mise à jour tout de suite (avant tout chargement)
  document.querySelectorAll("#modes button").forEach(b => b.classList.toggle("on", b.dataset.v === mode));
  document.body.dataset.mode = mode; document.body.dataset.page = page; document.documentElement.dataset.mode = mode;
  const lg = document.querySelector(".logo>span"); if (lg) lg.textContent = MODES[mode].emoji;
  const tg = document.querySelector(".tag .mtag"); if (tg) tg.textContent = MODES[mode].emoji + " " + MODES[mode].nom;
  const tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.content = mode === "autres" ? "#040a16" : "#12060b";
  const tab = { "": "", partie: "", jouer: "nouvelle", fin: "classement", jeux: "plus", historique: "plus", stats: "plus", succes: "plus", parametres: "plus", aide: "plus", compte: "plus", general: "classement" }[page] ?? page;
  document.querySelectorAll("#tabs a").forEach(t => t.classList.toggle("on", t.dataset.p === tab));
  document.body.dataset.theme = { classement: "or", fin: "or", succes: "or", profil: "emeraude", historique: "braise", stats: "emeraude", parametres: "acier", aide: "acier", plus: "acier", compte: "acier", general: "or" }[page] || "";
  const needs = NEED.includes(page);
  if (needs) S.hist = Core.hist || await Core.list();   // données déjà en mémoire : affichage instantané
  if (redo) return;                                      // on a changé de page entre-temps : inutile de dessiner celle-ci
  const root = $("#root"), enter = S.force || page !== S.page || S.pmode !== mode, newPage = page !== S.page;
  S.force = false; S.page = page; S.pmode = mode;
  root.classList.toggle("enter", enter);
  try { root.innerHTML = (PAGES[page] || PAGES[""])(); }
  catch (err) { console.error(err); root.innerHTML = `<section class="card"><h2>😕 Oups</h2><p>Cette page a rencontré un problème. Tes données ne sont pas perdues.</p><a class="btn main" href="#/">🏠 Retour à l'accueil</a></section>`; }
  if (newPage) window.scrollTo(0, 0);
  if (enter) FX.countUp(root);
  if (page === "fin" && enter) setTimeout(() => { if (S.page === "fin") { FX.confetti(170); FX.sfx("win"); } }, 450);
  FX.veille(page === "jouer" || page === "partie");
  if (page === "jouer") startPlay();
  // actualisation discrète en arrière-plan (nouvelles parties d'un autre appareil)
  if (needs && Date.now() - Core.histT > 8000) Core.list().then(h => {
    if (JSON.stringify(h) === JSON.stringify(S.hist)) return;
    S.hist = h;
    if (S.rh === location.hash && !rendering && !typing() && ["", "classement", "historique", "stats", "succes", "parametres"].includes(S.page)) draw();
  });
}

// ---------- jeux jouables dans l'appli ----------
function startPlay() {
  const g = S.run && findGame(S.run.id), box = $("#gbox"); if (!g || !window.PLAY[g.id] || !box) return;
  const key = "sm_best_" + g.id;
  const ctx = { box, players: S.run.names, solo: !!g.solo, onStop: f => S.stops.push(f),
    best: () => Core.best(g.id), end: r => endPlay(g, r) };
  try { window.PLAY[g.id](ctx); } catch (err) { box.innerHTML = `<p class="empty">Ce jeu a rencontré une erreur : ${E(err.message)}</p>`; console.error(err); }
}
function endPlay(g, r) {
  S.res = { ...r, g, names: r.names || S.run.names, saved: false, newBest: false };
  if (g.solo && r.scores && r.win) {
    const old = Core.best(g.id), v = r.scores[0];
    if (old === null || ((r.low ?? g.low) ? v < Number(old) : v > Number(old))) { Core.setBest(g.id, v); S.res.newBest = true; }
  }
  drawEnd();
}
function drawEnd() {
  const r = S.res, el = $("#gend"); if (!r || !el) return; const low = !!(r.low ?? r.g.low);
  const rank = r.scores && r.names.length > 1 ? r.names.map((n, i) => ({ n, s: r.scores[i] })).sort((a, b) => low ? a.s - b.s : b.s - a.s) : null;
  el.innerHTML = `<div class="endcard"><h2>${E(r.text || "Partie terminée")}</h2>${r.newBest ? `<div class="alert">🏅 Nouveau record : ${r.scores[0]}</div>` : ""}
    ${rank ? rank.map((x, k) => `<div class="rk"><span>${["🥇", "🥈", "🥉"][k] || k + 1}</span><b>${E(x.n)}</b><em>${x.s}</em></div>`).join("") : r.scores ? `<p class="big">Score : <b>${r.scores[0]}</b></p>` : ""}
    <button class="btn main" data-a="replay">🔁 Rejouer</button>
    ${r.scores ? `<button class="btn" data-a="saveplay" ${r.saved ? "disabled" : ""}>${r.saved ? "✅ Enregistré dans l'historique" : "💾 Enregistrer dans l'historique"}</button>` : ""}
    <a class="btn" href="#/nouvelle">🎮 Choisir un autre jeu</a></div>`;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  if (r.win || r.newBest) FX.confetti(90);
}
window.addEventListener("hashchange", () => { if (location.hash !== S.rh) draw(); });
const readNames = () => [...document.querySelectorAll(".nm")].map(i => i.value);
const objectifDe = (p, n) => { const g = [...(window.CAT_CARTES || []), ...(window.CAT_AUTRES || [])].find(x => x.name === p.jeu), f = g && window.OBJ && window.OBJ[g.id]; return f ? f(n, { np: p.joueurs.length, v: p.variante || "" }) : ""; };
const refreshSetup = () => { $("#picker").innerHTML = pickerHtml(); $("#setup").innerHTML = setupHtml(); };
const scores = () => [...document.querySelectorAll(".sc")].map(i => Number(i.value) || 0);
const save = () => Core.setCurrent(S.cur, Core.mode());

// ---------- actions ----------
const authDo = async kind => {
  const msg = $("#cMsg"), say = x => { Cloud.msg = x; if (msg) msg.innerHTML = "<small>" + E(x) + "</small>"; };
  const p = $("#cPseudo").value, w = $("#cPass").value; say("⏳ Un instant…");
  document.querySelectorAll('[data-a="login"],[data-a="signup"]').forEach(b => b.disabled = true);
  try { await Cloud[kind](p, w); Cloud.msg = ""; FX.apply(); FX.toast("✅ Connecté : " + Cloud.pseudo()); S.hist = Core.hist; S.force = true; draw(); }
  catch (e) { say("❌ " + (navigator.onLine === false ? "Pas de connexion Internet." : e.message)); document.querySelectorAll('[data-a="login"],[data-a="signup"]').forEach(b => b.disabled = false); }
};
const ACTIONS = {
  login: () => authDo("login"),
  signup: () => authDo("signup"),
  logout: async () => {
    await Core.sync().catch(() => {}); await Core.list().catch(() => {});
    const lost = Core._pq().length + Core.pending();
    if (!confirm(lost ? `⚠️ ${lost} élément(s) pas encore envoyé(s) en ligne seront PERDUS. Se déconnecter quand même ?` : "Te déconnecter ? Tes données restent dans ton compte ; elles seront effacées de ce téléphone.")) return;
    Cloud.logout(); FX.apply(); S.hist = []; S.force = true; location.hash = "#/compte"; draw();
  },
  mode: v => {
    Core.setMode(v); S.pick = null; S.q = ""; S.force = true;
    const page = location.hash.slice(2).split("/")[0];
    if (["", "jeux", "nouvelle"].includes(page)) draw(); else location.hash = "#/";
  },
  pick: v => {
    S.vi = 0; S.lim = "auto"; S.limv = "";
    S.pick = findGame(v); S.np = Math.min(S.pick.max, Math.max(S.pick.min, S.pick.dp || 2)); S.names = [Core.me().nom];
    S.pick.mode = S.pick.mode || Core.mode(); S.goal = null;
    const sv = Core.setup(v);
    if (sv) {
      if (sv.vi >= 0 && sv.vi <= (S.pick.variants ? S.pick.variants.length : 0)) S.vi = sv.vi;
      if (sv.np >= S.pick.min && sv.np <= S.pick.max) S.np = sv.np;
      if (["auto", "0", "custom"].includes(sv.lim)) { S.lim = sv.lim; S.limv = sv.limv || ""; }
      if (typeof sv.goal === "number") S.goal = sv.goal;
    }
    refreshSetup();
    $("#setup").scrollIntoView({ behavior: "smooth", block: "start" });
  },
  np: () => { S.names = readNames(); S.np = Number($("#np").value); S.goal = Number(($("#goal") || {}).value) || S.goal; $("#setup").innerHTML = setupHtml(); },
  create: () => {
    const g = S.pick, names = readNames().map((s, i) => s.trim() || `${label(g)[0].toUpperCase() + label(g).slice(1)} ${i + 1}`);
    const vv = S.vi && g.variants ? g.variants[S.vi - 1] : null;
    let limite = S.lim === "custom" ? Math.floor(Number($("#limv") && $("#limv").value)) : S.lim === "0" ? 0 : limiteAuto(g, vv, names.length);
    if (!(limite >= 0)) return alert("Entre un nombre de points valide pour la limite par manche, ou choisis une autre option.");
    S.cur = Core.create({ ...g, low: vv && vv[2] && vv[2].low !== undefined ? vv[2].low : g.low, mode: g.mode || Core.mode() }, names, Number($("#goal").value) || 0, limite, S.lim === "auto" ? usuelAuto(g, vv) : 0);
    if (vv) S.cur.variante = vv[0];
    S.edit = null; save(); Core.setSetup(g.id, { vi: S.vi, np: S.np, lim: S.lim, limv: S.limv, goal: Number($("#goal").value) || 0 }); location.hash = "#/partie";
  },
  play: v => {
    const g = findGame(v); Core.setMode(g.mode); S.pick = null; location.hash = "#/nouvelle";
    draw().then(() => { ACTIONS.pick(v); if (g.solo) ACTIONS.launch(); });
  },
  pf: v => { S.pf = v; $("#picker").innerHTML = pickerHtml(); document.querySelectorAll('[data-a="pf"]').forEach(b => b.classList.toggle("on", b.dataset.v === v)); },
  launch: () => {
    const g = S.pick; if (!g || !g.play) return; Core.setMode(g.mode || "autres");
    const names = g.solo ? [Core.me().nom || "Moi"] : readNames().map((s, i) => s.trim() || `${label(g)[0].toUpperCase() + label(g).slice(1)} ${i + 1}`);
    const was = location.hash === "#/jouer"; S.run = { id: g.id, names }; S.res = null; location.hash = "#/jouer"; if (was) draw();
  },
  replay: () => { S.res = null; draw(); },
  saveplay: async () => {
    const r = S.res; if (!r || r.saved || !r.scores) return;
    const okS = await Core.save({ id: Core.uid(), mode: "autres", jeu: r.g.name, emoji: r.g.emoji, low: !!(r.low ?? r.g.low), target: 0, joueurs: r.names, manches: [r.scores],
      quick: [], date: new Date().toISOString(), fini: true, solo: r.names.length < 2 });
    if (!okS) return alert("❌ Échec de l'enregistrement : le stockage du téléphone est plein ou bloqué. La partie n'est PAS sauvegardée.");
    r.saved = true; drawEnd(); FX.toast("✅ Enregistré dans l'historique");
  },
  quick: v => {
    const q = S.cur.quick[v], inp = document.querySelectorAll(".sc")[S.focus] || document.querySelector(".sc");
    inp.value = q[2] === "set" ? q[1] : (Number(inp.value) || 0) + q[1]; inp.focus();
  },
  limit: () => {
    const v = prompt("Limite de points par manche (0 = aucune) :", S.cur.limite || 0); if (v === null) return;
    const n = Math.floor(Number(v)); if (!(n >= 0)) return alert("Entre un nombre positif, ou 0 pour supprimer la limite.");
    S.cur.limite = n; S.cur.usuel = 0; save(); draw();
  },
  add: () => {
    const sc = scores(), bad = Core.depasse(S.cur, sc);
    if (bad.length) return alert(`Limite de ${S.cur.limite} points par manche dépassée : ${bad.join(", ")}.\nCorrige les scores ou change la limite.`);
    const odd = Core.inhabituel(S.cur, sc);
    if (odd.length && !confirm(`Score inhabituel (plus de ${S.cur.usuel} points sur une manche) : ${odd.join(", ")}.\nValider quand même ?`)) return;
    const had = Core.targetReached(S.cur);
    if (S.edit !== null) S.cur.manches[S.edit] = sc; else S.cur.manches.push(sc);
    if (!had && Core.targetReached(S.cur)) { FX.confetti(110); FX.sfx("win"); setTimeout(() => FX.toast("🎯 Objectif atteint !"), 300); } else FX.sfx("ok");
    S.edit !== null ? FX.toast("💾 Manche modifiée") : FX.toast("✅ Manche " + S.cur.manches.length + " ajoutée"); S.edit = null; save(); draw();
  },
  edit: v => { S.edit = S.edit === Number(v) ? null : Number(v); draw(); },
  cancel: () => { S.edit = null; draw(); },
  del: () => { S.cur.manches.splice(S.edit, 1); S.edit = null; save(); draw(); },
  end: async () => {
    if (!S.cur.manches.length) return alert("Ajoute au moins une manche.");
    S.cur.fini = true;
    if (!(await Core.save(S.cur))) { S.cur.fini = false; return alert("❌ Échec de l'enregistrement : le stockage du téléphone est plein ou bloqué. La partie est conservée, libère de la place puis réessaie."); }
    S.last = S.cur; S.cur = null; save(); location.hash = "#/fin";
  },
  drop: () => { if (confirm("Abandonner cette partie ?")) { S.cur = null; save(); location.hash = "#/"; } },
  rm: async v => { if (confirm("Supprimer cette partie ?")) { await Core.remove(v); draw(); } },
  opt: v => { Core.setOpt(v, Core.opt(v) ? 0 : 1); FX.apply(); const y = scrollY; draw().then(() => scrollTo(0, y)); },
  sync: async () => {
    FX.toast("🔄 Synchronisation…"); const ch = await Core.sync(); FX.apply();
    FX.toast(Core.status === "ok" ? "☁️ Réglages à jour" : "📱 Enregistré sur le téléphone"); if (ch || S.page === "parametres") draw();
  },
  fav: v => { const on = Core.toggleFav(v); if ($("#picker")) refreshSetup(); FX.toast(on ? "⭐ Ajouté aux favoris" : "Retiré des favoris"); FX.sfx(on ? "star" : "undo"); },
  nm: v => { const f = [...document.querySelectorAll(".nm")].find(i => !i.value.trim()); if (!f) return FX.toast("Tous les noms sont remplis"); f.value = v; S.names = readNames(); refreshSetup(); },
  undo: () => { if (!S.cur || !S.cur.manches.length) return; S.cur.manches.pop(); S.edit = null; save(); draw(); FX.toast("↩️ Dernière manche annulée"); FX.sfx("undo"); },
  again: () => { const p = S.last; if (!p) return; Core.setMode(p.mode === "autres" ? "autres" : "cartes"); S.cur = { ...p, id: Core.uid(), manches: [], fini: false, date: new Date().toISOString() }; S.edit = null; save(); location.hash = "#/partie"; },
  share: async () => {
    const p = S.last; if (!p) return; const r = Core.ranking(p), txt = `🏆 ${r[0].nom} gagne à ${p.jeu} !\n` + r.map((x, k) => `${["🥇", "🥈", "🥉"][k] || k + 1 + "."} ${x.nom} — ${x.total}`).join("\n") + "\n(ScoreMaster)";
    try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); FX.toast("📋 Résultat copié"); } } catch (e) {}
  },
  stp: v => { const [i, d] = v.split(":"), inp = document.querySelectorAll(".sc")[Number(i)]; if (!inp) return; inp.value = (Number(inp.value) || 0) + Number(d); inp.dispatchEvent(new Event("input", { bubbles: true })); S.focus = Number(i); },
  surprise: () => { const l = gamesOf(Core.mode()).filter(g => !g.id.startsWith("libre")); ACTIONS.play(l[Math.floor(Math.random() * l.length)].id); FX.sfx("star"); },
  filter: v => { S.filter = v; draw(); },
  per: v => { S.per = v; S.force = true; draw(); },
  sort: v => { S.sort = v; draw(); },
  avatar: v => { Core.setMe({ nom: $("#meName").value.trim(), emoji: v, photo: null }); draw(); },
  rmphoto: () => { Core.setMe({ ...Core.me(), nom: $("#meName").value.trim(), photo: null }); draw(); },
  saveme: () => { Core.setMe({ ...Core.me(), nom: $("#meName").value.trim() }); location.hash = "#/"; },
  export: () => {
    const data = { version: Core.VERSION, exportedAt: new Date().toISOString(), games: S.hist, profile: Core.me(), settings: Core._load() };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    a.download = `scoremaster-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  },
  wipe: async () => {
    if (!confirm("ATTENTION : supprimer toutes les parties ?")) return;
    await Core.removeAll(); alert("Toutes les parties ont été supprimées."); draw();
  }
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]");
  if (el && el.tagName !== "SELECT" && ACTIONS[el.dataset.a]) ACTIONS[el.dataset.a](el.dataset.v);
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (t.id === "goal") { S.goal = Number(t.value) || 0; return; }
  if (t.id === "np") return ACTIONS.np();
  if (t.id === "lim") { S.names = readNames(); S.lim = t.value; $("#setup").innerHTML = setupHtml(); return; }
  if (t.id === "vr") { S.names = readNames(); S.vi = Number(t.value); S.goal = null; $("#setup").innerHTML = setupHtml(); return; }
  if (t.id === "photoFile" && t.files[0]) {
    try {
      const photo = await photoToAvatar(t.files[0]);
      Core.setMe({ ...Core.me(), nom: $("#meName").value.trim(), photo }); draw();
    } catch (err) { alert(err.message); }
  }
  if (t.id === "importFile" && t.files[0]) {
    try {
      const data = JSON.parse(await t.files[0].text());
      const games = (data.games || []).map(normalizeGame).filter(Boolean);
      if (!games.length) throw new Error("Aucune partie dans ce fichier");
      if (!confirm(`Importer ${games.length} partie(s) ? Elles seront ajoutées à celles déjà présentes.`)) { t.value = ""; return; }
      for (const g of games) await Core.save(g);
      if (data.settings) { Core._merge(data.settings, true); Core._save(); Core.push(); FX.apply(); }
      else if (data.profile && !Core.me().nom) Core.setMe({ ...Core.me(), ...data.profile });
      alert("Sauvegarde importée avec succès !"); draw();
    } catch (err) { alert("Impossible d'importer cette sauvegarde."); console.error(err); }
  }
});
document.addEventListener("input", e => {
  if (e.target.id === "q") { S.q = e.target.value; $("#picker").innerHTML = pickerHtml(); }
  if (e.target.id === "limv") S.limv = e.target.value;
  if (e.target.classList.contains("sc") && S.cur) { const a = Math.abs(Number(e.target.value) || 0); e.target.classList.toggle("over", !!S.cur.limite && a > S.cur.limite); e.target.classList.toggle("odd", !!S.cur.usuel && a > S.cur.usuel && !(S.cur.limite && a > S.cur.limite)); }
});
document.addEventListener("focusin", e => { if (e.target.classList.contains("sc")) S.focus = Number(e.target.dataset.i); });
document.addEventListener("keydown", e => {
  if (e.key !== "Enter" || !e.target.classList.contains("sc")) return;
  const all = [...document.querySelectorAll(".sc")], i = all.indexOf(e.target);
  i < all.length - 1 ? all[i + 1].focus() : ACTIONS.add();
});

FX.apply();
draw();
// récupère les réglages du serveur sans bloquer l'affichage, puis à chaque retour dans l'appli
const resync = () => Core.sync().then(ch => { if (ch) { FX.apply(); if (!rendering && !typing() && ["", "nouvelle", "classement", "profil", "parametres", "plus"].includes(S.page) && S.page !== "nouvelle") draw(); } });
resync();
document.addEventListener("visibilitychange", () => { if (!document.hidden) resync(); });
window.addEventListener("online", resync);
