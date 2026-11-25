// ScoreMaster v2.0.0 : Gages et dettes + image de la soirée à partager. Chargé après extras7.js.
(function () {
  "use strict";
  const E = Core.esc, $q = s => document.querySelector(s), nm = s => String(s || "").trim();
  const load = () => { try { return JSON.parse(localStorage.getItem("sm_gages")) || []; } catch (e) { return []; } };
  const store = a => { try { localStorage.setItem("sm_gages", JSON.stringify(a)); return true; } catch (e) { FX.toast("Impossible d'enregistrer"); return false; } };
  const dfr = t => new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const rank = p => Core.ranking(p).map(r => ({ ...r, nom: nm(r.nom) }));
  const parts = () => S.hist.filter(p => p && p.fini !== false && p.manches && p.manches.length && p.joueurs && p.joueurs.length > 1).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  // ---------- GAGES ----------
  const listSec = () => {
    const L = load(), open = L.filter(g => !g.paid), done = L.filter(g => g.paid), m = {};
    open.forEach(g => { const k = [g.from, g.to].sort().join("|"), s = g.from < g.to ? 1 : -1; m[k] = (m[k] || 0) + s; });
    const sum = Object.entries(m).filter(x => x[1]).map(([k, v]) => { const [a, b] = k.split("|"), d = v > 0 ? [a, b] : [b, a], n = Math.abs(v);
      return `<li><span>${E(d[0])} doit à ${E(d[1])}</span><b>${n} gage${n > 1 ? "s" : ""}</b></li>`; }).join("");
    const row = g => `<div class="gg"><div><b>${E(g.from)} → ${E(g.to)}</b><small>${E(g.enjeu)}${g.jeu ? " · " + (g.emoji || "") + " " + E(g.jeu) : ""} · ${dfr(g.at)}</small></div>${g.paid ? `<button class="btn" data-a="gdel" data-v="${g.id}" aria-label="Supprimer">🗑️</button>` : `<button class="btn main" data-a="gpay" data-v="${g.id}">✅ Réglé</button>`}</div>`;
    return `<section class="card tools" id="s-gl"><h2>🧾 Qui doit quoi</h2>${sum ? `<ul class="soil">${sum}</ul>` : `<p class="hint">${open.length ? "Les dettes s'annulent entre elles : tout est équilibré." : "Aucune dette en cours. Bravo, tout le monde est quitte !"}</p>`}
      ${open.length ? `<h2>⏳ À régler (${open.length})</h2>${open.slice().reverse().map(row).join("")}` : ""}
      ${done.length ? `<details><summary class="hint">✅ Déjà réglés (${done.length})</summary>${done.slice().reverse().map(row).join("")}</details>` : ""}</section>`;
  };
  PAGES.gages = () => { const ks = known(), sel = id => `<select id="${id}" aria-label="Joueur">${ks.map(k => `<option>${E(k)}</option>`).join("")}</select>`;
    return `${backPlus}<section class="card"><h1>🍻 Gages et dettes</h1><p>Un café, un resto, la vaisselle… note les enjeux entre amis et vois d'un coup d'œil qui doit quoi à qui.</p></section>${listSec()}
      <section class="card tools"><h2>➕ Ajouter une dette</h2>${ks.length < 2 ? `<p class="hint">Il faut au moins 2 joueurs dans tes parties. Tu peux aussi noter un gage à la fin d'une partie.</p>` : `<div class="duelsel">${sel("gfa")}<b>doit à</b>${sel("gfb")}</div><input id="gfx" placeholder="Un café, un resto…" maxlength="60"><button class="btn main" data-a="gadd">➕ Noter la dette</button>`}</section>`; };
  const finSec = p => `<section class="card tools" id="s-gfin"><h2>🍻 Enjeu de la partie</h2>${load().some(g => g.pid === p.id) ? `<p class="hint">✅ Gage noté. Retrouve-le dans Plus > Gages et dettes.</p>` :
    `<p class="hint">Un enjeu pour pimenter ? Note-le : l'appli retient qui doit quoi.</p><input id="gfe" placeholder="Un café, un resto, la vaisselle…" maxlength="60"><div class="row2"><button class="btn main" data-a="gnew" data-v="last">👑 Le dernier paie le 1er</button><button class="btn" data-a="gnew" data-v="all">💸 Tous paient le 1er</button></div>`}</section>`;
  const fin0 = PAGES.fin;
  PAGES.fin = function () { const h = fin0.apply(this, arguments); return h + (S.last && S.last.id ? finSec(S.last) : ""); };
  const upd = (id, h) => { const el = document.getElementById(id); if (el) el.outerHTML = h; };
  // ---------- SOIRÉES : image à partager ----------
  function soirees() { const out = []; let c = null; parts().forEach(p => { const t = +new Date(p.date); if (!c || t - c.last > 5 * 36e5) { c = { start: t, last: t, ps: [] }; out.push(c); } c.ps.push(p); c.last = t; }); return out.reverse(); }
  function board(s) { const m = {}; s.ps.forEach(p => rank(p).forEach((r, k) => { const x = m[r.nom] || (m[r.nom] = { nom: r.nom, g: 0, w: 0, pts: 0 }); x.g++; if (k === 0) x.w++; x.pts += k === 0 ? 3 : k === 1 ? 1 : 0; })); return Object.values(m).sort((a, b) => b.pts - a.pts || b.w - a.w || a.g - b.g); }
  const soi0 = PAGES.soirees;
  PAGES.soirees = function () { let i = 0; return soi0.apply(this, arguments).replace(/<\/details>/g, () => `<div class="notebox"><button class="btn" data-a="soirimg" data-v="${i++}">🖼️ Partager l'image de la soirée</button></div></details>`); };
  async function soirImg(idx) {
    const s = soirees()[+idx]; if (!s) return; const b = board(s), cs = document.createElement("canvas"); cs.width = 1080; cs.height = 1350; const c = cs.getContext("2d");
    const st = getComputedStyle(document.body), a1 = st.getPropertyValue("--a1").trim() || "#e11d48", a2 = st.getPropertyValue("--a2").trim() || "#f59e0b";
    c.fillStyle = "#0a0a16"; c.fillRect(0, 0, 1080, 1350);
    let g = c.createRadialGradient(200, 100, 20, 200, 100, 900); g.addColorStop(0, a1 + "aa"); g.addColorStop(1, "transparent"); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    g = c.createRadialGradient(950, 1250, 20, 950, 1250, 800); g.addColorStop(0, a2 + "66"); g.addColorStop(1, "transparent"); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    c.textAlign = "center"; c.fillStyle = "#fff"; c.font = "900 60px system-ui,sans-serif"; c.fillText("🌙 Soirée jeux", 540, 110);
    c.font = "500 40px system-ui,sans-serif"; c.fillStyle = "#c3c3dc"; c.fillText(new Date(s.start).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) + " · " + s.ps.length + " partie" + (s.ps.length > 1 ? "s" : ""), 540, 175);
    const pod = [[0, 540, 330, "#f59e0b", "🥇"], [1, 240, 240, "#cbd5e1", "🥈"], [2, 840, 190, "#d97706", "🥉"]], base = 900;
    pod.forEach(([k, x, h, col, med]) => { const r = b[k]; if (!r) return; c.fillStyle = col + "cc"; c.beginPath(); c.roundRect(x - 140, base - h, 280, h, [24, 24, 0, 0]); c.fill();
      c.fillStyle = "#fff"; c.textAlign = "center"; c.font = "80px system-ui,sans-serif"; c.fillText(k === 0 ? "👑" : med, x, base - h - 110); c.font = "900 48px system-ui,sans-serif"; c.fillText(String(r.nom).slice(0, 10), x, base - h - 35);
      c.fillStyle = "#0a0a16"; c.font = "900 64px system-ui,sans-serif"; c.fillText(r.pts + (r.pts > 1 ? " pts" : " pt"), x, base - h + 85); c.font = "600 32px system-ui,sans-serif"; c.fillText(r.w + " victoire" + (r.w > 1 ? "s" : ""), x, base - h + 135); });
    b.slice(3, 7).forEach((r, k) => { const y = 950 + k * 78; c.fillStyle = "rgba(255,255,255,.08)"; c.beginPath(); c.roundRect(150, y, 780, 62, 20); c.fill(); c.textAlign = "left"; c.fillStyle = "#fff"; c.font = "700 36px system-ui,sans-serif"; c.fillText((k + 4) + ".  " + String(r.nom).slice(0, 14), 180, y + 43); c.textAlign = "right"; c.fillText(r.pts + (r.pts > 1 ? " pts" : " pt") + " · " + r.w + " v.", 900, y + 43); });
    const jeux = [...new Set(s.ps.map(p => p.jeu))].join(", "); c.textAlign = "center"; c.fillStyle = "#c3c3dc"; c.font = "500 32px system-ui,sans-serif"; c.fillText(jeux.length > 56 ? jeux.slice(0, 55) + "…" : jeux, 540, 1265);
    c.fillStyle = "#8f8fb0"; c.font = "500 30px system-ui,sans-serif"; c.fillText("Points : 3 par victoire, 1 pour la 2e place · ScoreMaster", 540, 1315);
    const blob = await new Promise(r => cs.toBlob(r, "image/png")), f = new File([blob], "soiree-scoremaster.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: "Notre soirée jeux" }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = f.name; a.click(); FX.toast("🖼️ Image enregistrée");
  }
  if (typeof NEED !== "undefined" && !NEED.includes("gages")) NEED.push("gages");
  Object.assign(ACTIONS, {
    soirimg: soirImg,
    gnew: v => { const p = S.last, e = ($q("#gfe") || {}).value; if (!p) return; if (!nm(e)) return FX.toast("Écris d'abord l'enjeu");
      const rk = rank(p), win = rk[0], lo = v === "last" ? [rk[rk.length - 1]] : rk.slice(1), a = load();
      if (lo.every(l => l.total === win.total)) return FX.toast("Égalité parfaite : pas de gage cette fois");
      lo.filter(l => l.total !== win.total).forEach(l => a.push({ id: Core.uid(), pid: p.id, jeu: p.jeu, emoji: p.emoji, from: l.nom, to: win.nom, enjeu: nm(e), at: Date.now(), paid: false }));
      if (store(a)) { upd("s-gfin", finSec(p)); FX.toast("🍻 Gage noté"); } },
    gadd: () => { const A = $q("#gfa").value, B = $q("#gfb").value, e = nm($q("#gfx").value); if (A === B) return FX.toast("Choisis deux joueurs différents"); if (!e) return FX.toast("Écris l'enjeu");
      const a = load(); a.push({ id: Core.uid(), from: A, to: B, enjeu: e, at: Date.now(), paid: false }); if (store(a)) { $q("#gfx").value = ""; upd("s-gl", listSec()); FX.toast("🍻 Dette notée"); } },
    gpay: id => { const a = load(), g = a.find(x => x.id === id); if (g) { g.paid = true; g.paidAt = Date.now(); store(a); upd("s-gl", listSec()); FX.toast("✅ Réglé !"); } },
    gdel: id => { store(load().filter(x => x.id !== id)); upd("s-gl", listSec()); }
  });
  const plus0 = PAGES.plus;
  PAGES.plus = function () { return plus0().replace("Records et anecdotes</span><u>›</u></a>", "Records et anecdotes</span><u>›</u></a><a href=\"#/gages\"><i>🍻</i><span>Gages et dettes</span><u>›</u></a>"); };
})();
