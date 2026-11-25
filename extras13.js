// ScoreMaster v2.7.0 : « Que jouer ce soir ? » avec filtre par catégorie + nouvelles ambiances ; Soirées : préparer une soirée, palmarès, distinctions.
// Chargé après extras12.js.
(function () {
  "use strict";
  const E = Core.esc, nm = s => String(s || "").trim();
  const chip = (list, cur, a) => `<div class="chs">${list.map(x => `<button class="btn ${x[0] == cur ? "on" : ""}" data-a="${a}" data-v="${E(x[0])}">${x[1]}</button>`).join("")}</div>`;
  const games = () => [].concat(window.CAT_CARTES || [], window.CAT_AUTRES || []).filter(g => g && !String(g.id).startsWith("libre"));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rd = (id, f) => { const el = document.getElementById(id); if (el) el.outerHTML = f(); };

  // ---------- classement durée / ambiance (un jeu peut imposer g.dur et g.amb) ----------
  const DUR = { 1: "⚡ ~10 min", 2: "⏱️ ~30 min", 3: "🕰️ 1 h et +" };
  const CD = {}; ["Rapidité", "Dés", "Chaos", "Adresse", "Mémoire", "Cartes", "Duel de cartes", "Pioche et prise de risque", "Enfants", "Quiz", "Duel", "Mots"].forEach(c => CD[c] = 1);
  ["Plateau", "Jeux vidéo", "Sport", "Plein air"].forEach(c => CD[c] = 3);
  const CA = {}; ["Ambiance", "Rapidité", "Chaos", "Bluff", "Dés", "Adresse", "Pioche et prise de risque", "Jeux vidéo"].forEach(c => CA[c] = "fun");
  ["Abstrait", "Déduction", "Mots", "Plateau", "Draft", "Mémoire", "Duel", "Plis", "Rami", "Combinaisons", "Capture", "Mises", "Défausse", "Duel de cartes", "Cartes", "Quiz"].forEach(c => CA[c] = "tete");
  CA["Coopératif"] = "coop"; CA["Familial"] = "fam"; CA["Plein air"] = "air"; CA["Sport"] = "air"; CA["Enfants"] = "enfants"; CA["Soirée entre potes"] = "apero";
  const dur = g => g.dur || CD[g.cat] || 2, amb = g => g.amb || CA[g.cat] || "tete";
  const AMBS = [["0", "Toutes"], ["fun", "😂 Fun"], ["tete", "🧠 Réflexion"], ["fam", "👨‍👩‍👧 Famille"], ["enfants", "🧒 Enfants"], ["apero", "🍻 Potes"], ["coop", "🤝 Coop"], ["air", "🌳 Dehors"]];

  // ---------- QUE JOUER CE SOIR ? ----------
  const Q = { n: 4, d: "0", a: "0", c: "0", t: "0", f: null };
  // filtre « type de jeu » : jamais joués / déjà joués / en équipes / coop / avec règles de base / cartes / autres
  const playedNames = () => { const m = new Set(); try { (S.hist || []).forEach(p => p && p.jeu && m.add(String(p.jeu))); } catch (e) {} return m; };
  const TYPES = [["0", "Tous"], ["new", "🆕 Jamais joués"], ["old", "🔁 Déjà joués"], ["teams", "👥 En équipes"], ["coop", "🤝 Coopératifs"], ["cards", "🃏 Cartes"], ["other", "🎲 Autres"], ["solo", "🧍 Solo"]];
  const typeOk = (g, pl) => Q.t === "0" || (Q.t === "new" ? !pl.has(g.name) : Q.t === "old" ? pl.has(g.name) : Q.t === "teams" ? !!g.teams : Q.t === "coop" ? !!g.coop : Q.t === "cards" ? (window.CAT_CARTES || []).includes(g) : Q.t === "other" ? (window.CAT_AUTRES || []).includes(g) : g.min <= 1);
  const match = (g, skipCat, pl) => typeOk(g, pl || playedNames()) && g.min <= Q.n && g.max >= Q.n && (Q.d === "0" || dur(g) == Q.d) && (Q.a === "0" || amb(g) === Q.a) && (skipCat || Q.c === "0" || g.cat === Q.c);
  const ceSec = () => {
    const pl = playedNames(), ok = games().filter(g => match(g, false, pl));
    if (!ok.some(g => g.id == Q.f)) Q.f = ok.length ? ok[Math.floor(Math.random() * ok.length)].id : null;
    const f = ok.find(g => g.id == Q.f), meta = g => `${g.min === g.max ? g.min : g.min + "–" + g.max} joueurs · ${DUR[dur(g)]} · ${E(g.cat)}`, more = shuffle(ok.filter(g => g !== f)).slice(0, 5);
    // catégories proposées = celles qui ont au moins un jeu avec les autres filtres (nombre entre parenthèses)
    const cnt = {}; games().filter(g => match(g, true, pl)).forEach(g => cnt[g.cat] = (cnt[g.cat] || 0) + 1);
    const cats = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a] || a.localeCompare(b, "fr"));
    if (Q.c !== "0" && !cnt[Q.c]) Q.c = "0";
    return `<section class="card tools" id="s-ce"><h1>🍿 Que jouer ce soir ?</h1>
      <small>Joueurs</small>${chip([[1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"], [6, "6"], [8, "8"], [10, "10+"]], Q.n, "cen")}
      <small>Durée</small>${chip([["0", "Tous"], ["1", "⚡ Rapide"], ["2", "⏱️ Moyen"], ["3", "🕰️ Long"]], Q.d, "ced")}
      <small>Ambiance</small>${chip(AMBS, Q.a, "cea")}
      <small>Type de jeu</small>${chip(TYPES, Q.t, "cet")}
      <small>Catégorie</small>${chip([["0", "Toutes"]].concat(cats.map(c => [c, E(c) + " · " + cnt[c]])), Q.c, "cec")}
      ${f ? `<div class="pick"><span class="em">${f.emoji}</span><div><small>Mon choix pour vous</small><b>${E(f.name)}</b><em>${meta(f)}</em></div></div>
        <div class="row2"><button class="btn main" data-a="play" data-v="${f.id}">🎮 Jouer à ça</button><button class="btn" data-a="cer">🔀 Autre idée</button></div>`
        : "<p>Aucun jeu ne correspond : essaie « Tous », « Toutes » ou un autre nombre de joueurs.</p>"}
      ${more.length ? `<h2>Aussi possible · ${ok.length} jeu${ok.length > 1 ? "x" : ""}</h2>${more.map(g => `<div class="gp"><div><b>${g.emoji} ${E(g.name)}</b><small>${meta(g)}</small></div><button class="btn main" data-a="play" data-v="${g.id}">🎮</button></div>`).join("")}` : ""}</section>`;
  };
  PAGES.cesoir = () => backPlus + ceSec();
  const reCe = () => rd("s-ce", ceSec);

  // ---------- SOIRÉES ----------
  const parts = () => S.hist.filter(p => p && p.manches && p.manches.length && p.joueurs && p.joueurs.length > 1).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const rank = p => Core.ranking(p).map(r => ({ ...r, nom: nm(r.nom) }));
  function soirees() { const out = []; let c = null; parts().forEach(p => { const t = +new Date(p.date); if (!c || t - c.last > 5 * 36e5) { c = { start: t, last: t, ps: [] }; out.push(c); } c.ps.push(p); c.last = t; }); return out; }
  function board(s) { const m = {}; s.ps.forEach(p => rank(p).forEach((r, k) => { const x = m[r.nom] || (m[r.nom] = { nom: r.nom, g: 0, w: 0, pts: 0, last: 0, best: 0 }); x.g++; if (k === 0) x.w++; if (k === rank(p).length - 1) x.last++; x.pts += k === 0 ? 3 : k === 1 ? 1 : 0; if (!p.low && r.total > x.best) x.best = r.total; }));
    return Object.values(m).sort((a, b) => b.pts - a.pts || b.w - a.w || a.g - b.g); }
  const hm = ms => { const m = Math.round(ms / 6e4); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + String(m % 60).padStart(2, "0"); };
  const palSec = () => {
    const l = soirees().filter(s => s.ps.length); if (!l.length) return "";
    const W = {}, N = {}; l.forEach(s => { const b = board(s); b.forEach(x => N[x.nom] = (N[x.nom] || 0) + 1); if (b[0]) W[b[0].nom] = (W[b[0].nom] || 0) + 1; });
    const top = Object.entries(W).sort((a, b) => b[1] - a[1]).slice(0, 5), max = l.reduce((m, s) => s.ps.length > m.ps.length ? s : m, l[0]);
    const jc = {}; parts().forEach(p => jc[p.jeu] = (jc[p.jeu] || 0) + 1); const fav = Object.entries(jc).sort((a, b) => b[1] - a[1])[0];
    const d = l[l.length - 1], b = board(d), last = b.length > 1 ? b.slice().sort((x, y) => y.last - x.last || x.pts - y.pts)[0] : null, big = b.slice().sort((x, y) => y.best - x.best)[0];
    const gc = {}; d.ps.forEach(p => gc[p.jeu] = (gc[p.jeu] || 0) + 1); const fg = Object.entries(gc).sort((x, y) => y[1] - x[1])[0];
    const row = (i, a, v) => `<li><span>${i} ${a}</span><small>${v}</small></li>`;
    return `<section class="card tools"><h2>🏅 Palmarès des soirées</h2><p class="hint">${l.length} soirée${l.length > 1 ? "s" : ""} · ${parts().length} partie${parts().length > 1 ? "s" : ""}</p>
      <ul class="soil">${top.map((t, i) => row(["🥇", "🥈", "🥉", "4", "5"][i], E(t[0]), t[1] + " soirée" + (t[1] > 1 ? "s" : "") + " gagnée" + (t[1] > 1 ? "s" : "") + " sur " + N[t[0]])).join("")}</ul>
      <ul class="soil">${row("🔥", "Soirée record", max.ps.length + " parties · " + E(new Date(max.start).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })))}${fav ? row("🎮", "Jeu des soirées", E(fav[0]) + " · " + fav[1] + "×") : ""}</ul></section>
      <section class="card tools"><h2>🎖️ Distinctions de la dernière soirée</h2><p class="hint">${E(new Date(d.start).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }))} · ${d.ps.length} partie${d.ps.length > 1 ? "s" : ""}${d.ps.length > 1 ? " · " + hm(d.last - d.start) + " de jeu" : ""}</p>
      <ul class="soil">${row("👑", "Roi de la soirée", E(b[0].nom) + " · " + b[0].pts + " pts")}${b[0].w > 1 ? row("💪", "Le plus de victoires", E(b[0].nom) + " · " + b[0].w) : ""}${last && last.last > 0 ? row("🐢", "Lanterne rouge", E(last.nom) + " · " + last.last + " dernière" + (last.last > 1 ? "s" : "") + " place" + (last.last > 1 ? "s" : "")) : ""}${big && big.best ? row("💥", "Plus gros score", E(big.nom) + " · " + big.best) : ""}${fg ? row("🎲", "Jeu de la soirée", E(fg[0]) + (fg[1] > 1 ? " · " + fg[1] + "×" : "")) : ""}</ul></section>`;
  };

  // préparer une soirée : un programme de 3 à 5 jeux (échauffement → plat de résistance → finale)
  const THEMES = [["potes", "🍻 Entre potes"], ["fam", "👨‍👩‍👧 En famille"], ["tete", "🧠 Réflexion"], ["fun", "🎉 Gros fun"], ["enfants", "🧒 Avec les enfants"], ["coop", "🤝 Tous ensemble"]];
  const TH = { potes: g => ["fun", "apero"].includes(amb(g)) || ["Bluff", "Ambiance", "Quiz"].includes(g.cat), fam: g => ["fam", "fun", "enfants"].includes(amb(g)) && amb(g) !== "apero", tete: g => amb(g) === "tete", fun: g => amb(g) === "fun" || amb(g) === "apero", enfants: g => amb(g) === "enfants" || amb(g) === "fam", coop: g => amb(g) === "coop" };
  const PR = { n: 4, th: "potes", k: 4, list: null };
  function prog() {
    const ok = games().filter(g => g.min <= PR.n && g.max >= PR.n && TH[PR.th](g) && !g.solo);
    const by = d => shuffle(ok.filter(g => dur(g) === d)), used = new Set(), pick = (pool) => { const g = pool.find(x => !used.has(x.id)); if (g) used.add(g.id); return g; };
    const plan = [["🔥 Échauffement", by(1)], ["🎮 Plat de résistance", by(2).concat(by(3))], ["⚡ Intermède", by(1)], ["🏆 Finale", by(2)], ["🌙 Dernière", by(1)]];
    const order = PR.k <= 3 ? [0, 1, 3] : PR.k === 4 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4];
    return order.map(i => { const g = pick(plan[i][1].length ? plan[i][1] : shuffle(ok)); return g ? [plan[i][0], g] : null; }).filter(Boolean);
  }
  const progSec = () => {
    if (!PR.list) PR.list = prog();
    const pl = PR.list, tot = pl.reduce((s, x) => s + ({ 1: 15, 2: 35, 3: 60 })[dur(x[1])], 0);
    return `<section class="card tools" id="s-prog"><h2>🎟️ Préparer une soirée</h2><p class="hint">Choisis le nombre de joueurs et l'ambiance : l'appli te propose un programme.</p>
      <small>Joueurs</small>${chip([[2, "2"], [3, "3"], [4, "4"], [5, "5"], [6, "6"], [8, "8"], [10, "10+"]], PR.n, "spn")}
      <small>Thème</small>${chip(THEMES, PR.th, "spt")}
      <small>Nombre de jeux</small>${chip([[3, "3"], [4, "4"], [5, "5"]], PR.k, "spk")}
      ${pl.length ? pl.map(x => `<div class="gp"><div><small>${x[0]}</small><b>${x[1].emoji} ${E(x[1].name)}</b><small>${DUR[dur(x[1])]} · ${E(x[1].cat)}</small></div><button class="btn main" data-a="play" data-v="${x[1].id}">🎮</button></div>`).join("") + `<p class="hint">Durée estimée : environ ${hm(tot * 6e4)}.</p>`
        : "<p>Aucun jeu ne correspond à ce thème pour ce nombre de joueurs : change le thème ou le nombre de joueurs.</p>"}
      <button class="btn" data-a="spr">🔀 Un autre programme</button></section>`;
  };
  const soi0 = PAGES.soirees;
  PAGES.soirees = function () { const h = soi0.apply(this, arguments), i = h.indexOf("</section>") + 10; return h.slice(0, i) + progSec() + palSec() + h.slice(i); };
  if (typeof NEED !== "undefined") ["cesoir", "soirees"].forEach(k => NEED.includes(k) || NEED.push(k));

  const reP = () => rd("s-prog", progSec);
  Object.assign(ACTIONS, {
    cen: v => { Q.n = +v; Q.f = null; reCe(); }, ced: v => { Q.d = v; Q.f = null; reCe(); }, cea: v => { Q.a = v; Q.c = "0"; Q.f = null; reCe(); }, cet: v => { Q.t = v; Q.c = "0"; Q.f = null; reCe(); }, cec: v => { Q.c = v; Q.f = null; reCe(); }, cer: () => { Q.f = null; reCe(); },
    spn: v => { PR.n = +v; PR.list = null; reP(); }, spt: v => { PR.th = v; PR.list = null; reP(); }, spk: v => { PR.k = +v; PR.list = null; reP(); }, spr: () => { PR.list = null; reP(); }
  });
})();
