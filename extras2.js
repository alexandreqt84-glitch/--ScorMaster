// ScoreMaster v1.5.1 : boîte à outils de jeu (dés, pile ou face, qui commence ?, compteur de vie). Chargé après extras.js.
// Chaque outil ne redessine que sa propre carte (pas de flash, la page ne saute plus).
(function () {
  "use strict";
  const E = Core.esc, $q = s => document.querySelector(s), R = n => Math.floor(Math.random() * n);
  const T = { n: 1, f: 6, dice: null, coin: null, start: 20, pv: [20, 20], pn: ["Joueur 1", "Joueur 2"], hist: [], last: [], names: "", order: null };
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(15); FX.sfx("ok"); } catch (e) {} };
  const chp = (list, cur, a) => `<div class="chp">${list.map(x => `<button class="btn ${x == cur ? "on" : ""}" data-a="${a}" data-v="${x}">${x}</button>`).join("")}</div>`;
  const steps = () => T.start >= 1000 ? [100, 500, 1000] : [1, 5, 10];
  const pvCard = (v, i) => { const s = steps(), d = T.last[i];
    return `<div class="pvp ${v <= 0 ? "ko" : ""}"><input class="pvname" data-i="${i}" value="${E(T.pn[i])}" maxlength="14" aria-label="Nom du joueur ${i + 1}"><b>${v}</b>
      <span class="dl ${d > 0 ? "up" : "dn"}">${d ? (d > 0 ? "+" : "") + d : "\u00a0"}</span>${v <= 0 ? "<em>💀 K.O.</em>" : ""}
      <div class="pvb">${s.slice().reverse().map(x => `<button class="btn m" data-a="pv" data-v="${i}:${-x}">−${x}</button>`).join("")}${s.map(x => `<button class="btn p" data-a="pv" data-v="${i}:${x}">+${x}</button>`).join("")}</div></div>`; };
  const SEC = {
    de: () => { const t = T.dice ? T.dice.reduce((a, b) => a + b, 0) : 0;
      return `<section class="card tools" id="s-de"><h2>🎲 Dés</h2><p class="hint">Choisis le nombre de dés, puis leurs faces (6 = dé classique, 20 = jeux de rôle), et lance.</p>
        <small>Nombre de dés</small>${chp([1, 2, 3, 4, 5, 6], T.n, "dn")}<small>Faces par dé</small>${chp([4, 6, 8, 10, 12, 20], T.f, "df")}
        <div class="dice">${(T.dice || []).map(v => `<span class="die pop">${v}</span>`).join("")}</div>${T.dice && T.dice.length > 1 ? `<p class="dtot">Total : <b>${t}</b></p>` : ""}
        <button class="btn main" data-a="roll">🎲 Lancer ${T.n} d${T.f}</button></section>`; },
    coin: () => `<section class="card tools" id="s-coin"><h2>🪙 Pile ou face</h2><p class="hint">Pour départager une égalité ou décider rapidement.</p>${T.coin ? `<div class="coin pop">${T.coin === "PILE" ? "🪙" : "🦅"}<b>${T.coin}</b></div>` : ""}<button class="btn main" data-a="flip">🪙 Lancer la pièce</button></section>`,
    tir: () => { const nm = T.names || ((S.cur && S.cur.joueurs) ? S.cur.joueurs.join(", ") : "");
      return `<section class="card tools" id="s-tir"><h2>🎯 Qui commence ?</h2><p class="hint">Écris les prénoms séparés par des virgules : l'appli mélange et donne l'ordre de jeu. Le premier a la 👑.</p>
        <input id="qn" value="${E(nm)}" placeholder="Marc, Léa, Sam…" aria-label="Joueurs séparés par des virgules">${T.order ? `<ol class="ord">${T.order.map((n, i) => `<li class="pop">${i === 0 ? "👑 " : ""}${E(n)}</li>`).join("")}</ol>` : ""}
        <button class="btn main" data-a="draw2">🔀 Tirer l'ordre de jeu</button></section>`; },
    pv: () => { const alive = T.pv.filter(v => v > 0).length, w = T.pv.length > 1 && alive === 1 ? T.pv.findIndex(v => v > 0) : -1;
      return `<section class="card tools" id="s-pv"><h2>❤️ Compteur de vie (PV)</h2>
        <p class="hint">Les PV (points de vie) servent aux jeux de duel (Magic, Yu-Gi-Oh, Pokémon…) : chacun part d'un total et le dernier encore au-dessus de 0 gagne.</p>
        <ol class="how"><li>Choisis le départ et le nombre de joueurs.</li><li>Touche les prénoms pour les modifier.</li><li>Appuie sur − ou + pour retirer ou ajouter de la vie. ↩️ annule le dernier geste.</li></ol>
        <small>Points de départ</small>${chp([20, 40, 100, 8000], T.start, "pvs")}<div class="cust"><input id="pvc" type="number" inputmode="numeric" placeholder="Autre départ…" aria-label="Autre départ"><button class="btn" data-a="pvc">OK</button></div>
        <small>Joueurs</small>${chp([2, 3, 4], T.pv.length, "pvn")}
        ${w >= 0 ? `<p class="win pop">🏆 ${E(T.pn[w])} gagne !</p>` : ""}<div class="pvs">${T.pv.map(pvCard).join("")}</div>
        <div class="row2"><button class="btn" data-a="pvu" ${T.hist.length ? "" : "disabled"}>↩️ Annuler</button><button class="btn" data-a="pvr">↺ Tout remettre à ${T.start}</button></div></section>`; }
  };
  const upd = k => { const el = document.getElementById("s-" + k); if (el) el.outerHTML = SEC[k](); };
  const names = n => { while (T.pn.length < n) T.pn.push("Joueur " + (T.pn.length + 1)); T.pn.length = n; };
  PAGES.outils = () => `${backPlus}<section class="card tools"><h1>🧰 Outils de jeu</h1><p>Quatre outils pour la table, sans quitter l'appli : dés, pile ou face, ordre de jeu et compteur de vie. Rien ici n'est ajouté à tes parties.</p></section>${SEC.de()}${SEC.coin()}${SEC.tir()}${SEC.pv()}`;
  if (typeof NEED !== "undefined" && !NEED.includes("outils")) NEED.push("outils");
  document.addEventListener("input", e => { const t = e.target; if (t.classList && t.classList.contains("pvname")) T.pn[+t.dataset.i] = t.value; });
  const reset = n => { T.pv = Array.from({ length: n || T.pv.length }, () => T.start); T.hist = []; T.last = []; names(T.pv.length); upd("pv"); };
  Object.assign(ACTIONS, {
    dn: v => { T.n = +v; upd("de"); }, df: v => { T.f = +v; upd("de"); },
    roll: () => { T.dice = Array.from({ length: T.n }, () => 1 + R(T.f)); buzz(); upd("de"); },
    flip: () => { T.coin = R(2) ? "PILE" : "FACE"; buzz(); upd("coin"); },
    draw2: () => { const l = ($q("#qn").value || "").split(",").map(s => s.trim()).filter(Boolean); T.names = l.join(", ");
      if (l.length < 2) return FX.toast("Écris au moins 2 prénoms, séparés par des virgules");
      for (let i = l.length - 1; i > 0; i--) { const j = R(i + 1); [l[i], l[j]] = [l[j], l[i]]; } T.order = l; buzz(); upd("tir"); },
    pvs: v => { T.start = +v; reset(); }, pvn: v => reset(+v),
    pvc: () => { const n = Math.round(Number($q("#pvc").value)); if (!(n > 0 && n < 1e6)) return FX.toast("Écris un nombre entre 1 et 999999"); T.start = n; reset(); },
    pv: v => { const [i, d] = v.split(":").map(Number); T.pv[i] += d; T.hist.push([i, d]); T.last[i] = d; buzz(); upd("pv"); },
    pvu: () => { const h = T.hist.pop(); if (!h) return; T.pv[h[0]] -= h[1]; T.last[h[0]] = 0; upd("pv"); }, pvr: () => reset()
  });
  const plus0 = PAGES.plus, home0 = PAGES[""];
  PAGES.plus = function () { return plus0().replace("Bilan de l'année</span><u>›</u></a>", "Bilan de l'année</span><u>›</u></a><a href=\"#/outils\"><i>🧰</i><span>Outils de jeu</span><u>›</u></a>"); };
  PAGES[""] = function () { return home0.apply(this, arguments) + `<section class="card tile wide"><a class="btn" href="#/outils">🧰 Outils : dés · pile ou face · qui commence · vie</a></section>`; };
})();
