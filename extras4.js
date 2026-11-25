// ScoreMaster v1.6.0 : Soirées jeux, Duels entre joueurs, Sauvegarde/restauration. Chargé après extras3.js.
(function () {
  "use strict";
  const E = Core.esc, $q = s => document.querySelector(s), nm = s => String(s || "").trim();
  const parts = () => S.hist.filter(p => p && p.manches && p.manches.length && p.joueurs && p.joueurs.length > 1).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const dstr = t => new Date(t).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const rank = p => Core.ranking(p).map(r => ({ ...r, nom: nm(r.nom) }));
  // ---------- SOIRÉES : une soirée = parties séparées de moins de 5 h ----------
  function soirees() { const out = []; let c = null;
    parts().forEach(p => { const t = +new Date(p.date); if (!c || t - c.last > 5 * 36e5) { c = { start: t, last: t, ps: [] }; out.push(c); } c.ps.push(p); c.last = t; });
    return out.reverse(); }
  function board(s) { const m = {}; s.ps.forEach(p => rank(p).forEach((r, k) => { const x = m[r.nom] || (m[r.nom] = { nom: r.nom, g: 0, w: 0, pts: 0 }); x.g++; if (k === 0) x.w++; x.pts += k === 0 ? 3 : k === 1 ? 1 : 0; }));
    return Object.values(m).sort((a, b) => b.pts - a.pts || b.w - a.w || a.g - b.g); }
  function soireeHtml(s, open) { const b = board(s), win = b[0];
    const list = s.ps.slice().reverse().map(p => { const r = rank(p); return `<li><span>${p.emoji || "🎲"} <b>${E(p.jeu)}</b></span><small>🏆 ${E(r[0].nom)} · ${r[0].total}${r[1] ? " – " + E(r[1].nom) + " " + r[1].total : ""}</small></li>`; }).join("");
    return `<details class="card soi" ${open ? "open" : ""}><summary><b>🌙 ${E(dstr(s.start))}</b><small>${s.ps.length} partie${s.ps.length > 1 ? "s" : ""} · 🏆 ${E(win.nom)}</small></summary>
      <table class="tbl"><thead><tr><th>#</th><th>Joueur</th><th>Parties</th><th>Victoires</th><th>Pts</th></tr></thead><tbody>${b.map((x, i) => `<tr><td>${["🥇", "🥈", "🥉"][i] || i + 1}</td><td>${E(x.nom)}</td><td>${x.g}</td><td>${x.w}</td><td><b>${x.pts}</b></td></tr>`).join("")}</tbody></table>
      <ul class="soil">${list}</ul></details>`; }
  PAGES.soirees = () => { const l = soirees();
    return `${backPlus}<section class="card"><h1>🌙 Soirées jeux</h1><p>Les parties jouées à moins de 5 h d'écart forment une soirée. Points : 🥇 3 · 🥈 1. Le vainqueur de la soirée est celui qui en a le plus.</p></section>`
      + (l.length ? l.map((s, i) => soireeHtml(s, i === 0)).join("") : `<section class="card"><p>Aucune partie terminée pour l'instant. Joue une partie et reviens ici !</p></section>`); };
  // ---------- DUELS ----------
  const D = { a: "", b: "" };
  function duel(a, b) { const g = parts().filter(p => { const n = p.joueurs.map(nm); return n.includes(a) && n.includes(b); });
    const res = g.map(p => { const r = rank(p), ia = r.findIndex(x => x.nom === a), ib = r.findIndex(x => x.nom === b);
      return { p, w: r[ia].total === r[ib].total ? "N" : ia < ib ? "A" : "B", ta: r[ia].total, tb: r[ib].total }; });
    let sa = 0, sb = 0; for (let i = res.length - 1; i >= 0 && res[i].w !== "N" && res[i].w === res[res.length - 1].w; i--) res[res.length - 1].w === "A" ? sa++ : sb++;
    const best = (k, who) => { const v = res.filter(x => x.w !== undefined).map(x => who === "A" ? x.ta : x.tb); if (!v.length) return "–"; return res.some(x => x.p.low) ? Math.min(...v) : Math.max(...v); };
    return { res, wa: res.filter(x => x.w === "A").length, wb: res.filter(x => x.w === "B").length, nul: res.filter(x => x.w === "N").length, sa, sb, ba: best(0, "A"), bb: best(0, "B") }; }
  const duelSec = () => { const ks = known(); if (!D.a) { D.a = ks[0] || ""; D.b = ks[1] || ""; }
    const sel = (id, v) => `<select id="${id}" aria-label="Joueur">${ks.map(k => `<option ${k === v ? "selected" : ""}>${E(k)}</option>`).join("")}</select>`;
    let out = ""; if (ks.length < 2) out = "<p>Il faut au moins 2 joueurs différents dans tes parties.</p>";
    else if (D.a === D.b) out = "<p>Choisis deux joueurs différents.</p>";
    else { const d = duel(D.a, D.b); if (!d.res.length) out = `<p>${E(D.a)} et ${E(D.b)} n'ont pas encore joué ensemble.</p>`;
      else { const lead = d.wa === d.wb ? "Égalité parfaite" : "🏆 " + E(d.wa > d.wb ? D.a : D.b) + " mène";
        out = `<div class="vs"><div><small>${E(D.a)}</small><b>${d.wa}</b></div><span>VS</span><div><small>${E(D.b)}</small><b>${d.wb}</b></div></div><p class="dtot">${lead} · ${d.res.length} duel${d.res.length > 1 ? "s" : ""}${d.nul ? " · " + d.nul + " nul" : ""}</p>
        <ul class="soil"><li><span>🔥 Série en cours</span><small>${d.sa ? E(D.a) + " : " + d.sa + " de suite" : d.sb ? E(D.b) + " : " + d.sb + " de suite" : "aucune"}</small></li>
        <li><span>⭐ Meilleur score</span><small>${E(D.a)} ${d.ba} · ${E(D.b)} ${d.bb}</small></li></ul>
        <small>5 derniers duels</small><ul class="soil">${d.res.slice(-5).reverse().map(x => `<li><span>${x.p.emoji || "🎲"} ${E(x.p.jeu)}</span><small>${x.w === "N" ? "nul" : "🏆 " + E(x.w === "A" ? D.a : D.b)} · ${x.ta}–${x.tb}</small></li>`).join("")}</ul>`; } }
    return `<section class="card tools" id="s-duel"><h1>⚔️ Duels</h1><p class="hint">Choisis deux joueurs : l'appli compare toutes les parties jouées ensemble.</p><div class="duelsel">${sel("duA", D.a)}<b>VS</b>${sel("duB", D.b)}</div><button class="btn main" data-a="duel">⚔️ Comparer</button>${out}</section>`; };
  PAGES.duels = () => backPlus + duelSec();
  // ---------- SAUVEGARDE ----------
  const lastBk = () => { try { return localStorage.getItem("sm_lastbk"); } catch (e) { return null; } };
  PAGES.sauvegarde = () => { const n = S.hist.length, lb = lastBk();
    return `${backPlus}<section class="card tools"><h1>💾 Sauvegarde</h1><p>Tes parties et réglages sont gardés dans ce navigateur. Fais un fichier de secours pour les retrouver si tu changes de téléphone ou si tu effaces les données.</p><p class="hint">${n} partie${n > 1 ? "s" : ""} enregistrée${n > 1 ? "s" : ""} · ${lb ? "dernière sauvegarde le " + new Date(+lb).toLocaleDateString("fr-FR") : "jamais sauvegardé"}</p></section>
      <section class="card tools"><h2>📤 Créer la sauvegarde</h2><p class="hint">Un fichier .json est téléchargé. Garde-le dans tes fichiers ou envoie-le-toi par mail.</p><button class="btn main" data-a="bk">💾 Télécharger ma sauvegarde</button></section>
      <section class="card tools"><h2>📥 Restaurer</h2><p class="hint">Choisis un fichier de sauvegarde. Tes parties actuelles sont gardées : seules les parties manquantes sont ajoutées.</p><input type="file" id="bkf" accept=".json,application/json"><button class="btn main" data-a="rs">📥 Restaurer ce fichier</button></section>`; };
  if (typeof NEED !== "undefined") ["soirees", "duels", "sauvegarde"].forEach(k => NEED.includes(k) || NEED.push(k));
  Object.assign(ACTIONS, {
    duel: () => { D.a = $q("#duA").value; D.b = $q("#duB").value; const el = document.getElementById("s-duel"); if (el) el.outerHTML = duelSec(); },
    bk: () => { const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); }
      const b = new Blob([JSON.stringify({ app: "scoremaster", v: 1, date: new Date().toISOString(), ls })], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "scoremaster-sauvegarde-" + new Date().toISOString().slice(0, 10) + ".json"; a.click();
      try { localStorage.setItem("sm_lastbk", Date.now()); } catch (e) {} FX.toast("💾 Sauvegarde téléchargée"); },
    rs: () => { const f = $q("#bkf") && $q("#bkf").files[0]; if (!f) return FX.toast("Choisis d'abord un fichier");
      const r = new FileReader(); r.onload = () => { try { const b = JSON.parse(r.result); if (b.app !== "scoremaster" || !b.ls) throw 0; const ls = b.ls; let add = 0;
        const mine = Core._lp(), ids = new Set(mine.map(p => p.id)); (JSON.parse(ls[Core.PK] || "[]")).forEach(p => { if (p && p.id && !ids.has(p.id)) { mine.push(p); add++; } }); Core._sp(mine);
        const th = JSON.parse(ls[Core.SK] || "{}"), cur = Core.store || {}; for (const k in th) if (!cur[k] || (cur[k].t || 0) < (th[k].t || 0)) { cur[k] = th[k]; Core.dirty[k] = 1; } Core.store = cur; Core._save();
        for (const k in ls) if (![Core.PK, Core.SK, Core.SK + "_d", Core.PQ].includes(k) && localStorage.getItem(k) === null) localStorage.setItem(k, ls[k]);
        FX.toast("✅ " + add + " partie(s) ajoutée(s)"); setTimeout(() => location.reload(), 1100); } catch (e) { FX.toast("❌ Ce fichier n'est pas une sauvegarde ScoreMaster"); } };
      r.readAsText(f); }
  });
  const plus0 = PAGES.plus;
  PAGES.plus = function () { return plus0().replace("Outils de jeu</span><u>›</u></a>", "Outils de jeu</span><u>›</u></a><a href=\"#/soirees\"><i>🌙</i><span>Soirées jeux</span><u>›</u></a><a href=\"#/duels\"><i>⚔️</i><span>Duels entre joueurs</span><u>›</u></a><a href=\"#/sauvegarde\"><i>💾</i><span>Sauvegarde</span><u>›</u></a>"); };
})();
