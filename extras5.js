// ScoreMaster v1.7.0 : Défis de la semaine, « Que jouer ce soir ? », Notes sur les parties. Chargé après extras4.js.
(function () {
  "use strict";
  const E = Core.esc, $q = s => document.querySelector(s), nm = s => String(s || "").trim();
  const parts = () => S.hist.filter(p => p && p.fini !== false && p.manches && p.manches.length && p.joueurs && p.joueurs.length > 1).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const chip = (list, cur, a) => `<div class="chs">${list.map(x => `<button class="btn ${x[0] == cur ? "on" : ""}" data-a="${a}" data-v="${x[0]}">${x[1]}</button>`).join("")}</div>`;
  // ---------- DÉFIS ----------
  const monday = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return +d; };
  function chal(ps, me) {
    const jeux = new Set(ps.map(p => p.jeu)), amis = new Set();
    ps.forEach(p => p.joueurs.forEach(n => { if (!isMe(n) && nm(n)) amis.add(Core.norm(n)); }));
    const mine = ps.filter(p => me && p.joueurs.some(isMe)), res = mine.map(p => isMe(Core.ranking(p)[0].nom));
    let best = 0, run = 0; res.forEach(w => { run = w ? run + 1 : 0; best = Math.max(best, run); });
    const L = [["🎮", "Joue 5 parties", ps.length, 5], ["🃏", "Joue 3 jeux différents", jeux.size, 3], ["👥", "Joue avec 3 joueurs différents", amis.size, 3]];
    if (me) L.push(["🏆", "Gagne 3 parties", res.filter(Boolean).length, 3], ["🔥", "Gagne 2 parties d'affilée", best, 2]);
    return L.map(x => ({ ico: x[0], txt: x[1], val: Math.min(x[2], x[3]), goal: x[3], ok: x[2] >= x[3] }));
  }
  const TITRES = [[0, "🌱 Débutant"], [3, "🎲 Joueur régulier"], [8, "🎯 Habitué"], [15, "🏅 Pro de la table"], [30, "👑 Légende"]];
  PAGES.defis = () => {
    const me = !!(Core.me() && Core.me().nom), all = parts(), wk = monday(Date.now()), byW = {};
    all.forEach(p => { (byW[monday(p.date)] = byW[monday(p.date)] || []).push(p); });
    let stars = 0; Object.keys(byW).forEach(k => { stars += chal(byW[k], me).filter(c => c.ok).length; });
    const cur = chal(byW[wk] || [], me), t = TITRES.filter(x => stars >= x[0]).pop(), nx = TITRES.find(x => x[0] > stars);
    const f = d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    return `${backPlus}<section class="card"><h1>🎯 Défis de la semaine</h1><p>Du ${f(wk)} au ${f(wk + 6 * 864e5)}. Chaque défi réussi rapporte une ⭐ qui reste pour toujours.</p></section>
      <section class="card tools"><h2>⭐ Mes étoiles</h2><div class="stars"><b>${stars}</b><span>${t[1]}</span></div><p class="hint">${nx ? "Prochain titre : " + nx[1] + " à " + nx[0] + " ⭐ (encore " + (nx[0] - stars) + ")" : "Titre maximum atteint, bravo !"}</p></section>
      <section class="card tools"><h2>📅 Cette semaine</h2>${cur.map(c => `<div class="chal ${c.ok ? "ok" : ""}"><div><span>${c.ico} ${c.txt}</span><b>${c.ok ? "✅ +1 ⭐" : c.val + " / " + c.goal}</b></div><div class="bar"><i style="width:${Math.round(100 * c.val / c.goal)}%"></i></div></div>`).join("")}
      ${me ? "" : `<p class="hint">🔒 Crée ton profil (onglet Profil) pour débloquer les défis « Gagne… ».</p>`}</section>`;
  };
  // ---------- QUE JOUER CE SOIR ? ----------
  const DUR = { 1: "⚡ ~10 min", 2: "⏱️ ~30 min", 3: "🕰️ 1 h et +" }, CD = {};
  ["Rapidité", "Dés", "Chaos", "Adresse", "Mémoire", "Cartes", "Duel de cartes", "Pioche et prise de risque"].forEach(c => CD[c] = 1);
  ["Plateau", "Jeux vidéo", "Sport", "Plein air"].forEach(c => CD[c] = 3);
  const CA = {}; ["Ambiance", "Rapidité", "Chaos", "Bluff", "Dés", "Adresse", "Pioche et prise de risque", "Jeux vidéo"].forEach(c => CA[c] = "fun");
  ["Abstrait", "Déduction", "Mots", "Plateau", "Draft", "Mémoire", "Duel", "Plis", "Rami", "Combinaisons", "Capture", "Mises", "Défausse", "Duel de cartes", "Cartes"].forEach(c => CA[c] = "tete");
  CA["Coopératif"] = "coop"; CA["Familial"] = "fam"; CA["Plein air"] = "air"; CA["Sport"] = "air";
  const Q = { n: 4, d: "0", a: "0", k: 0 }, dur = g => CD[g.cat] || 2, amb = g => CA[g.cat] || "tete";
  const games = () => [].concat(window.CAT_CARTES || [], window.CAT_AUTRES || []);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const ceSec = () => {
    const ok = games().filter(g => g.min <= Q.n && g.max >= Q.n && (Q.d === "0" || dur(g) == Q.d) && (Q.a === "0" || amb(g) === Q.a));
    if (!ok.some(g => g.id == Q.f)) Q.f = ok.length ? ok[Math.floor(Math.random() * ok.length)].id : null;
    const f = ok.find(g => g.id == Q.f), meta = g => `${g.min === g.max ? g.min : g.min + "–" + g.max} joueurs · ${DUR[dur(g)]} · ${E(g.cat)}`, more = shuffle(ok.filter(g => g !== f)).slice(0, 5);
    return `<section class="card tools" id="s-ce"><h1>🍿 Que jouer ce soir ?</h1>
      <small>Joueurs</small>${chip([[1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"], [6, "6"], [8, "8+"]], Q.n, "cen")}
      <small>Durée</small>${chip([["0", "Tous"], ["1", "⚡ Rapide"], ["2", "⏱️ Moyen"], ["3", "🕰️ Long"]], Q.d, "ced")}
      <small>Ambiance</small>${chip([["0", "Toutes"], ["fun", "😂 Fun"], ["tete", "🧠 Réflexion"], ["fam", "👨‍👩‍👧 Famille"], ["coop", "🤝 Coop"], ["air", "🌳 Dehors"]], Q.a, "cea")}
      ${f ? `<div class="pick"><span class="em">${f.emoji}</span><div><small>Mon choix pour vous</small><b>${E(f.name)}</b><em>${meta(f)}</em></div></div>
        <div class="row2"><button class="btn main" data-a="play" data-v="${f.id}">🎮 Jouer à ça</button><button class="btn" data-a="cer">🔀 Autre idée</button></div>`
        : "<p>Aucun jeu ne correspond : essaie « Tous » ou « Toutes ».</p>"}
      ${more.length ? `<h2>Aussi possible · ${ok.length} jeu${ok.length > 1 ? "x" : ""}</h2>${more.map(g => `<div class="gp"><div><b>${g.emoji} ${E(g.name)}</b><small>${meta(g)}</small></div><button class="btn main" data-a="play" data-v="${g.id}">🎮</button></div>`).join("")}` : ""}</section>`;
  };
  PAGES.cesoir = () => backPlus + ceSec();
  const reCe = () => { const el = document.getElementById("s-ce"); if (el) el.outerHTML = ceSec(); };
  // ---------- NOTES ----------
  const notes = () => { try { return JSON.parse(localStorage.getItem("sm_notes")) || {}; } catch (e) { return {}; } };
  const noteBox = p => `<div class="notebox"><small>📝 Note ou souvenir</small><textarea data-nid="${E(p.id)}" rows="2" maxlength="300" placeholder="Lieu, anecdote… « Marc a triché ! »">${E((notes()[p.id] || {}).t || "")}</textarea><button class="btn" data-a="note" data-v="${E(p.id)}">💾 Enregistrer la note</button></div>`;
  const hist0 = PAGES.historique, fin0 = PAGES.fin;
  PAGES.historique = function () { const n = notes();
    return hist0.apply(this, arguments).split('<section class="card"><details>').map((c, i) => { if (!i) return c; const m = c.match(/data-a="rm" data-v="([^"]+)"/); if (!m) return c;
      const id = m[1].replace(/&quot;/g, '"'), p = { id }; return c.replace("<summary>", "<summary>" + (n[id] && n[id].t ? "📝 " : "")).replace("</summary>", "</summary>" + noteBox(p)); }).join('<section class="card"><details>'); };
  PAGES.fin = function () { const h = fin0.apply(this, arguments); return h + (S.last && S.last.id ? `<section class="card tools"><h2>📝 Souvenir de cette partie</h2>${noteBox(S.last)}</section>` : ""); };
  if (typeof NEED !== "undefined") ["defis", "cesoir"].forEach(k => NEED.includes(k) || NEED.push(k));
  Object.assign(ACTIONS, {
    cen: v => { Q.n = +v; Q.f = null; reCe(); }, ced: v => { Q.d = v; Q.f = null; reCe(); }, cea: v => { Q.a = v; Q.f = null; reCe(); }, cer: () => { Q.f = null; reCe(); },
    note: id => { const t = document.querySelector('textarea[data-nid="' + id.replace(/"/g, '\\"') + '"]'); if (!t) return; const n = notes(), v = t.value.trim();
      v ? n[id] = { t: v, at: Date.now() } : delete n[id]; try { localStorage.setItem("sm_notes", JSON.stringify(n)); FX.toast(v ? "📝 Note enregistrée" : "🗑️ Note supprimée"); } catch (e) { FX.toast("Impossible d'enregistrer"); } }
  });
  const plus0 = PAGES.plus;
  PAGES.plus = function () { return plus0().replace("Sauvegarde</span><u>›</u></a>", "Sauvegarde</span><u>›</u></a><a href=\"#/defis\"><i>🎯</i><span>Défis de la semaine</span><u>›</u></a><a href=\"#/cesoir\"><i>🍿</i><span>Que jouer ce soir ?</span><u>›</u></a>"); };
})();
