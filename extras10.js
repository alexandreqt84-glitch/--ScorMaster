// ScoreMaster v2.3.0 : Règles maison (rappel dans la partie) + Récap du mois en image. Chargé après extras9.js.
(function () {
  "use strict";
  const E = Core.esc, $q = s => document.querySelector(s);
  const parts = () => S.hist.filter(p => p && p.fini !== false && p.manches && p.manches.length && p.joueurs && p.joueurs.length > 1).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const upd = (id, h) => { const el = document.getElementById(id); if (el) el.outerHTML = h; };
  const cat = () => [].concat(window.CAT_CARTES || [], window.CAT_AUTRES || []);
  // ---------- RÈGLES MAISON ----------
  const rules = () => { try { return JSON.parse(localStorage.getItem("sm_rules")) || {}; } catch (e) { return {}; } };
  const rs = o => { try { localStorage.setItem("sm_rules", JSON.stringify(o)); return true; } catch (e) { FX.toast("Impossible d'enregistrer"); return false; } };
  const ta = name => [...document.querySelectorAll("textarea[data-rn]")].find(t => t.dataset.rn === name);
  const rbox = p => { const t = rules()[p.jeu] || "";
    return `<section class="card tools"><details ${t && (!p.manches || !p.manches.length) ? "open" : ""}><summary><b>📌 Règles maison</b> <small>${t ? "" : "(ajouter)"}</small></summary>${t ? `<p class="rtxt">${E(t).replace(/\n/g, "<br>")}</p>` : ""}
      <textarea data-rn="${E(p.jeu)}" rows="3" maxlength="400" placeholder="Chez nous, le 7 vaut 2 points…">${E(t)}</textarea><button class="btn" data-a="rsave" data-v="${E(p.jeu)}">💾 Enregistrer</button></details></section>`; };
  const partie0 = PAGES.partie;
  PAGES.partie = function () { return (S.cur && S.cur.jeu ? rbox(S.cur) : "") + partie0.apply(this, arguments); };
  const listSec = () => { const r = rules(), k = Object.keys(r).sort();
    return `<section class="card tools" id="s-rl"><h2>📚 Mes règles maison (${k.length})</h2>${k.length ? k.map(n => `<div class="rbl"><b>${E(n)}</b><textarea data-rn="${E(n)}" rows="3" maxlength="400">${E(r[n])}</textarea><div class="row2"><button class="btn" data-a="rsave" data-v="${E(n)}">💾 Enregistrer</button><button class="btn" data-a="rdel" data-v="${E(n)}">🗑️ Supprimer</button></div></div>`).join("") : `<p class="hint">Aucune règle pour l'instant. Ajoute-en une ci-dessous, ou directement dans une partie.</p>`}</section>`; };
  PAGES.regles = () => `${backPlus}<section class="card"><h1>📌 Règles maison</h1><p>Vos variantes à vous (« le 7 vaut 2 points »). Elles s'affichent en rappel au début de chaque partie du jeu concerné.</p></section>${listSec()}
    <section class="card tools"><h2>➕ Ajouter une règle</h2><select id="rg" aria-label="Jeu">${[...new Set(cat().map(g => g.name))].sort((a, b) => a.localeCompare(b, "fr")).map(n => `<option>${E(n)}</option>`).join("")}</select><textarea id="rgt" rows="3" maxlength="400" placeholder="Chez nous…"></textarea><button class="btn main" data-a="radd">➕ Ajouter</button></section>`;
  // ---------- RÉCAP DU MOIS ----------
  const MN = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const mkey = d => { d = new Date(d); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); };
  const mlabel = k => { const [y, m] = k.split("-"); return MN[m - 1] + " " + y; };
  const RC = { k: "" };
  function recap(k) { const ps = parts().filter(p => mkey(p.date) === k); if (!ps.length) return null; const jeux = {}, wins = {}, gp = {}, days = {}; let big = null;
    ps.forEach(p => { const rk = Core.ranking(p).map(r => ({ ...r, nom: String(r.nom).trim() })); jeux[p.jeu] = (jeux[p.jeu] || 0) + 1; wins[rk[0].nom] = (wins[rk[0].nom] || 0) + 1; rk.forEach(r => gp[r.nom] = (gp[r.nom] || 0) + 1);
      const d = new Date(p.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); days[d] = (days[d] || 0) + 1;
      const gap = Math.abs(rk[0].total - rk[1].total); if (!big || gap > big.gap) big = { gap, a: rk[0], b: rk[1], jeu: p.jeu, emoji: p.emoji || "🎲" }; });
    const top = o => Object.entries(o).sort((a, b) => b[1] - a[1])[0], tw = Object.entries(wins).sort((a, b) => b[1] - a[1] || b[1] / gp[b[0]] - a[1] / gp[a[0]])[0];
    return { n: ps.length, nj: Object.keys(jeux).length, tj: top(jeux), tw: [tw[0], tw[1], gp[tw[0]]], big: big.gap > 0 ? big : null, td: top(days) }; }
  const months = () => [...new Set(parts().map(p => mkey(p.date)))].sort().reverse().slice(0, 6);
  const recSec = () => { const ms = months(); if (!ms.length) return `<section class="card tools" id="s-rc"><p class="hint">Joue quelques parties : ton récap apparaîtra ici.</p></section>`;
    if (!ms.includes(RC.k)) RC.k = ms[0]; const r = recap(RC.k), c = (i, t, v, d) => `<div class="rec"><span>${i}</span><div><small>${t}</small><b>${v}</b><em>${d}</em></div></div>`;
    return `<section class="card tools" id="s-rc"><div class="chs">${ms.map(k => `<button class="btn ${k === RC.k ? "on" : ""}" data-a="rcm" data-v="${k}">${mlabel(k)}</button>`).join("")}</div>
      <div class="kp2"><div><b>${r.n}</b><small>partie${r.n > 1 ? "s" : ""}</small></div><div><b>${r.nj}</b><small>jeu${r.nj > 1 ? "x" : ""} différent${r.nj > 1 ? "s" : ""}</small></div></div>
      ${c("🎮", "Jeu du mois", E(r.tj[0]), r.tj[1] + " partie" + (r.tj[1] > 1 ? "s" : ""))}${c("👑", "Joueur du mois", E(r.tw[0]), r.tw[1] + " victoire" + (r.tw[1] > 1 ? "s" : "") + " sur " + r.tw[2] + " parties")}
      ${r.big ? c("💥", "Plus belle victoire", E(r.big.a.nom) + " " + r.big.a.total + " – " + r.big.b.total, r.big.emoji + " " + E(r.big.jeu) + " contre " + E(r.big.b.nom)) : ""}${c("🔥", "Jour le plus chargé", E(r.td[0]), r.td[1] + " partie" + (r.td[1] > 1 ? "s" : ""))}
      <button class="btn main" data-a="recimg" data-v="${RC.k}">🖼️ Partager l'image du mois</button></section>`; };
  PAGES.recap = () => `${backPlus}<section class="card"><h1>📅 Récap du mois</h1><p>Ton mois de jeux en un coup d'œil, à partager au groupe.</p></section>${recSec()}`;
  async function recImg(k) { const r = recap(k); if (!r) return; const cs = document.createElement("canvas"); cs.width = 1080; cs.height = 1350; const c = cs.getContext("2d");
    const st = getComputedStyle(document.body), a1 = st.getPropertyValue("--a1").trim() || "#e11d48", a2 = st.getPropertyValue("--a2").trim() || "#f59e0b";
    c.fillStyle = "#0a0a16"; c.fillRect(0, 0, 1080, 1350); let g = c.createRadialGradient(200, 100, 20, 200, 100, 900); g.addColorStop(0, a1 + "aa"); g.addColorStop(1, "transparent"); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    g = c.createRadialGradient(950, 1250, 20, 950, 1250, 800); g.addColorStop(0, a2 + "66"); g.addColorStop(1, "transparent"); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    c.textAlign = "center"; c.fillStyle = "#fff"; c.font = "900 62px system-ui,sans-serif"; c.fillText("📅 Mon mois de jeux", 540, 115); c.font = "500 42px system-ui,sans-serif"; c.fillStyle = "#c3c3dc"; c.fillText(mlabel(k), 540, 180);
    c.fillStyle = "#fbbf24"; c.font = "900 190px system-ui,sans-serif"; c.fillText(String(r.n), 540, 390); c.fillStyle = "#fff"; c.font = "600 44px system-ui,sans-serif"; c.fillText("partie" + (r.n > 1 ? "s" : "") + " · " + r.nj + " jeu" + (r.nj > 1 ? "x" : "") + " différent" + (r.nj > 1 ? "s" : ""), 540, 455);
    const rows = [["🎮", "JEU DU MOIS", String(r.tj[0]), r.tj[1] + " parties"], ["👑", "JOUEUR DU MOIS", String(r.tw[0]), r.tw[1] + " victoire" + (r.tw[1] > 1 ? "s" : "") + " sur " + r.tw[2]]];
    if (r.big) rows.push(["💥", "PLUS BELLE VICTOIRE", r.big.a.nom + " " + r.big.a.total + " – " + r.big.b.total, r.big.jeu]); rows.push(["🔥", "JOUR LE PLUS CHARGÉ", r.td[0], r.td[1] + " partie" + (r.td[1] > 1 ? "s" : "")]);
    rows.forEach((x, i) => { const y = 520 + i * 180; c.fillStyle = "rgba(255,255,255,.09)"; c.beginPath(); c.roundRect(80, y, 920, 156, 32); c.fill(); c.textAlign = "left"; c.font = "70px system-ui,sans-serif"; c.fillStyle = "#fff"; c.fillText(x[0], 110, y + 98);
      c.fillStyle = "#a9a9c8"; c.font = "600 26px system-ui,sans-serif"; c.fillText(x[1], 215, y + 46); c.fillStyle = "#fff"; c.font = "900 46px system-ui,sans-serif"; c.fillText(String(x[2]).slice(0, 24), 215, y + 98); c.fillStyle = "#c3c3dc"; c.font = "500 30px system-ui,sans-serif"; c.fillText(String(x[3]).slice(0, 34), 215, y + 136); });
    c.textAlign = "center"; c.fillStyle = "#8f8fb0"; c.font = "500 30px system-ui,sans-serif"; c.fillText("Scores suivis avec ScoreMaster", 540, 1305);
    const blob = await new Promise(rr => cs.toBlob(rr, "image/png")), f = new File([blob], "recap-" + k + ".png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: "Mon mois de jeux" }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = f.name; a.click(); FX.toast("🖼️ Image enregistrée"); }
  if (typeof NEED !== "undefined") ["regles", "recap"].forEach(k => NEED.includes(k) || NEED.push(k));
  Object.assign(ACTIONS, {
    rsave: n => { const t = ta(n); if (!t) return; const r = rules(), v = t.value.trim(); v ? r[n] = v : delete r[n]; if (rs(r)) FX.toast(v ? "📌 Règle enregistrée" : "🗑️ Règle supprimée"); },
    rdel: n => { const r = rules(); delete r[n]; rs(r); upd("s-rl", listSec()); },
    radd: () => { const n = $q("#rg").value, v = $q("#rgt").value.trim(); if (!v) return FX.toast("Écris la règle d'abord"); const r = rules(); r[n] = r[n] ? r[n] + "\n" + v : v; if (rs(r)) { $q("#rgt").value = ""; upd("s-rl", listSec()); FX.toast("📌 Règle ajoutée à " + n); } },
    rcm: k => { RC.k = k; upd("s-rc", recSec()); }, recimg: recImg
  });
  const plus0 = PAGES.plus;
  PAGES.plus = function () { return plus0().replace("Liste d'envies</span><u>›</u></a>", "Liste d'envies</span><u>›</u></a><a href=\"#/regles\"><i>📌</i><span>Règles maison</span><u>›</u></a><a href=\"#/recap\"><i>📅</i><span>Récap du mois</span><u>›</u></a>"); };
})();
