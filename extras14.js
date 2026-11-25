// ScoreMaster v2.8.0 : outils de soirée — équipes au hasard, tournoi à élimination directe, gages au hasard.
// Chargé après extras13.js. Rien n'est ajouté à tes parties : ce sont des outils pour la table.
(function () {
  "use strict";
  const E = Core.esc, R = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rd = (id, f) => { const el = document.getElementById(id); if (el) el.outerHTML = f(); };
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(15); FX.sfx("ok"); } catch (e) {} };
  const chip = (list, cur, a) => `<div class="chp">${list.map(x => `<button class="btn ${x == cur ? "on" : ""}" data-a="${a}" data-v="${x}">${x}</button>`).join("")}</div>`;

  const T = { names: null, nt: 2, teams: null, br: null, gage: null };
  try { const sv = JSON.parse(localStorage.getItem("sm_tournoi")); if (sv && Array.isArray(sv.br)) { T.br = sv.br; T.names = sv.names == null ? null : sv.names; } } catch (e) {}
  const save = () => { try { if (T.br) localStorage.setItem("sm_tournoi", JSON.stringify({ br: T.br, names: T.names })); else localStorage.removeItem("sm_tournoi"); } catch (e) {} };
  // prénoms de départ : la partie en cours, sinon la dernière partie jouée
  const start = () => {
    try {
      if (S.cur && S.cur.joueurs && S.cur.joueurs.length > 1) return S.cur.joueurs.join(", ");
      const h = (S.hist || []).filter(p => p && p.joueurs && p.joueurs.length > 1).slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      return h ? h.joueurs.join(", ") : "";
    } catch (e) { return ""; }
  };
  const names = () => { const el = document.getElementById("so-n"); const v = el ? el.value : (T.names == null ? start() : T.names); T.names = v;
    const seen = new Set(); return v.split(/[,;\n]/).map(s => s.trim()).filter(s => s && !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase())); };
  document.addEventListener("input", e => { if (e.target && e.target.id === "so-n") T.names = e.target.value; });

  // ---------- ÉQUIPES ----------
  const EQ = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"];
  const eqSec = () => `<section class="card tools" id="s-eq"><h2>👥 Équipes au hasard</h2>
    <p class="hint">Les joueurs sont mélangés puis répartis le plus équitablement possible.</p>
    <small>Nombre d'équipes</small>${chip([2, 3, 4, 5, 6], T.nt, "eqn")}
    ${T.teams ? T.teams.map((t, i) => `<div class="gp pop"><div><b>${EQ[i % 6]} Équipe ${i + 1}</b><small>${t.map(E).join(" · ")}</small></div></div>`).join("") : ""}
    <button class="btn main" data-a="eqt">🔀 Tirer les équipes</button></section>`;

  // ---------- TOURNOI (élimination directe) ----------
  function build(l) {
    const n = l.length; let s = 2; while (s < n) s *= 2;
    const p = s / 2, slots = new Array(s).fill(null), sh = shuffle(l);
    for (let i = 0; i < p; i++) slots[i * 2] = sh[i];            // 1 joueur par match d'abord…
    for (let i = 0; i < n - p; i++) slots[i * 2 + 1] = sh[p + i]; // …puis le 2e (les matchs restants = qualifiés d'office)
    const r0 = []; for (let i = 0; i < s; i += 2) r0.push({ a: slots[i], b: slots[i + 1], w: null });
    return [r0];
  }
  function sync() {
    const b = T.br; if (!b) return;
    for (let r = 0; r < b.length; r++) {
      b[r].forEach(m => { if (m.w == null) { if (m.a == null && m.b != null) m.w = m.b; else if (m.b == null && m.a != null) m.w = m.a; } });
      if (b[r].length > 1 && b[r].every(m => m.w != null) && !b[r + 1]) {
        const ws = b[r].map(m => m.w), nx = []; for (let i = 0; i < ws.length; i += 2) nx.push({ a: ws[i], b: ws[i + 1] == null ? null : ws[i + 1], w: null }); b.push(nx);
      }
    }
  }
  const lab = (len, r) => len === 1 ? "🏆 Finale" : len === 2 ? "Demi-finales" : len === 4 ? "Quarts de finale" : "Tour " + (r + 1);
  const trSec = () => {
    sync(); const b = T.br;
    const last = b && b[b.length - 1], champ = last && last.length === 1 && last[0].w;
    const body = !b ? "" : (champ ? `<p class="win pop">🏆 ${E(champ)} remporte le tournoi !</p>` : "")
      + b.map((rd0, r) => `<h3>${lab(rd0.length, r)}</h3>` + rd0.map((m, k) => (m.a == null || m.b == null)
        ? `<div class="gp"><div><b>${E(m.a || m.b)}</b><small>Qualifié d'office</small></div></div>`
        : `<div class="gp"><div><small>Match ${k + 1}</small><div class="row2"><button class="btn ${m.w === m.a ? "main" : ""}" data-a="trw" data-v="${r}:${k}:a">${m.w === m.a ? "✅ " : ""}${E(m.a)}</button><button class="btn ${m.w === m.b ? "main" : ""}" data-a="trw" data-v="${r}:${k}:b">${m.w === m.b ? "✅ " : ""}${E(m.b)}</button></div></div></div>`).join("")).join("");
    return `<section class="card tools" id="s-tr"><h2>🏆 Tournoi</h2>
      <p class="hint">Élimination directe : touche le vainqueur de chaque match. Si le nombre de joueurs n'est pas une puissance de 2, certains sont qualifiés d'office au premier tour.</p>
      ${body}<div class="row2"><button class="btn main" data-a="trn">${b ? "🔁 Nouveau tirage" : "🎯 Lancer le tournoi"}</button>${b ? `<button class="btn" data-a="trr">✖ Effacer</button>` : ""}</div></section>`;
  };

  // ---------- GAGES ----------
  const GAGES = ["Fais ton meilleur cri de poule.", "Raconte ta pire honte en 30 secondes.", "Parle avec l'accent du Sud jusqu'à la fin du tour.", "Fais 10 pompes (ou 10 squats).", "Imite un autre joueur : les autres doivent deviner qui.",
    "Chante le refrain de la chanson de ton choix.", "Garde un petit objet sur la tête jusqu'à ton prochain tour.", "Fais rire quelqu'un sans lui parler (mimes uniquement).", "Appelle quelqu'un et dis-lui « je t'aime bien » sans rien ajouter.", "Offre un compliment sincère à chaque joueur.",
    "Échange ta place avec le joueur de ton choix pour le reste de la partie.", "Fais le tour de la table en marchant comme un canard.", "Tu ne peux plus dire « oui » ni « non » pendant 3 tours.", "Prépare une boisson (ou un snack) pour le joueur de ton choix.", "Danse 20 secondes sans musique.",
    "Parle en rimes jusqu'à ton prochain tour.", "Fais ta meilleure imitation d'un animal choisi par les autres.", "Dis l'alphabet à l'envers (au moins jusqu'à M).", "Laisse le joueur à ta droite choisir ton prochain coup de pioche ou de lancer.", "Fais un selfie avec la grimace choisie par le groupe.",
    "Ferme les yeux et dessine un portrait d'un autre joueur.", "Cite 5 films avec un même acteur en 15 secondes.", "Chuchote tout ce que tu dis pendant 3 tours.", "Raconte une blague (si personne ne rit, rejoue un gage).", "Fais un discours de victoire de 20 secondes… même si tu as perdu."];
  const ggSec = () => `<section class="card tools" id="s-gg"><h2>🍻 Gage au hasard</h2>
    <p class="hint">Pour le perdant de la partie (ou n'importe qui). Pour suivre les dettes, va dans <a href="#/gages">Gages et dettes</a>.</p>
    ${T.gage ? `<div class="pick pop"><span class="em">🎭</span><div><small>${E(T.gage[0])}</small><b>${E(T.gage[1])}</b></div></div>` : ""}
    <button class="btn main" data-a="ggt">🎭 Piocher un gage</button></section>`;

  PAGES.soireeoutils = () => `${backPlus}<section class="card tools"><h1>🎉 Outils de soirée</h1>
    <p>Écris les prénoms (séparés par des virgules) : ils servent aux équipes, au tournoi et aux gages. Rien ici n'est ajouté à tes parties.</p>
    <input id="so-n" value="${E(T.names == null ? (T.names = start()) : T.names)}" placeholder="Marc, Léa, Sam, Inès…" aria-label="Joueurs séparés par des virgules"></section>${eqSec()}${trSec()}${ggSec()}`;
  if (typeof NEED !== "undefined" && !NEED.includes("soireeoutils")) NEED.push("soireeoutils");

  Object.assign(ACTIONS, {
    eqn: v => { T.nt = +v; rd("s-eq", eqSec); },
    eqt: () => { const l = names(); if (l.length < T.nt) return FX.toast("Il faut au moins " + T.nt + " prénoms"); const t = Array.from({ length: T.nt }, () => []);
      shuffle(l).forEach((n, i) => t[i % T.nt].push(n)); T.teams = t; buzz(); rd("s-eq", eqSec); },
    trn: () => { const l = names(); if (l.length < 3) return FX.toast("Il faut au moins 3 prénoms pour un tournoi"); if (l.length > 32) return FX.toast("32 joueurs maximum"); T.br = build(l); save(); buzz(); rd("s-tr", trSec); },
    trw: v => { const [r, k, side] = v.split(":"), m = T.br && T.br[+r] && T.br[+r][+k]; if (!m) return;
      const w = side === "a" ? m.a : m.b; if (m.w === w) return; m.w = w; T.br.length = +r + 1; sync(); save(); buzz(); rd("s-tr", trSec); },
    trr: () => { T.br = null; save(); rd("s-tr", trSec); },
    ggt: () => { const l = names(), who = l.length ? l[R(l.length)] : "Le perdant"; T.gage = [who, GAGES[R(GAGES.length)]]; buzz(); rd("s-gg", ggSec); }
  });

  // ---------- v2.8.5 : branchement des comptes (Supabase) depuis l'appli ----------
  // config.js vide = comptes désactivés (et chaque mise à jour des fichiers l'efface). On peut maintenant saisir l'URL et la clé
  // dans Plus > Mon compte : elles sont gardées sur le téléphone (localStorage) et survivent aux mises à jour.
  const CK = "sm_cloud_cfg";
  const savedCfg = () => { try { const c = JSON.parse(localStorage.getItem(CK)); return c && c.url && c.key ? c : null; } catch (e) { return null; } };
  if (typeof Cloud !== "undefined") {
    const baseCfg = Cloud.cfg.bind(Cloud);
    Cloud.cfg = () => baseCfg() || (() => { const c = savedCfg(); return c ? { url: String(c.url).replace(/\/+$/, ""), key: c.key } : null; })();
    const baseCompte = PAGES.compte;
    PAGES.compte = function () {
      const h = baseCompte.apply(this, arguments);
      if (!Cloud.enabled()) return `${backPlus}<section class="card"><h1>👥 Comptes joueurs</h1>
        <p>Les comptes ne sont pas encore branchés. Colle ici l'adresse du projet et la clé « anon / publishable » de ton projet Supabase (voir LISEZ-MOI-COMPTES.txt). Elles restent sur ce téléphone.</p>
        <label for="cl-url">Adresse du projet (Project URL)</label><input id="cl-url" placeholder="https://xxxx.supabase.co" autocapitalize="off" autocomplete="off">
        <label for="cl-key">Clé anon / publishable</label><input id="cl-key" placeholder="eyJ… ou sb_publishable_…" autocapitalize="off" autocomplete="off">
        <button class="btn main" data-a="clsave">🔌 Brancher les comptes</button>
        <small>Ne colle jamais la clé « service_role » ou « secret ».</small></section>`;
      return h + (savedCfg() && !baseCfg() ? `<section class="card"><small>Comptes branchés depuis cette appli (${E(savedCfg().url)}).</small><button class="btn" data-a="clclear">🔌 Débrancher</button></section>` : "");
    };
    Object.assign(ACTIONS, {
      clsave: () => {
        const u = ((document.getElementById("cl-url") || {}).value || "").trim(), k = ((document.getElementById("cl-key") || {}).value || "").trim();
        if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(u)) return FX.toast("L'adresse doit ressembler à https://xxxx.supabase.co");
        let role = ""; try { role = JSON.parse(atob(k.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role; } catch (e) {}
        if (/^sb_secret_/i.test(k) || role === "service_role") return FX.toast("Cette clé est secrète : utilise la clé anon / publishable");
        if (k.length < 20) return FX.toast("Clé trop courte : copie la clé anon / publishable en entier");
        try { localStorage.setItem(CK, JSON.stringify({ url: u, key: k })); } catch (e) { return FX.toast("Impossible d'enregistrer sur ce téléphone"); }
        location.reload();
      },
      clclear: () => { try { localStorage.removeItem(CK); } catch (e) {} location.reload(); }
    });
  }
})();
