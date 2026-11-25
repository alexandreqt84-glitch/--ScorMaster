// ScoreMaster — extras : feuilles de score par catégorie, « compléter à 162 », donneur, minuteur, mode TV,
// jeux coopératifs, équipes avec leurs joueurs, niveau Elo par jeu, bilan de l'année.
// Chargé après app.js : il enveloppe les pages existantes sans les réécrire.
(function () {
  "use strict";
  const E = Core.esc, $q = s => document.querySelector(s);

  // ---------- feuilles de score : [libellé, multiplicateur] (le total de chaque ligne = valeur saisie × multiplicateur) ----------
  const FEUILLE = {
    "7 Wonders": [["Militaire", 1], ["Pièces (1 pt pour 3)", 1 / 3], ["Merveille", 1], ["Bâtiments civils", 1], ["Commerce", 1], ["Guildes", 1], ["Science", 1]],
    "7 Wonders Duel": [["Bâtiments", 1], ["Merveilles", 1], ["Jetons progrès", 1], ["Pièces (1 pt pour 3)", 1 / 3], ["Militaire", 1]],
    "Wingspan": [["Oiseaux", 1], ["Bonus", 1], ["Objectifs de manche", 1], ["Œufs", 1], ["Nourriture stockée", 1], ["Cartes sous les oiseaux", 1]],
    "Catan": [["Colonies (nombre)", 1], ["Villes (nombre, 2 pts)", 2], ["Route la plus longue (1 si oui)", 2], ["Plus grande armée (1 si oui)", 2], ["Cartes point de victoire", 1]],
    "Carcassonne": [["Routes", 1], ["Villes", 1], ["Monastères", 1], ["Champs", 1], ["Bonus", 1]],
    "Azul": [["Points de placement", 1], ["Lignes complètes (2 pts)", 2], ["Colonnes complètes (7 pts)", 7], ["Couleurs complètes (10 pts)", 10], ["Pénalités (points perdus)", -1]],
    "Cascadia": [["Faune", 1], ["Habitats", 1], ["Bonus de majorité", 1], ["Jetons nature", 1]],
    "Patchwork": [["Boutons", 1], ["Cases vides (−2 chacune)", -2], ["Bonus 7×7 (1 si oui)", 7]],
    "Les Quacks de Quedlinburg": [["Points de victoire", 1], ["Rubis (1 pt chacun)", 1]],
    "Sagrada": [["Objectifs publics", 1], ["Objectif privé", 1], ["Jetons faveur restants", 1], ["Cases vides (−1 chacune)", -1]],
    "Les Aventuriers du Rail": [["Routes posées", 1], ["Billets réussis", 1], ["Billets ratés (points perdus)", -1], ["Plus long chemin (1 si oui)", 10]],
    "Kingdomino": [["Domaines (cases × couronnes)", 1], ["Château au centre (1 si oui)", 10], ["Royaume complet (1 si oui)", 5]]
  };
  const COMPL = { "Belote": 162, "Coinche": 162 };           // total de points de cartes d'une donne (sans belote-rebelote ni capot)
  const fmt = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  const medals = k => ["🥇", "🥈", "🥉"][k] || (k + 1) + ".";
  const gameOf = p => (typeof ALL !== "undefined" && ALL.find(g => g.id === p.gid || g.name === p.jeu)) || null;
  const sheetTotal = () => [...document.querySelectorAll(".fc")].reduce((s, i) => s + Math.trunc((Number(i.value) || 0) * Number(i.dataset.m)), 0);
  S.mb = S.mb || [];

  // ---------- création : joueurs de chaque équipe ----------
  const setup0 = setupHtml;
  setupHtml = function () {
    let h = setup0(); const g = S.pick;
    if (!g || !g.teams || g.solo || S.np < 2) return h;
    const box = `<div class="alert">👥 <b>Facultatif</b> : écris les joueurs de chaque équipe (séparés par une virgule) pour que les stats et la gloire reviennent à chacun.</div>` +
      Array.from({ length: S.np }, (_, i) => `<input class="mb" placeholder="Joueurs de l'équipe ${i + 1} (ex. Marc, Léa)" value="${E(S.mb[i] || "")}">`).join("");
    const k = h.indexOf('<datalist id="known">'); return k < 0 ? h : h.slice(0, k) + box + h.slice(k);
  };
  const create0 = ACTIONS.create;
  ACTIONS.create = function (...a) {
    const mb = [...document.querySelectorAll(".mb")].map(i => i.value), before = S.cur && S.cur.id;
    create0.apply(this, a);
    if (S.cur && S.cur.id !== before) {
      if (mb.some(v => v.trim())) { S.cur.membres = mb.map(v => v.split(/\s*(?:,|&|\+|\/|;|\bet\b)\s*/).map(s => s.trim()).filter(Boolean)); save(); }
      S.mb = [];
    }
  };

  // ---------- page de partie ----------
  const partie0 = PAGES.partie;
  PAGES.partie = function () {
    let h = partie0(); const p = S.cur; if (!p) return h;
    const g = gameOf(p), info = [];
    if (p.coop) info.push(`<p class="alert">🤝 <b>Jeu coopératif</b> : toute l'équipe gagne ou perd ensemble. On te demandera le résultat en terminant la partie.</p>`);
    if (p.membres) info.push(`<p class="alert">👥 ${p.joueurs.map((t, i) => `<b>${E(t)}</b> : ${E((p.membres[i] || []).join(", ") || "—")}`).join(" · ")}</p>`);
    if (p.mode === "cartes" && !p.coop && !(g && g.teams) && p.joueurs.length > 1) {
      const n = p.joueurs.length, d = p.manches.length % n;
      info.push(`<p class="alert">🃏 Donneur : <b>${E(p.joueurs[d])}</b> · joue en premier : <b>${E(p.joueurs[(d + 1) % n])}</b></p>`);
    }
    if (info.length) h = h.replace("</section>", info.join("") + "</section>");
    const f = FEUILLE[p.jeu];
    if (f) {
      const sheet = `<details class="card sheet"><summary>🧮 Calculer le score d'une manche</summary>
        <label for="fj">Pour</label><select id="fj">${p.joueurs.map((n, i) => `<option value="${i}">${E(n)}</option>`).join("")}</select>
        ${f.map(([l, m]) => `<div class="line"><label>${E(l)}</label><input class="fc" type="number" inputmode="numeric" data-m="${m}" placeholder="0"></div>`).join("")}
        <div class="row"><span>Total</span><b id="ft">0</b></div><button class="btn" data-a="fsheet">↗️ Mettre ce total dans la saisie</button></details>`;
      h = h.replace(/<section class="card"><h2>(➕ Nouvelle manche|✏️ Modifier)/, m => sheet + m);
    }
    if (COMPL[p.jeu] && p.joueurs.length === 2) h = h.replace('<button class="btn main" data-a="add">', `<button class="btn" data-a="compl">↔️ L'autre équipe = ${COMPL[p.jeu]} − points saisis</button><button class="btn main" data-a="add">`);
    const tools = `<section class="card"><h2>🧰 Outils</h2><div class="pills">${[30, 60, 120, 300].map(v => `<button data-a="tmr" data-v="${v}">⏱️ ${fmt(v)}</button>`).join("")}<button data-a="tmr" data-v="0">⏹️</button></div>
      <div class="row"><span id="tmv">${S.tm ? "⏳ " + fmt(Math.max(0, Math.ceil((S.tm.end - Date.now()) / 1000))) : "Minuteur arrêté"}</span></div>
      <a class="btn" href="#/tv">📺 Mode TV (gros scores)</a></section>`;
    return h.replace('<section class="card"><button class="btn main" data-a="end">', tools + '<section class="card"><button class="btn main" data-a="end">');
  };
  Object.assign(ACTIONS, {
    fsheet: () => {
      const i = Number($q("#fj").value), inp = document.querySelectorAll(".sc")[i]; if (!inp) return;
      inp.value = sheetTotal(); inp.dispatchEvent(new Event("input", { bubbles: true }));
      document.querySelectorAll(".fc").forEach(x => { x.value = ""; }); $q("#ft").textContent = "0";
      FX.toast("↗️ Total mis pour " + S.cur.joueurs[i]); inp.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    compl: () => {
      const N = COMPL[S.cur.jeu], inp = [...document.querySelectorAll(".sc")]; if (inp.length !== 2) return;
      let i = S.focus; if (!inp[i] || inp[i].value === "") i = inp.findIndex(x => x.value !== "");
      if (i < 0) return FX.toast("Saisis d'abord les points d'une équipe");
      const o = 1 - i; inp[o].value = Math.max(0, N - (Number(inp[i].value) || 0)); inp[o].dispatchEvent(new Event("input", { bubbles: true }));
      FX.toast("↔️ " + S.cur.joueurs[o] + " = " + inp[o].value);
    },
    tmr: v => { v = Number(v); S.tm = v ? { end: Date.now() + v * 1000 } : null; const el = $q("#tmv"); if (!v && el) el.textContent = "Minuteur arrêté"; tick(); FX.sfx("ok"); },
    by: v => { location.hash = "#/bilan/" + v; },
    sharebilan: async () => {
      const t = S.bilanTxt || ""; if (!t) return;
      try { if (navigator.share) await navigator.share({ text: t }); else { await navigator.clipboard.writeText(t); FX.toast("📋 Bilan copié"); } } catch (e) {}
    }
  });
  document.addEventListener("input", e => {
    if (e.target.classList.contains("fc")) { const t = $q("#ft"); if (t) t.textContent = sheetTotal(); }
    if (e.target.classList.contains("mb")) S.mb = [...document.querySelectorAll(".mb")].map(i => i.value);
  });
  function tick() {
    const el = $q("#tmv");
    if (!S.tm) return;
    const r = Math.ceil((S.tm.end - Date.now()) / 1000);
    if (r > 0) { if (el) el.textContent = "⏳ " + fmt(r); return; }
    S.tm = null; if (el) el.textContent = "⏰ Temps écoulé !";
    FX.toast("⏰ Temps écoulé !"); FX.sfx("win"); try { if (Core.opt("haptic") && navigator.vibrate) navigator.vibrate([300, 120, 300]); } catch (e) {}
  }
  setInterval(tick, 500);

  // ---------- mode TV ----------
  PAGES.tv = function () {
    const p = S.cur; if (!p) return `${back}<section class="card empty"><p>Aucune partie en cours.</p></section>`;
    const r = Core.ranking(p);
    return `<section class="card tv"><a class="back" href="#/partie">← Retour à la partie</a><h1>${p.emoji} ${E(p.jeu)}</h1>
      <p>Manche ${p.manches.length}${p.target ? " · objectif " + p.target + " pts" : ""}${p.low ? " · le plus petit gagne" : ""}</p>
      ${r.map((x, k) => `<div class="tvrow ${k === 0 && p.manches.length ? "first" : ""}"><span>${medals(k)}</span><b>${E(x.nom)}</b><em>${x.total}</em></div>`).join("")}</section>`;
  };

  // ---------- fin de partie coopérative ----------
  const fin0 = PAGES.fin;
  PAGES.fin = function () {
    const h = fin0(), p = S.last; if (!p || !p.coop || p.victoire === undefined) return h;
    return h.replace(/<div class="trophy">🏆<\/div><h1 style="text-align:center">[^<]*<\/h1>\s*<p style="text-align:center">gagne à/,
      `<div class="trophy">${p.victoire ? "🏆" : "💔"}</div><h1 style="text-align:center">${p.victoire ? "Victoire de l'équipe !" : "Défaite… on retente ?"}</h1><p style="text-align:center">${p.victoire ? "réussie à" : "à"}`);
  };

  // ---------- niveau Elo sur la page d'un jeu ----------
  const jeu0 = PAGES.jeu;
  PAGES.jeu = function () {
    let h = jeu0();
    try {
      const g = findGame(decodeURIComponent(location.hash.slice(2).split("/")[1] || "")); if (!g) return h;
      const gc = Cloud.active() ? Cloud.gc[g.name] : null, seen = new Set();
      const el = Core.elo([...(gc ? gc.parties : []), ...S.hist].filter(p => p.fini && p.jeu === g.name && !seen.has(p.id) && seen.add(p.id))).filter(x => x.n > 0);
      if (el.length < 2) return h;
      const box = `<section class="card"><h2>📈 Niveau (Elo)</h2><small>Départ à 1000 : battre un joueur mieux classé rapporte davantage. Les jeux coopératifs sont ignorés.</small>
        <div class="list">${el.slice(0, 8).map((x, k) => `<div class="row"><span>${medals(k)} ${plink(x.nom)} <small>${x.n} parties</small></span><b>${x.elo}</b></div>`).join("")}</div></section>`;
      const mark = '<section class="card"><h2>🏆 Records</h2>', k = h.indexOf(mark);
      return k < 0 ? h + box : h.slice(0, k) + box + h.slice(k);
    } catch (e) { return h; }
  };

  // ---------- menu Plus + bilan de l'année ----------
  const plus0 = PAGES.plus;
  PAGES.plus = function () { return plus0().replace('<span>Succès</span><u>›</u></a>', '<span>Succès</span><u>›</u></a><a href="#/bilan"><i>🎁</i><span>Bilan de l\'année</span><u>›</u></a>'); };
  if (typeof NEED !== "undefined" && !NEED.includes("bilan")) NEED.push("bilan");

  PAGES.bilan = function () {
    const me = Core.me();
    if (!me.nom) return `${backPlus}<section class="card empty"><h1>🎁 Bilan de l'année</h1><p>Crée ton profil pour voir ton bilan.</p><a class="btn main" href="#/profil">👤 Mon profil</a></section>`;
    const done = S.hist.filter(p => p.fini), cur = new Date().getFullYear();
    const years = [...new Set(done.map(p => new Date(p.date).getFullYear()).concat(cur))].sort((a, b) => b - a);
    const y = Number(location.hash.split("/")[2]) || cur;
    const chips = `<div class="pills">${years.map(v => `<button data-a="by" data-v="${v}" class="${v === y ? "on" : ""}">${v}</button>`).join("")}</div>`;
    const parts = done.filter(p => new Date(p.date).getFullYear() === y), mine = Core.profil(parts, me.nom).mine;
    if (!mine.length) return `${backPlus}<section class="card"><h1>🎁 Ton année ${y}</h1>${chips}<p class="empty">Aucune partie jouée en ${y}.</p></section>`;
    const st = Core.stats(parts).find(s => Core.norm(s.nom) === Core.norm(me.nom)) || {};
    const cnt = (a, f) => a.reduce((o, x) => { const k = f(x); if (k !== undefined && k !== null) o[k] = (o[k] || 0) + 1; return o; }, {});
    const top = o => Object.entries(o).sort((a, b) => b[1] - a[1])[0] || null;
    const V = mine.filter(g => g.res === "V").length, D = mine.filter(g => g.res === "D").length, Eg = mine.filter(g => g.res === "E").length, multi = V + D + Eg;
    const fav = top(cnt(mine, g => g.jeu)), win = top(cnt(mine.filter(g => g.res === "V"), g => g.jeu));
    const mois = top(cnt(mine, g => new Date(g.date).getMonth())), jour = top(cnt(mine, g => new Date(g.date).getDay()));
    const rival = top(cnt(mine.flatMap(g => g.adv.map(n => ({ n }))), x => x.n.trim()));
    const big = mine.filter(g => g.res === "V").sort((a, b) => b.marge - a.marge)[0];
    const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"], JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const row = (e, l, v) => v ? `<div class="row"><span>${e} ${l}</span><b>${v}</b></div>` : "";
    S.bilanTxt = `🎁 Mon année ${y} sur ScoreMaster : ${mine.length} parties, ${V} victoires${fav ? ", jeu fétiche : " + fav[0] : ""}${st.meilleureSerie > 1 ? ", meilleure série : " + st.meilleureSerie : ""} !`;
    return `${backPlus}<section class="card hero"><h1>🎁 Ton année ${y}</h1>${chips}
      <div class="kpis"><div><b>${mine.length}</b><small>parties</small></div><div><b>${V}</b><small>victoires</small></div><div><b>${multi ? Math.round(100 * V / multi) + "%" : "—"}</b><small>réussite</small></div></div></section>
      <section class="card"><h2>🏅 Tes temps forts</h2>
        ${row("🎲", "Jeu fétiche", fav && E(fav[0]) + " · " + fav[1] + "×")}${row("🥇", "Tu gagnes surtout à", win && E(win[0]) + " · " + win[1] + " V")}
        ${row("📅", "Mois le plus actif", mois && MOIS[mois[0]])}${row("🗓️", "Jour préféré", jour && JOURS[jour[0]])}
        ${row("🧩", "Jeux différents", Object.keys(cnt(mine, g => g.jeu)).length)}${row("🔥", "Meilleure série de victoires", st.meilleureSerie > 1 ? st.meilleureSerie : "")}
        ${row("💥", "Plus large victoire", big && big.marge ? "+" + big.marge + " à " + E(big.jeu) : "")}${row("⭐", "Gloire gagnée", st.pg)}</section>
      <section class="card"><h2>🤝 Tes adversaires</h2>
        ${row("🎯", "Joueur le plus affronté", rival && plink(rival[0]) + " · " + rival[1] + "×")}${row("😎", "Tu l'as le plus battu", st.victime && plink(st.victime.nom) + " · " + st.victime.n)}
        ${row("😤", "Il t'a le plus battu", st.nemesis && plink(st.nemesis.nom) + " · " + st.nemesis.n)}</section>
      <section class="card"><button class="btn main" data-a="sharebilan">📤 Partager mon bilan</button></section>`;
  };

  draw();   // app.js a déjà dessiné la première page : on la redessine avec ces ajouts
})();
