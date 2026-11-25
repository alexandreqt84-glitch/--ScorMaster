// ScoreMaster v1.9.0 : Records et anecdotes (hall of fame). Chargé après extras6.js.
(function () {
  "use strict";
  const E = Core.esc, nm = s => String(s || "").trim();
  const parts = () => S.hist.filter(p => p && p.fini !== false && p.manches && p.manches.length && p.joueurs && p.joueurs.length > 1).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const dfr = d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  const R = p => Core.ranking(p).map(r => ({ ...r, nom: nm(r.nom) }));
  const card = (ico, t, v, d) => `<div class="rec"><span>${ico}</span><div><small>${t}</small><b>${v}</b><em>${d}</em></div></div>`;
  function compute() {
    const ps = parts(), o = {}, pair = {}, st = {};
    ps.forEach(p => { const rk = R(p), g = ` · ${p.emoji || "🎲"} ${E(p.jeu)} · ${dfr(p.date)}`, lo = !!p.low;
      if (!lo) rk.forEach(r => { if (!o.score || r.total > o.score.v) o.score = { v: r.total, n: r.nom, g }; });
      const gap = Math.abs(rk[0].total - rk[1].total);
      if (!o.close || gap < o.close.v) o.close = { v: gap, a: rk[0], b: rk[1], g };
      if (!o.big || gap > o.big.v) o.big = { v: gap, a: rk[0], b: rk[1], g };
      if (!o.long || p.manches.length > o.long.v) o.long = { v: p.manches.length, g: p.emoji + " " + E(p.jeu), d: dfr(p.date) };
      if (p.manches.length >= 3) { const sg = lo ? -1 : 1, cum = p.joueurs.map(() => 0), win = rk[0].i;
        p.manches.forEach((m, r) => { m.forEach((x, i) => cum[i] += Number(x) || 0); const lead = Math.max(...cum.map(c => c * sg)), def = lead - cum[win] * sg;
          if (def > 0 && (!o.back || def > o.back.v)) o.back = { v: def, n: rk[0].nom, r: r + 1, tot: p.manches.length, g }; }); }
      const names = [...new Set(p.joueurs.map(nm))].sort(); for (let a = 0; a < names.length; a++) for (let b = a + 1; b < names.length; b++) { const k = names[a] + "|" + names[b]; pair[k] = (pair[k] || 0) + 1; }
      new Set(p.joueurs.map(nm)).forEach(n => { const s = st[n] || (st[n] = { cur: 0, best: 0 }); if (n === rk[0].nom) { s.cur++; s.best = Math.max(s.best, s.cur); } else s.cur = 0; }); });
    const bp = Object.entries(pair).sort((a, b) => b[1] - a[1])[0], bs = Object.entries(st).sort((a, b) => b[1].best - a[1].best)[0];
    return { n: ps.length, o, bp, bs };
  }
  PAGES.records = () => {
    const c = compute(), o = c.o;
    if (c.n < 1) return `${backPlus}<section class="card"><h1>🏆 Records et anecdotes</h1><p>Joue quelques parties : tes records apparaîtront ici.</p></section>`;
    const L = [];
    if (o.score) L.push(card("💥", "Plus gros score", o.score.v, E(o.score.n) + o.score.g));
    if (o.close) L.push(card("😱", "Partie la plus serrée", o.close.v ? "Écart de " + o.close.v : "Égalité parfaite", E(o.close.a.nom) + " " + o.close.a.total + " – " + E(o.close.b.nom) + " " + o.close.b.total + o.close.g));
    if (o.big && o.big.v > 0) L.push(card("🔨", "Plus grosse victoire", "Écart de " + o.big.v, E(o.big.a.nom) + " " + o.big.a.total + " – " + E(o.big.b.nom) + " " + o.big.b.total + o.big.g));
    if (o.back) L.push(card("🚀", "Plus grosse remontée", "−" + o.back.v + " puis victoire", E(o.back.n) + " était à " + o.back.v + " pts du leader (manche " + o.back.r + "/" + o.back.tot + ")" + o.back.g));
    if (c.bs && c.bs[1].best > 1) L.push(card("🔥", "Plus longue série de victoires", c.bs[1].best + " d'affilée", E(c.bs[0])));
    if (o.long) L.push(card("⏳", "Partie la plus longue", o.long.v + " manches", o.long.g + " · " + o.long.d));
    if (c.bp) { const [a, b] = c.bp[0].split("|"); L.push(card("🤝", "Duo le plus fidèle", c.bp[1] + " parties", E(a) + " et " + E(b))); }
    return `${backPlus}<section class="card"><h1>🏆 Records et anecdotes</h1><p>Calculés sur tes ${c.n} partie${c.n > 1 ? "s" : ""}. Les jeux où le plus petit score gagne ne comptent pas pour le « plus gros score ».</p></section><section class="card tools">${L.join("")}</section>`;
  };
  if (typeof NEED !== "undefined" && !NEED.includes("records")) NEED.push("records");
  const plus0 = PAGES.plus;
  PAGES.plus = function () { return plus0().replace("Mon activité</span><u>›</u></a>", "Mon activité</span><u>›</u></a><a href=\"#/records\"><i>🏆</i><span>Records et anecdotes</span><u>›</u></a>"); };
})();
