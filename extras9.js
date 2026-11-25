// ScoreMaster v2.2.0 : Forces et faiblesses (taux de victoire par jeu) + Liste d'envies. Chargé après extras8.js.
(function () {
  "use strict";
  const E = Core.esc, $q = s => document.querySelector(s), nm = s => String(s || "").trim(), same = (a, b) => Core.norm(a) === Core.norm(b);
  const parts = () => S.hist.filter(p => p && p.fini !== false && p.manches && p.manches.length && p.joueurs && p.joueurs.length > 1).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const upd = (id, h) => { const el = document.getElementById(id); if (el) el.outerHTML = h; };
  // ---------- FORCES ET FAIBLESSES ----------
  const FS = { p: "" };
  function forces(pl) { const m = {};
    parts().forEach(p => { if (!p.joueurs.some(n => same(n, pl))) return; const x = m[p.jeu] || (m[p.jeu] = { jeu: p.jeu, emoji: p.emoji || "🎲", g: 0, w: 0 }); x.g++; if (same(Core.ranking(p)[0].nom, pl)) x.w++; });
    return Object.values(m); }
  const forSec = () => { const ks = known(), me = Core.me() && Core.me().nom;
    if (!FS.p || !ks.some(k => k === FS.p)) FS.p = ks.find(k => me && same(k, me)) || ks[0] || "";
    const sel = `<select id="fp" aria-label="Joueur">${ks.map(k => `<option ${k === FS.p ? "selected" : ""}>${E(k)}</option>`).join("")}</select>`;
    let out = ks.length ? "" : `<p class="hint">Joue quelques parties pour voir tes forces et faiblesses.</p>`;
    if (FS.p) { const L = forces(FS.p), G = L.reduce((a, x) => a + x.g, 0), W = L.reduce((a, x) => a + x.w, 0);
      if (!L.length) out = `<p class="hint">${E(FS.p)} n'a pas encore de partie terminée.</p>`;
      else { const rate = x => x.w / x.g, min = L.some(x => x.g >= 3) ? 3 : L.some(x => x.g >= 2) ? 2 : 1, pool = L.filter(x => x.g >= min);
        const fav = pool.slice().sort((a, b) => rate(b) - rate(a) || b.g - a.g)[0], bad = pool.slice().sort((a, b) => rate(a) - rate(b) || b.g - a.g)[0];
        const pc = x => Math.round(100 * rate(x)) + " %", det = x => `${x.emoji} ${E(x.jeu)} · ${x.w} victoire${x.w > 1 ? "s" : ""} sur ${x.g}`;
        out = `<div class="kp2"><div><b>${Math.round(100 * W / G)} %</b><small>de victoires en tout</small></div><div><b>${G}</b><small>parties jouées</small></div></div>
          ${fav ? card2("🏆", "Jeu fétiche", pc(fav), det(fav)) : ""}${bad && bad !== fav && rate(bad) < rate(fav) ? card2("💀", "Bête noire", pc(bad), det(bad)) : ""}
          <small>Taux de victoire par jeu${min > 1 ? " (jeux joués au moins " + min + " fois)" : ""}</small>
          ${pool.sort((a, b) => b.g - a.g || rate(b) - rate(a)).map(x => `<div class="tb"><b>${E(x.jeu)}</b><div><i class="${rate(x) >= .5 ? "g" : ""}" style="width:${Math.max(4, Math.round(100 * rate(x)))}%"></i></div><em>${pc(x)}</em></div>`).join("")}`; } }
    return `<section class="card tools" id="s-fo"><h1>💪 Forces et faiblesses</h1><p class="hint">Choisis un joueur : l'appli calcule son taux de victoire jeu par jeu.</p><div class="duelsel">${sel}</div><button class="btn main" data-a="fov">📊 Voir les stats</button>${out}</section>`; };
  const card2 = (ico, t, v, d) => `<div class="rec"><span>${ico}</span><div><small>${t}</small><b>${v}</b><em>${d}</em></div></div>`;
  PAGES.forces = () => backPlus + forSec();
  // ---------- LISTE D'ENVIES ----------
  const WD = { pick: null };
  const wl = () => { try { return JSON.parse(localStorage.getItem("sm_wish")) || []; } catch (e) { return []; } };
  const ws = a => { try { localStorage.setItem("sm_wish", JSON.stringify(a)); return true; } catch (e) { FX.toast("Impossible d'enregistrer"); return false; } };
  const cat = () => [].concat(window.CAT_CARTES || [], window.CAT_AUTRES || []);
  const flat = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const played = w => w.done || S.hist.some(p => p && p.jeu === w.name && new Date(p.date) >= w.at - 864e5 * 0);
  const resHtml = q => { q = flat(q).trim(); if (q.length < 2) return ""; const have = new Set(wl().map(w => String(w.id)));
    const r = cat().filter(g => flat(g.name).includes(q) && !have.has(String(g.id))).slice(0, 6);
    return r.length ? r.map(g => `<div class="gp"><div><b>${g.emoji} ${E(g.name)}</b><small>${g.min === g.max ? g.min : g.min + "–" + g.max} joueurs · ${E(g.cat)}</small></div><button class="btn main" data-a="wadd" data-v="${g.id}" aria-label="Ajouter">➕</button></div>`).join("") : `<p class="hint">Aucun jeu trouvé (ou déjà dans ta liste).</p>`; };
  const listSec = () => { const L = wl(), todo = L.filter(w => !played(w)), done = L.filter(played), pk = WD.pick && todo.find(w => String(w.id) === String(WD.pick));
    const row = (w, d) => `<div class="gg"><div><b>${w.emoji} ${E(w.name)}</b><small>${d ? "✅ joué" : "à tester"}</small></div><div class="wb">${d ? "" : `<button class="btn main" data-a="play" data-v="${w.id}" aria-label="Jouer">🎮</button><button class="btn" data-a="wdone" data-v="${w.id}" aria-label="Marquer comme joué">✅</button>`}<button class="btn" data-a="wdel" data-v="${w.id}" aria-label="Retirer">🗑️</button></div></div>`;
    return `<section class="card tools" id="s-wl"><h2>⭐ À tester (${todo.length})</h2>
      ${todo.length > 1 ? `<button class="btn main" data-a="wdraw">🎲 Tirer au sort un jeu de ma liste</button>` : ""}
      ${pk ? `<div class="pick"><span class="em">${pk.emoji}</span><div><small>Ce soir, on teste…</small><b>${E(pk.name)}</b></div><button class="btn main" data-a="play" data-v="${pk.id}">🎮</button></div>` : ""}
      ${todo.length ? todo.map(w => row(w, false)).join("") : `<p class="hint">Ta liste est vide. Cherche un jeu ci-dessous pour l'ajouter.</p>`}
      ${done.length ? `<details><summary class="hint">✅ Déjà joués (${done.length})</summary>${done.map(w => row(w, true)).join("")}</details>` : ""}</section>`; };
  PAGES.envies = () => `${backPlus}<section class="card"><h1>⭐ Liste d'envies</h1><p>Les jeux que tu veux essayer un jour. Dès que tu en joues un, il passe tout seul dans « Déjà joués ».</p></section>${listSec()}
    <section class="card tools"><h2>🔍 Ajouter un jeu</h2><input id="wq" placeholder="Écris le nom d'un jeu…" autocomplete="off" aria-label="Chercher un jeu"><div id="wres"></div></section>`;
  document.addEventListener("input", e => { if (e.target && e.target.id === "wq") { const r = document.getElementById("wres"); if (r) r.innerHTML = resHtml(e.target.value); } });
  if (typeof NEED !== "undefined") ["forces", "envies"].forEach(k => NEED.includes(k) || NEED.push(k));
  Object.assign(ACTIONS, {
    fov: () => { FS.p = $q("#fp").value; upd("s-fo", forSec()); },
    wadd: id => { const g = cat().find(x => String(x.id) === String(id)), L = wl(); if (!g || L.some(w => String(w.id) === String(id))) return;
      L.push({ id: g.id, name: g.name, emoji: g.emoji, at: Date.now(), done: false }); if (ws(L)) { upd("s-wl", listSec()); const q = $q("#wq"); if (q) q.value = ""; const r = $q("#wres"); if (r) r.innerHTML = ""; FX.toast("⭐ Ajouté à ta liste"); } },
    wdone: id => { const L = wl(), w = L.find(x => String(x.id) === String(id)); if (w) { w.done = true; ws(L); upd("s-wl", listSec()); FX.toast("✅ Bien joué !"); } },
    wdel: id => { ws(wl().filter(x => String(x.id) !== String(id))); upd("s-wl", listSec()); },
    wdraw: () => { const t = wl().filter(w => !played(w)); if (!t.length) return; WD.pick = t[Math.floor(Math.random() * t.length)].id; buzz(); upd("s-wl", listSec()); }
  });
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(15); FX.sfx("ok"); } catch (e) {} };
  const plus0 = PAGES.plus;
  PAGES.plus = function () { return plus0().replace("Gages et dettes</span><u>›</u></a>", "Gages et dettes</span><u>›</u></a><a href=\"#/forces\"><i>💪</i><span>Forces et faiblesses</span><u>›</u></a><a href=\"#/envies\"><i>⭐</i><span>Liste d'envies</span><u>›</u></a>"); };
})();
