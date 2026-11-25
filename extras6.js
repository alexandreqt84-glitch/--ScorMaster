// ScoreMaster v1.8.0 : Mon activité (calendrier façon GitHub, série de jours, jeux les plus joués). Chargé après extras5.js.
(function () {
  "use strict";
  const E = Core.esc, pad = n => String(n).padStart(2, "0");
  const key = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const num = k => { const [y, m, d] = k.split("-").map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
  const parts = () => S.hist.filter(p => p && p.fini !== false && p.manches && p.manches.length && p.date);
  const DAYS = {};
  const lvl = n => n >= 5 ? 4 : n >= 3 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0;
  PAGES.activite = () => {
    const ps = parts(), by = {}, cnt = {}; ps.forEach(p => { const k = key(new Date(p.date)); (by[k] = by[k] || []).push(p.jeu); cnt[p.jeu] = (cnt[p.jeu] || 0) + 1; });
    Object.keys(DAYS).forEach(k => delete DAYS[k]); Object.assign(DAYS, by);
    const days = Object.keys(by).sort(), t0 = new Date(); t0.setHours(0, 0, 0, 0); const tk = key(t0), today = num(tk);
    const set = new Set(days.map(num)); let cur = 0, c = set.has(today) ? today : today - 1; while (set.has(c)) { cur++; c--; }
    let rec = 0, run = 0, prev = -9; days.map(num).forEach(n => { run = n === prev + 1 ? run + 1 : 1; rec = Math.max(rec, run); prev = n; });
    const st = new Date(t0); st.setDate(st.getDate() - (st.getDay() + 6) % 7 - 12 * 7);
    let grid = "", n13 = 0, act = 0; const dn = ["L", "", "M", "", "V", "", "D"];
    for (let k = 0; k < 7; k++) { grid += `<span>${dn[k]}</span>`; for (let w = 0; w < 13; w++) { const d = new Date(st); d.setDate(st.getDate() + w * 7 + k); const kk = key(d);
      if (d > t0) { grid += `<i class="hl x"></i>`; continue; } const n = (by[kk] || []).length; if (n) { act++; n13 += n; }
      grid += `<button class="hl l${lvl(n)} ${kk === tk ? "tod" : ""}" data-a="hmd" data-v="${kk}" aria-label="${kk} : ${n} partie(s)"></button>`; } }
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 5), mx = top.length ? top[0][1] : 1;
    return `${backPlus}<section class="card"><h1>📈 Mon activité</h1><p>Chaque carré est un jour : plus tu as joué, plus il est coloré. Touche un carré pour voir le détail.</p></section>
      <section class="card tools"><div class="kp2"><div><b>🔥 ${cur}</b><small>jour${cur > 1 ? "s" : ""} de suite</small></div><div><b>🏅 ${rec}</b><small>record de série</small></div><div><b>${act}</b><small>jours actifs (13 sem.)</small></div><div><b>${n13}</b><small>parties (13 sem.)</small></div></div>
      ${cur === 0 && days.length ? `<p class="hint">Ta série est à zéro : joue une partie aujourd'hui pour la relancer.</p>` : ""}</section>
      <section class="card tools"><h2>🗓️ Les 13 dernières semaines</h2><div class="hmg">${grid}</div><p class="hint" id="hmi">Touche un jour pour voir ce que tu as joué.</p>
      <div class="hleg">Moins <i class="hl l0"></i><i class="hl l1"></i><i class="hl l2"></i><i class="hl l3"></i><i class="hl l4"></i> Plus</div></section>
      <section class="card tools"><h2>🎮 Mes jeux les plus joués</h2>${top.length ? top.map((g, i) => `<div class="tb"><b>${E(g[0])}</b><div><i class="${i ? "" : "g"}" style="width:${Math.max(6, Math.round(100 * g[1] / mx))}%"></i></div><em>${g[1]}</em></div>`).join("") : "<p>Joue ta première partie pour voir tes stats.</p>"}</section>`;
  };
  if (typeof NEED !== "undefined" && !NEED.includes("activite")) NEED.push("activite");
  ACTIONS.hmd = k => { const el = document.getElementById("hmi"), l = DAYS[k] || [], d = new Date(k + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    if (el) el.textContent = l.length ? d + " : " + l.length + " partie" + (l.length > 1 ? "s" : "") + " (" + [...new Set(l)].join(", ") + ")" : d + " : rien joué"; };
  const plus0 = PAGES.plus;
  PAGES.plus = function () { return plus0().replace("Que jouer ce soir ?</span><u>›</u></a>", "Que jouer ce soir ?</span><u>›</u></a><a href=\"#/activite\"><i>📈</i><span>Mon activité</span><u>›</u></a>"); };
})();
