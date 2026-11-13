// Jeux jouables dans l'appli — partie 2 : dés, quiz et jeux de groupe (téléphone qu'on se passe)
const nrm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
// Mini-moteur d'écrans : ACT (actions data-act), V (afficher), pick (choisir des joueurs), wait (écran « fais semblant » avec délai)
function engine(c) {
  const ACT = {}, V = h => { c.box.innerHTML = h; }; let cur = null;
  c.box.onclick = e => { const b = e.target.closest("[data-act]"); if (b && !b.disabled && ACT[b.dataset.act]) ACT[b.dataset.act](b.dataset.v, b); };
  const choose = o => {
    cur = { ...o, sel: [] };
    cur.r = () => V(`${o.head}<div class="picker2">${o.opts.map(i => `<button class="choice ${cur.sel.includes(i) ? "on" : ""}" data-act="sel" data-v="${i}"><span>${E(c.players[i])}</span></button>`).join("")}</div>
      <button class="btn main" data-act="ok" ${cur.sel.length === o.need ? "" : "disabled"}>${o.okLabel || "Valider"}</button>${o.extra || ""}`);
    cur.r();
  };
  ACT.sel = v => { v = Number(v); const s = cur.sel, k = s.indexOf(v); if (k >= 0) s.splice(k, 1); else { if (s.length >= cur.need) s.shift(); s.push(v); } cur.r(); };
  ACT.ok = () => cur.ok(cur.sel);
  const wait = (html, label, fn) => {
    V(`${html}<button class="btn main" id="wbtn" disabled data-act="w">${label}</button>`); ACT.w = fn;
    later(c, () => { const b = $("#wbtn"); if (b) b.disabled = false; }, 2000 + rnd(3000));
  };
  return { ACT, V, choose, wait };
}

// ---------------- Yams ----------------
G({ id: "yams", name: "Yams", emoji: "🎲", cat: "Dés", min: 1, max: 6, dp: 2,
  rules: ["But du jeu : remplir toutes les catégories de la feuille avec 5 dés. Chaque tour : jusqu'à 3 lancers (réglable), tu gardes les dés de ton choix (touche un dé pour le garder).", "Après ton dernier lancer, choisis une catégorie : le score s'inscrit. Si rien ne convient, choisis une catégorie à 0 (elle est barrée).",
    "Variantes : Classique (Yahtzee, 13 catégories) ou Yatzy scandinave (15 catégories : paires, suites 15/20, bonus 50) ; 2 à 5 lancers ; ordre imposé (on remplit dans l'ordre) ; annonce (tu annonces la catégorie avant de lancer : points ×2 si réussie, sinon 0) ; Yams bonus +100 (Classique)."],
  scoring: ["As à Six : somme des dés du chiffre. Bonus si le haut atteint 63 (+35 en Classique, +50 en Yatzy).", "Classique : Brelan/Carré = somme des dés, Full 25, petite suite 30, grande suite 40, Yams 50, Chance = somme. Yatzy : Paire, Deux paires, Brelan, Carré = somme des dés concernés, suites 15/20, Full = somme, Yatzy 50."], winner: ["Quand toutes les catégories sont remplies, le plus haut total gagne."] }, c => {
  const cnt = d => [1, 2, 3, 4, 5, 6].map(v => d.filter(x => x === v).length), sum = d => d.reduce((a, b) => a + b, 0);
  const has = (d, l) => l.some(x => x.every(v => d.includes(v))), best = (d, k) => { const q = cnt(d); for (let v = 6; v >= 1; v--) if (q[v - 1] >= k) return v; return 0; };
  const up = ["As", "Deux", "Trois", "Quatre", "Cinq", "Six"].map((n, i) => ({ n, f: d => cnt(d)[i] * (i + 1) }));
  const MODES = {
    classique: { name: "Classique (Yahtzee)", sub: "13 catégories · bonus +35", bonus: 35, cats: [...up,
      { n: "Brelan", f: d => cnt(d).some(x => x >= 3) ? sum(d) : 0 }, { n: "Carré", f: d => cnt(d).some(x => x >= 4) ? sum(d) : 0 },
      { n: "Full (25)", j: 25, f: d => { const k = cnt(d); return k.includes(3) && k.includes(2) ? 25 : 0; } },
      { n: "Petite suite (30)", j: 30, f: d => has(d, [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]]) ? 30 : 0 },
      { n: "Grande suite (40)", j: 40, f: d => has(d, [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]]) ? 40 : 0 },
      { n: "Yams (50)", f: d => cnt(d).includes(5) ? 50 : 0 }, { n: "Chance", f: d => sum(d) }] },
    yatzy: { name: "Yatzy (scandinave)", sub: "15 catégories · bonus +50", bonus: 50, cats: [...up,
      { n: "Paire", f: d => best(d, 2) * 2 },
      { n: "Deux paires", f: d => { const q = cnt(d), p = [6, 5, 4, 3, 2, 1].filter(v => q[v - 1] >= 2); return p.length >= 2 ? (p[0] + p[1]) * 2 : 0; } },
      { n: "Brelan", f: d => best(d, 3) * 3 }, { n: "Carré", f: d => best(d, 4) * 4 },
      { n: "Petite suite (15)", f: d => has(d, [[1, 2, 3, 4, 5]]) ? 15 : 0 }, { n: "Grande suite (20)", f: d => has(d, [[2, 3, 4, 5, 6]]) ? 20 : 0 },
      { n: "Full (somme)", f: d => { const k = cnt(d); return k.includes(3) && k.includes(2) ? sum(d) : 0; } }, { n: "Chance", f: d => sum(d) }, { n: "Yatzy (50)", f: d => cnt(d).includes(5) ? 50 : 0 }] } };
  const P = c.players, FACE = "⚀⚁⚂⚃⚄⚅"; let o = { mode: "classique", rolls: 3, forced: false, ann: false, bonusY: true };
  let M, cats, ROLLS, sc, yb, cur, dice, held, rolls, ann, yIdx;
  const setup = () => {
    c.box.innerHTML = `<h2>Variante de Yams</h2>
      ${Object.entries(MODES).map(([k, m]) => `<button class="choice ${o.mode === k ? "on" : ""}" data-s="mode" data-v="${k}"><span>${m.name}<br><small>${m.sub}</small></span></button>`).join("")}
      <div class="row"><span>🎲 Lancers par tour</span><span><button class="mini2" data-s="rolls" data-v="-1">−</button> <b>${o.rolls}</b> <button class="mini2" data-s="rolls" data-v="1">+</button></span></div>
      <button class="choice ${o.forced ? "on" : ""}" data-s="forced"><span>📋 Ordre imposé<br><small>On remplit les catégories dans l'ordre</small></span><small>${o.forced ? "oui" : "non"}</small></button>
      <button class="choice ${o.ann ? "on" : ""}" data-s="ann"><span>📣 Annonce<br><small>Annonce avant de lancer : ×2 si réussi, 0 sinon</small></span><small>${o.ann ? "oui" : "non"}</small></button>
      ${o.mode === "classique" ? `<button class="choice ${o.bonusY ? "on" : ""}" data-s="bonusY"><span>🃏 Yams bonus<br><small>Un autre Yams après un Yams à 50 : +100</small></span><small>${o.bonusY ? "oui" : "non"}</small></button>` : ""}
      <button class="btn main" data-s="go">🎲 Commencer</button>`;
    c.box.onclick = e => {
      const b = e.target.closest("[data-s]"); if (!b) return; const k = b.dataset.s, v = b.dataset.v;
      if (k === "go") return begin();
      if (k === "mode") o.mode = v; else if (k === "rolls") o.rolls = Math.min(5, Math.max(2, o.rolls + Number(v)));
      else if (k === "forced") { o.forced = !o.forced; if (o.forced) o.ann = false; } else if (k === "ann") { o.ann = !o.ann; if (o.ann) o.forced = false; } else if (k === "bonusY") o.bonusY = !o.bonusY;
      setup();
    };
  };
  const begin = () => {
    M = MODES[o.mode]; cats = M.cats; ROLLS = o.rolls; sc = P.map(() => ({})); yb = P.map(() => 0); cur = 0; yIdx = cats.findIndex(k => k.n.startsWith("Yams"));
    dice = [1, 1, 1, 1, 1]; held = [0, 0, 0, 0, 0]; rolls = 0; ann = null; c.box.onclick = play; draw();
  };
  const upSum = p => [0, 1, 2, 3, 4, 5].reduce((s, i) => s + (sc[p][i] || 0), 0);
  const total = p => Object.values(sc[p]).reduce((a, b) => a + b, 0) + (upSum(p) >= 63 ? M.bonus : 0) + yb[p] * 100;
  const isJoker = () => o.bonusY && o.mode === "classique" && rolls > 0 && sc[cur][yIdx] === 50 && cnt(dice).includes(5);
  const score = (i, joker) => { const k = cats[i], v = k.f(dice); return joker && k.j !== undefined ? k.j : v; };
  const pts = (i, joker) => score(i, joker) * (o.ann ? 2 : 1);
  const nextIdx = () => cats.findIndex((_, i) => sc[cur][i] === undefined);
  const bar = () => `<div class="gbar yb">${P.map((n, i) => `<span class="${i === cur ? "now" : ""}">${E(n)} <b>${total(i)}</b></span>`).join("")}</div>`;
  const draw = () => {
    if (o.ann && ann === null && !rolls) {
      c.box.innerHTML = `${bar()}<p class="big">Tour de <b>${E(P[cur])}</b></p><p class="empty">📣 Annonce une catégorie avant de lancer : points ×2 si tu la réussis, sinon 0.</p>
        <div class="ycats">${cats.map((k, i) => { const done = sc[cur][i] !== undefined; return `<button data-an="${i}" ${done ? "disabled" : ""} class="${done ? "done" : ""}"><span>${k.n}</span><b>${done ? sc[cur][i] : ""}</b></button>`; }).join("")}</div>`; return;
    }
    const joker = isJoker(), nx = nextIdx();
    c.box.innerHTML = `${bar()}<p class="big">Tour de <b>${E(P[cur])}</b> · lancer ${rolls}/${ROLLS}${ann !== null ? ` · 📣 ${cats[ann].n} (×2)` : ""}</p>
      ${joker ? `<p class="empty">🃏 Yams bonus ! +100 à l'inscription ; Full et suites valent leur maximum.</p>` : ""}${o.forced && nx >= 0 ? `<p class="empty">📋 Ordre imposé : prochaine case « ${cats[nx].n} »</p>` : ""}
      <div class="dice">${dice.map((v, i) => `<button class="die ${held[i] ? "held" : ""}" data-d="${i}" ${rolls && rolls < ROLLS ? "" : "disabled"}>${rolls ? FACE[v - 1] : "🎲"}</button>`).join("")}</div>
      <button class="btn main" data-roll="1" ${rolls >= ROLLS ? "disabled" : ""}>${rolls ? "🎲 Relancer les dés libres" : "🎲 Lancer les dés"}</button>
      ${o.ann ? `<button class="btn main" data-ok="1" ${rolls ? "" : "disabled"}>✅ Valider ${cats[ann].n} : ${rolls ? pts(ann, joker) : 0} pts</button>`
        : `<div class="ycats">${cats.map((k, i) => { const done = sc[cur][i] !== undefined, off = done || !rolls || (o.forced && i !== nx); return `<button data-cat="${i}" ${off ? "disabled" : ""} class="${done ? "done" : ""}"><span>${k.n}</span><b>${done ? sc[cur][i] : rolls ? pts(i, joker) : ""}</b></button>`; }).join("")}</div>`}
      <small>Bonus +${M.bonus} : ${upSum(cur)}/63 dans le haut${yb[cur] ? ` · 🃏 ${yb[cur]} Yams bonus` : ""}</small>`;
  };
  const place = i => {
    const joker = isJoker(); sc[cur][i] = pts(i, joker); if (joker) yb[cur]++;
    cur = (cur + 1) % P.length; dice = [1, 1, 1, 1, 1]; held = [0, 0, 0, 0, 0]; rolls = 0; ann = null;
    if (sc.every(v => Object.keys(v).length === cats.length)) { const t = P.map((_, k) => total(k)); draw(); return c.end({ text: "🏁 Partie terminée !", scores: t, win: true }); }
    draw();
  };
  const play = e => {
    const an = e.target.closest("[data-an]"); if (an && !rolls) { ann = Number(an.dataset.an); return draw(); }
    const d = e.target.closest("[data-d]"); if (d && rolls && rolls < ROLLS) { held[d.dataset.d] ^= 1; return draw(); }
    if (e.target.closest("[data-roll]") && rolls < ROLLS && !(o.ann && ann === null)) { dice = dice.map((v, i) => held[i] ? v : 1 + rnd(6)); rolls++; return draw(); }
    let i = null;
    if (o.ann) { if (e.target.closest("[data-ok]") && rolls) i = ann; } else { const k = e.target.closest("[data-cat]"); if (k && rolls) i = Number(k.dataset.cat); }
    if (i === null || sc[cur][i] !== undefined || (o.forced && i !== nextIdx())) return;
    place(i);
  };
  setup();
});

// ---------------- Cochon ----------------
G({ id: "cochon", name: "Cochon (Pig)", emoji: "🐷", cat: "Dés", min: 1, max: 6, dp: 2,
  rules: ["But du jeu : être le premier à atteindre 100 points avec un seul dé.", "À ton tour, lance le dé autant de fois que tu veux en cumulant. Un 1 annule le tour. Quand tu gardes, les points s'ajoutent à ton total. « 1 joueur » = contre l'IA."],
  scoring: ["Chaque lancer ajoute la valeur du dé au total du tour. Un 1 : tour perdu."], winner: ["Le premier à 100 points gagne."] }, c => {
  const vsIA = c.players.length < 2, P = vsIA ? [c.players[0], "🤖 IA"] : c.players, T = P.map(() => 0); let turn = 0, run = 0, last = 0, msg = "", busy = false;
  const draw = () => {
    c.box.innerHTML = `<div class="gbar yb">${P.map((n, i) => `<span class="${i === turn ? "now" : ""}">${E(n)} <b>${T[i]}</b></span>`).join("")}</div>
      <p class="big">Tour de <b>${E(P[turn])}</b></p><div class="bigdie">${last ? "⚀⚁⚂⚃⚄⚅"[last - 1] : "🎲"}</div><p class="big">${msg}</p><p class="empty">Points du tour : <b>${run}</b> · total si tu gardes : <b>${T[turn] + run}</b></p>
      ${vsIA && turn === 1 ? "" : `<button class="btn main" data-r="1">🎲 Lancer</button><button class="btn" data-h="1" ${run ? "" : "disabled"}>✋ Garder ${run} points</button>`}`;
  };
  const next = () => { run = 0; turn = (turn + 1) % P.length; draw(); if (vsIA && turn === 1) later(c, bot, 700); };
  const roll = () => {
    last = 1 + rnd(6);
    if (last === 1) { msg = `💥 ${P[turn]} fait 1 : tour perdu !`; run = 0; busy = true; draw(); return later(c, () => { busy = false; msg = ""; next(); }, 1100); }
    run += last; msg = ""; draw();
  };
  const keep = () => { T[turn] += run; if (T[turn] >= 100) { draw(); return c.end({ text: `🏆 ${P[turn]} atteint ${T[turn]} points !`, names: P, scores: T, win: true }); } last = 0; msg = `${P[turn]} garde ses points.`; next(); };
  const bot = () => { if (turn !== 1) return; if (run >= 18 || T[1] + run >= 100) return keep(); roll(); if (turn === 1 && last !== 1) later(c, bot, 800); };
  c.box.onclick = e => { if (busy || (vsIA && turn === 1)) return; if (e.target.closest("[data-r]")) roll(); else if (e.target.closest("[data-h]") && run) keep(); };
  draw();
});

// ---------------- Quiz ----------------
const QUIZ = [["Quelle est la capitale de l'Australie ?", "Canberra", "Sydney", "Melbourne", "Perth"], ["Quel est le plus grand océan du monde ?", "Le Pacifique", "L'Atlantique", "L'océan Indien", "L'Arctique"],
  ["Combien de côtés a un hexagone ?", "6", "5", "7", "8"], ["Qui a écrit « Les Misérables » ?", "Victor Hugo", "Émile Zola", "Molière", "Balzac"], ["Quelle planète est la plus proche du Soleil ?", "Mercure", "Vénus", "Mars", "Jupiter"],
  ["En quelle année a eu lieu la Révolution française ?", "1789", "1492", "1815", "1914"], ["Quel est le symbole chimique de l'or ?", "Au", "Or", "Ag", "Fe"], ["Qui a peint la Joconde ?", "Léonard de Vinci", "Michel-Ange", "Raphaël", "Botticelli"],
  ["Quel est le plus long fleuve de France ?", "La Loire", "La Seine", "Le Rhône", "La Garonne"], ["Dans quel pays se trouve la ville de Marrakech ?", "Le Maroc", "La Tunisie", "L'Égypte", "L'Algérie"],
  ["Quel est l'os le plus long du corps humain ?", "Le fémur", "Le tibia", "L'humérus", "Le péroné"], ["Quelle est la capitale du Canada ?", "Ottawa", "Toronto", "Montréal", "Vancouver"],
  ["Qui a peint « La Nuit étoilée » ?", "Vincent van Gogh", "Claude Monet", "Pablo Picasso", "Paul Cézanne"], ["Quel est le plus haut sommet du monde ?", "L'Everest", "Le K2", "Le Mont Blanc", "Le Kilimandjaro"],
  ["Combien y a-t-il de touches sur un piano standard ?", "88", "76", "64", "100"], ["Quel gaz les plantes absorbent-elles pour la photosynthèse ?", "Le dioxyde de carbone", "L'oxygène", "L'azote", "L'hydrogène"],
  ["Qui a gagné la Coupe du monde de football en 2018 ?", "La France", "La Croatie", "Le Brésil", "L'Allemagne"], ["Qui a écrit « Le Petit Prince » ?", "Antoine de Saint-Exupéry", "Jules Verne", "Albert Camus", "Marcel Pagnol"],
  ["Quel est l'animal terrestre le plus rapide ?", "Le guépard", "Le lion", "L'antilope", "Le cheval"], ["Quelle est la capitale du Japon ?", "Tokyo", "Kyoto", "Osaka", "Séoul"],
  ["Qui a découvert la pénicilline ?", "Alexander Fleming", "Louis Pasteur", "Marie Curie", "Isaac Newton"], ["Quel est le plus grand désert chaud du monde ?", "Le Sahara", "Le Gobi", "Le Kalahari", "L'Atacama"],
  ["Quelle est la monnaie du Royaume-Uni ?", "La livre sterling", "L'euro", "Le dollar", "Le franc"], ["Combien de joueurs d'une équipe de volley sont sur le terrain ?", "6", "5", "7", "11"],
  ["Quel est le plus grand mammifère du monde ?", "La baleine bleue", "L'éléphant d'Afrique", "Le requin-baleine", "La girafe"], ["Dans quelle ville se trouve le Colisée ?", "Rome", "Athènes", "Milan", "Naples"],
  ["Combien font 7 × 8 ?", "56", "54", "48", "64"], ["Qui a écrit « Roméo et Juliette » ?", "William Shakespeare", "Molière", "Dante", "Victor Hugo"],
  ["Quelle planète est surnommée la planète rouge ?", "Mars", "Vénus", "Jupiter", "Saturne"], ["Combien de cordes a une guitare classique ?", "6", "4", "5", "8"],
  ["Qui a été le premier homme à marcher sur la Lune ?", "Neil Armstrong", "Buzz Aldrin", "Youri Gagarine", "Michael Collins"], ["Quelle est la capitale de l'Espagne ?", "Madrid", "Barcelone", "Séville", "Valence"],
  ["Quel est le plus petit nombre premier ?", "2", "1", "3", "0"], ["Qui a écrit « Les Trois Mousquetaires » ?", "Alexandre Dumas", "Victor Hugo", "Stendhal", "Jules Verne"],
  ["Quel est le symbole chimique du fer ?", "Fe", "Fr", "F", "Ir"], ["Dans quel pays se trouve le Machu Picchu ?", "Le Pérou", "Le Mexique", "La Colombie", "Le Chili"],
  ["Quel est le plus petit pays du monde ?", "Le Vatican", "Monaco", "Saint-Marin", "Malte"], ["Qui a réalisé le film « Titanic » (1997) ?", "James Cameron", "Steven Spielberg", "Ridley Scott", "Christopher Nolan"],
  ["Combien de joueurs d'une équipe de basket sont sur le terrain ?", "5", "6", "7", "4"], ["Combien de minutes y a-t-il dans une heure et demie ?", "90", "80", "100", "75"],
  ["Quelle est la formule chimique de l'eau ?", "H₂O", "CO₂", "O₂", "NaCl"], ["Quel pays a pour capitale Lisbonne ?", "Le Portugal", "L'Espagne", "L'Italie", "La Grèce"]];
G({ id: "quiz", name: "Quiz / blind test", emoji: "🧠", cat: "Ambiance", min: 1, max: 8, dp: 2,
  rules: ["But du jeu : répondre au plus de questions possible. Les questions sont posées chacune leur tour aux joueurs (le téléphone passe de main en main).", "Choisis la bonne réponse parmi 4 propositions."],
  scoring: ["Bonne réponse : +1 point. Mauvaise réponse : 0."], winner: ["Après 5 questions par joueur (10 minimum), le plus de points gagne."] }, c => {
  const P = c.players, total = Math.min(QUIZ.length, Math.max(10, 5 * P.length)), qs = shuffle(QUIZ).slice(0, total), S = P.map(() => 0); let n = 0, opts, ans = null;
  const show = () => {
    const q = qs[n]; opts = shuffle(q.slice(1)); const who = n % P.length;
    c.box.innerHTML = `<div class="gbar yb">${P.map((p, i) => `<span class="${i === who ? "now" : ""}">${E(p)} <b>${S[i]}</b></span>`).join("")}</div><p class="empty">Question ${n + 1}/${total} · pour <b>${E(P[who])}</b></p><h2 class="qq">${E(q[0])}</h2>
      ${opts.map(o => `<button class="choice ${ans !== null ? (o === q[1] ? "good" : o === ans ? "bad" : "") : ""}" data-o="${E(o)}" ${ans !== null ? "disabled" : ""}><span>${E(o)}</span></button>`).join("")}
      ${ans !== null ? `<button class="btn main" data-nx="1">${n + 1 === total ? "🏁 Voir le résultat" : "Question suivante"}</button>` : ""}`;
  };
  c.box.onclick = e => {
    const o = e.target.closest("[data-o]"); if (o && ans === null) { ans = o.dataset.o; if (ans === qs[n][1]) S[n % P.length]++; return show(); }
    if (e.target.closest("[data-nx]")) { ans = null; if (++n >= total) return c.end({ text: "🏁 Quiz terminé !", scores: S, win: true }); show(); }
  };
  show();
});

// ---------------- Loup-garou ----------------
const LG = { loup: ["🐺", "Loup-garou", "Chaque nuit, avec les autres loups, tu choisis un joueur à dévorer. Le jour, fais semblant d'être innocent !"],
  villageois: ["🧑‍🌾", "Villageois", "Tu n'as aucun pouvoir. Débats et vote pour démasquer les loups."],
  voyante: ["🔮", "Voyante", "Chaque nuit, tu découvres le vrai rôle d'un joueur de ton choix."],
  sorciere: ["🧪", "Sorcière", "Tu as une potion de vie et une potion de mort, utilisables une seule fois chacune."],
  chasseur: ["🏹", "Chasseur", "Si tu meurs, tu emportes immédiatement un joueur avec toi."],
  cupidon: ["💘", "Cupidon", "La première nuit, tu désignes deux amoureux. Si l'un meurt, l'autre meurt de chagrin."],
  petitefille: ["👧", "Petite fille", "Chaque nuit, tu peux espionner les loups : tu aperçois l'un d'eux, mais tu as 1 chance sur 3 d'être repérée et dévorée à la place de la victime."],
  salvateur: ["🛡️", "Salvateur", "Chaque nuit, tu protèges un joueur (toi inclus) de l'attaque des loups. Interdit de protéger la même personne deux nuits de suite."],
  idiot: ["🤡", "Idiot du village", "Si le village vote contre toi, tu restes en vie mais tu perds ton droit de vote."],
  ancien: ["👴", "Ancien", "Tu survis à la première attaque des loups. Mais si le village t'élimine, tous les villageois perdent leurs pouvoirs !"],
  bouc: ["🐐", "Bouc émissaire", "En cas d'égalité au vote du village, c'est toi qui es éliminé."],
  corbeau: ["🐦", "Corbeau", "Chaque nuit, tu désignes un joueur : il commencera le vote du lendemain avec 2 voix contre lui."],
  loupblanc: ["🐺⚪", "Loup blanc", "Tu es un loup, mais tu joues pour toi : les nuits paires, tu peux aussi dévorer l'un de tes complices. Tu gagnes seul, en dernier survivant."],
  infect: ["🧛", "Infect père des loups", "Tu es un loup. Une seule fois, au lieu de tuer la victime des loups, tu peux l'infecter : elle survit et devient loup-garou."],
  ange: ["👼", "Ange", "Si le village t'élimine lors du tout premier vote, tu gagnes seul ! Sinon, tu deviens un simple villageois."],
  renard: ["🦊", "Renard", "Chaque nuit, tu flaires un joueur : tu sais s'il y a au moins un loup parmi lui et ses deux voisins. Sans loup, tu perds ton flair."],
  voleur: ["🃏", "Voleur", "La première nuit, tu peux échanger ta carte contre l'une des deux cartes laissées au centre (sinon tu deviens simple villageois)."],
  enfant: ["🐒", "Enfant sauvage", "La première nuit, tu choisis un modèle. Si ton modèle meurt, tu deviens loup-garou."],
  soeur: ["👭", "Sœur", "Tu connais ta sœur dès le début de la partie : vous pouvez vous faire confiance."],
  frere: ["👬", "Frère", "Tu connais tes deux frères dès le début de la partie : vous pouvez vous faire confiance."],
  montreur: ["🐻", "Montreur d'ours", "Chaque matin, si l'un de tes deux voisins vivants est un loup, l'ours grogne devant tout le village."],
  chevalier: ["⚔️", "Chevalier à l'épée rouillée", "Si les loups te tuent, le premier loup à ta gauche meurt la nuit suivante, de tétanos."],
  servante: ["🧹", "Servante dévouée", "Une fois, quand le village élimine un joueur, tu peux prendre sa carte avant qu'elle soit révélée et jouer son rôle."],
  flute: ["🪈", "Joueur de flûte", "Chaque nuit, tu envoûtes 2 joueurs. Tu gagnes seul quand tous les survivants sont envoûtés."],
  gml: ["👹", "Grand méchant loup", "Tu es un loup. Tant qu'aucun loup n'est mort, tu peux dévorer une seconde victime chaque nuit."] };
const WR = ["loup", "loupblanc", "infect", "gml"], CNT = { soeur: 2, frere: 3 }, LBL = { soeur: "Deux sœurs", frere: "Trois frères" }; // cartes du camp des loups
// Rôles optionnels (cartes supplémentaires) : [id, description courte pour l'écran de composition]
const LG_OPT = [["voyante", "Sonde un rôle chaque nuit"], ["sorciere", "Une potion de vie, une de mort"], ["chasseur", "Emporte quelqu'un en mourant"], ["cupidon", "Unit deux amoureux"],
  ["petitefille", "Espionne les loups (risquée)"], ["salvateur", "Protège un joueur chaque nuit"], ["idiot", "Survit au vote, sans voix ensuite"], ["ancien", "Survit à une attaque, punit le village"],
  ["bouc", "Meurt en cas d'égalité au vote"], ["corbeau", "+2 voix contre un joueur"],
  ["loupblanc", "Loup solitaire, mange les siens"], ["infect", "Transforme la victime en loup (1 fois)"], ["ange", "Gagne s'il est voté au 1er tour"],
  ["renard", "Flaire les loups parmi 3 voisins"], ["voleur", "Échange sa carte la 1re nuit"], ["enfant", "Devient loup si son modèle meurt"],
  ["soeur", "2 joueurs qui se connaissent"], ["frere", "3 joueurs qui se connaissent"], ["montreur", "Son ours grogne près d'un loup"], ["chevalier", "Venge sa mort sur un loup"],
  ["servante", "Prend la carte d'un éliminé"], ["flute", "Envoûte 2 joueurs par nuit"], ["gml", "Loup à 2 victimes tant qu'aucun loup ne meurt"]];
G({ id: "loup-garou", name: "Loup-garou", emoji: "🐺", cat: "Ambiance", min: 4, max: 18, dp: 8,
  rules: ["But du jeu : les villageois doivent éliminer tous les loups-garous ; les loups doivent dévorer assez de villageois. Pas besoin de narrateur : l'appli mène la partie et le téléphone passe de main en main.", "Chaque joueur découvre son rôle en secret. Chaque nuit, le téléphone fait le tour de TOUS les joueurs (même ceux sans pouvoir) pour que personne ne sache qui agit. Le jour, le village débat puis vote pour éliminer un suspect.",
    "Cartes supplémentaires disponibles : Voyante, Sorcière, Chasseur, Cupidon, Petite fille, Salvateur, Idiot du village, Ancien, Bouc émissaire, Corbeau, Loup blanc, Infect père des loups, Ange, Renard, Voleur, Enfant sauvage, Deux sœurs, Trois frères, Montreur d'ours, Chevalier à l'épée rouillée, Servante dévouée, Joueur de flûte, Grand méchant loup. Active celles que tu veux à l'écran de composition."],
  scoring: ["Les joueurs de l'équipe gagnante marquent 1 point."], winner: ["Villageois : plus aucun loup en vie. Loups : autant de loups que de villageois. Les amoureux (loup + villageois) gagnent seuls s'ils restent les deux derniers. Le Loup blanc (dernier survivant), l'Ange (voté au 1er tour) et le Joueur de flûte (tous les survivants envoûtés) gagnent seuls."] }, c => {
  const { ACT, V, choose, wait } = engine(c), P = c.players, n = P.length;
  let cfg = { loups: Math.max(1, Math.round(n / 4)), voyante: n >= 5, sorciere: n >= 6, chasseur: n >= 7, cupidon: n >= 8, petitefille: false, salvateur: false, idiot: false, ancien: false, bouc: false, corbeau: false, loupblanc: false, infect: false, ange: false, renard: false, voleur: false, enfant: false, soeur: false, frere: false, montreur: false, chevalier: false, servante: false, flute: false, gml: false };
  let pl, nightNo = 0, ord, N, potions, prevProt = -1, raven = null, off = false, extra = [], infectUsed = false, dayNo = 0, wolfDied = false, rust = null;
  const nm = i => E(P[i]), isW = i => WR.includes(pl[i].role), role = i => LG[pl[i].role], alive = () => pl.map((p, i) => p.alive ? i : -1).filter(i => i >= 0);
  const kill = i => { const r = []; const f = j => { if (!pl[j].alive) return; pl[j].alive = false; r.push(j); if (WR.includes(pl[j].role)) wolfDied = true; if (pl[j].love !== null) f(pl[j].love); }; f(i);
    pl.forEach(p => { if (p.alive && p.role === "enfant" && p.model !== undefined && !pl[p.model].alive) { p.role = "loup"; p.become = "Ton modèle est mort : tu deviens loup-garou !"; p.told = false; } }); // enfant sauvage
    return r; };
  const pass = (i, txt, fn, label = "C'est moi, continuer") => { V(`<div class="passbox"><div class="bigdie">📱</div><h2>${txt}</h2><p>Passe le téléphone à <b>${nm(i)}</b>.<br>Les autres ne regardent pas l'écran !</p></div><button class="btn main" data-act="go">${label}</button>`); ACT.go = fn; };
  const hide = (html, next) => { V(`<div class="passbox">${html}</div><button class="btn main" data-act="go2">Cacher l'écran</button>`); ACT.go2 = next; };
  const setup = () => {
    const sp = LG_OPT.filter(([k]) => cfg[k]).reduce((a, [k]) => a + (CNT[k] || 1), 0), vill = n - cfg.loups - sp, bad = vill < 0 || cfg.loups >= n / 2;
    V(`<h2>Composition (${n} joueurs)</h2><div class="row"><span>🐺 Loups-garous</span><span><button class="mini2" data-act="lw" data-v="-1">−</button> <b>${cfg.loups}</b> <button class="mini2" data-act="lw" data-v="1">+</button></span></div>
      ${LG_OPT.map(([k, d]) => `<button class="choice ${cfg[k] ? "on" : ""}" data-act="tg" data-v="${k}"><span>${LG[k][0]} ${LBL[k] || LG[k][1]}<br><small>${d}</small></span><small>${cfg[k] ? "inclus" : "non"}</small></button>`).join("")}
      <p class="empty">🧑‍🌾 Villageois : <b>${vill}</b></p>${cfg.voleur ? `<p class="empty">🃏 2 cartes Villageois s'ajoutent au tas du Voleur.</p>` : ""}${bad ? `<div class="alert">Composition impossible : trop de loups ou de rôles pour ${n} joueurs.</div>` : ""}
      <button class="btn main" data-act="start" ${bad ? "disabled" : ""}>🎭 Distribuer les rôles</button>`);
  };
  ACT.lw = v => { cfg.loups = Math.max(1, cfg.loups + Number(v)); setup(); }; ACT.tg = k => { cfg[k] = !cfg[k]; setup(); };
  ACT.start = () => {
    const r = [...Array(cfg.loups).fill("loup"), ...LG_OPT.map(x => x[0]).filter(k => cfg[k]).flatMap(k => Array(CNT[k] || 1).fill(k))]; while (r.length < n) r.push("villageois");
    let cards = shuffle(r);
    if (cfg.voleur) { // 2 cartes de plus au centre ; on s'assure que le Voleur est servi et qu'il y a au moins un loup en jeu
      const all = [...r, "villageois", "villageois"]; let t = 0;
      do { cards = shuffle(all); t++; } while (t < 300 && !(cards.slice(0, n).includes("voleur") && cards.slice(0, n).some(x => WR.includes(x)) && Object.keys(CNT).every(k => cards.slice(0, n).filter(x => x === k).length === (cfg[k] ? CNT[k] : 0))));
      extra = cards.slice(n); cards = cards.slice(0, n);
    }
    pl = cards.map(x => ({ role: x, alive: true, love: null, used: false, out: false })); potions = { heal: true, kill: true }; deal(0);
  };
  const deal = i => pass(i, "🎭 Découverte du rôle", () => {
    const [e, t, d] = role(i), mates = isW(i) ? `<p>Complices : <b>${pl.map((p, j) => isW(j) && j !== i ? nm(j) : null).filter(Boolean).join(", ") || "aucun"}</b></p>` : "";
    V(`<div class="passbox"><div class="bigdie">${e}</div><h2>${nm(i)}, tu es ${t}</h2><p>${d}</p>${mates}${CNT[pl[i].role] ? `<p>${pl[i].role === "soeur" ? "Ta sœur" : "Tes frères"} : <b>${pl.map((p, j) => p.role === pl[i].role && j !== i ? nm(j) : null).filter(Boolean).join(", ")}</b></p>` : ""}</div><button class="btn main" data-act="nx">J'ai compris, cacher l'écran</button>`);
    ACT.nx = () => i + 1 < n ? deal(i + 1) : night();
  }, "Voir mon rôle");
  // ----- nuit -----
  const night = () => {
    nightNo++; N = { votes: {}, vic: null, save: false, poison: null, cupid: false, protect: -1, caught: null, raven: null, infect: false, wwKill: null, gml: null, flute: null };
    V(`<div class="passbox"><div class="bigdie">🌙</div><h2>Nuit ${nightNo}</h2><p>Le village s'endort… Chacun à son tour va recevoir le téléphone en secret.</p></div><button class="btn main" data-act="go">Commencer la nuit</button>`);
    ACT.go = () => { const t = pl.findIndex(p => p.role === "voleur"); nightNo === 1 && t >= 0 ? thief(t) : begin(); };
  };
  const thief = t => pass(t, "🃏 Avant la nuit", () => {
    const forced = extra.every(x => WR.includes(x));
    V(`<div class="passbox"><div class="bigdie">🃏</div><h2>Choisis ta carte</h2><p>Deux cartes sont restées au centre. Tu peux en prendre une à la place de ton rôle de Voleur.${forced ? "<br><b>Elles sont toutes deux du camp des loups : tu dois en prendre une !</b>" : "<br>Si tu n'en prends aucune, tu deviens simple Villageois."}</p></div>
      ${extra.map((x, k) => `<button class="btn" data-act="tk" data-v="${k}">${LG[x][0]} Prendre ${LG[x][1]}</button>`).join("")}${forced ? "" : `<button class="btn main" data-act="tk" data-v="-1">Garder (devenir Villageois)</button>`}`);
    ACT.tk = v => { v = Number(v); pl[t].role = v < 0 ? "villageois" : extra[v]; const [e, nr, d] = role(t); hide(`<div class="bigdie">${e}</div><h2>Tu es maintenant ${nr}</h2><p>${d}</p>`, begin); };
  });
  const begin = () => {
    const o = shuffle(alive());
    // un rôle qui doit voir le résultat des loups passe après eux (et après la petite fille)
    const place = (r0, after) => { const x = o.find(i => pl[i].role === r0); if (x === undefined) return; const last = () => Math.max(-1, ...o.map((i, k) => after(pl[i].role) ? k : -1));
      if (o.indexOf(x) < last()) { o.splice(o.indexOf(x), 1); const l = last(); o.splice(l + 1 + rnd(o.length - l), 0, x); } };
    place("infect", r => (WR.includes(r) && r !== "infect") || r === "petitefille");
    place("sorciere", r => WR.includes(r) || r === "petitefille");
    ord = o; turn(0);
  };
  const dummy = (i, next) => wait(`<div class="passbox"><div class="bigdie">😴</div><h2>Tu dors profondément</h2><p>Rien à faire cette nuit. Garde un visage neutre quelques secondes…</p></div>`, "Continuer", next);
  const infectStep = (i, next) => {
    const v = victim();
    if (v < 0) return hide(`<div class="bigdie">🧛</div><h2>Aucune victime désignée</h2>`, next);
    if (infectUsed) return hide(`<div class="bigdie">🧛</div><h2>Les loups dévorent ${nm(v)}</h2><p>Ton pouvoir d'infection est déjà utilisé.</p>`, next);
    V(`<div class="passbox"><div class="bigdie">🧛</div><h2>Les loups ont choisi ${nm(v)}</h2><p>Une seule fois dans la partie, tu peux l'infecter : il survit et devient loup-garou.</p></div><button class="btn main" data-act="inf">🧛 Infecter ${nm(v)}</button><button class="btn" data-act="skip">Le laisser mourir</button>`);
    ACT.inf = () => { N.infect = true; infectUsed = true; hide(`<div class="bigdie">🧛</div><h2>${nm(v)} sera infecté(e)</h2>`, next); }; ACT.skip = next;
  };
  const gmlStep = (i, next) => {
    const done = () => hide(`<div class="bigdie">🐺</div><h2>Choix enregistré</h2>`, next);
    choose({ head: `<div class="passbox"><div class="bigdie">👹</div><h2>Une seconde victime ?</h2><p>Aucun loup n'est mort : tu peux dévorer un deuxième joueur.</p></div>`, opts: alive().filter(j => !isW(j)), need: 1, okLabel: "Dévorer aussi", ok: s => { N.gml = s[0]; done(); },
      extra: `<button class="btn" data-act="skip">Une seule victime</button>` }); ACT.skip = done;
  };
  const whiteKill = (i, next) => {
    const opts = alive().filter(j => j !== i && isW(j)), done = () => hide(`<div class="bigdie">🐺</div><h2>Choix enregistré</h2>`, next);
    if (!opts.length) return done();
    choose({ head: `<div class="passbox"><div class="bigdie">🐺⚪</div><h2>Nuit paire : dévorer un loup ?</h2><p>Tu peux éliminer l'un de tes « complices ».</p></div>`, opts, need: 1, okLabel: "Dévorer ce loup", ok: s => { N.wwKill = s[0]; done(); },
      extra: `<button class="btn" data-act="skip">Ne rien faire</button>` }); ACT.skip = done;
  };
  const turn = k => {
    if (k >= ord.length) return resolveNight();
    const i = ord[k], r = (off && !isW(i) && pl[i].role !== "flute") ? "x" : pl[i].role, next = () => turn(k + 1);
    pass(i, `🌙 Nuit ${nightNo}`, () => {
      const soloInfect = r === "infect" && !alive().some(j => j !== i && isW(j));
      if (r === "loup" || r === "loupblanc" || r === "gml" || soloInfect) {
        const vote = () => {
          const mates = pl.map((p, j) => isW(j) && p.alive && j !== i ? nm(j) : null).filter(Boolean);
          choose({ head: `<div class="passbox"><div class="bigdie">🐺</div><h2>Choisis ta victime</h2><p>Complices : ${mates.join(", ") || "aucun"}</p></div>`, opts: alive().filter(j => !isW(j)), need: 1, okLabel: "Dévorer",
            ok: s => { N.votes[s[0]] = (N.votes[s[0]] || 0) + 1; if (r === "loupblanc" && nightNo % 2 === 0) whiteKill(i, next); else if (r === "infect") infectStep(i, next); else if (r === "gml" && !wolfDied) gmlStep(i, next); else hide(`<div class="bigdie">🐺</div><h2>Choix enregistré</h2>`, next); } });
        };
        if (pl[i].become && !pl[i].told) { pl[i].told = true; V(`<div class="passbox"><div class="bigdie">🐺</div><h2>${E(pl[i].become)}</h2><p>Tu te réveilles désormais avec les loups.</p></div><button class="btn main" data-act="go2">Continuer</button>`); ACT.go2 = vote; } else vote();
      } else if (r === "infect") {
        infectStep(i, next);
      } else if (r === "renard" && !pl[i].fox) {
        choose({ head: `<div class="passbox"><div class="bigdie">🦊</div><h2>Qui flairer ?</h2><p>Tu sauras s'il y a au moins un loup parmi ce joueur et ses deux voisins vivants.</p></div>`, opts: alive(), need: 1, okLabel: "Flairer",
          ok: s => { const a = alive(), k = a.indexOf(s[0]), trio = [...new Set([a[(k - 1 + a.length) % a.length], s[0], a[(k + 1) % a.length]])], w = trio.some(j => isW(j)); if (!w) pl[i].fox = true;
            hide(`<div class="bigdie">🦊</div><h2>${w ? "Il y a au moins un loup parmi :" : "Aucun loup parmi :"}</h2><p><b>${trio.map(nm).join(", ")}</b></p>${w ? "" : "<p>Ton flair s'éteint : tu perds ton pouvoir.</p>"}`, next); } });
      } else if (r === "enfant" && nightNo === 1) {
        choose({ head: `<div class="passbox"><div class="bigdie">🐒</div><h2>Choisis ton modèle</h2><p>S'il meurt, tu deviens loup-garou.</p></div>`, opts: alive().filter(j => j !== i), need: 1, okLabel: "Choisir ce modèle", ok: s => { pl[i].model = s[0]; hide(`<div class="bigdie">🐒</div><h2>${nm(s[0])} est ton modèle</h2>`, next); } });
      } else if (r === "flute") {
        const opts = alive().filter(j => j !== i && !pl[j].enc), need = Math.min(2, opts.length);
        if (!need) return dummy(i, next);
        choose({ head: `<div class="passbox"><div class="bigdie">🪈</div><h2>Qui envoûter ?</h2><p>Choisis ${need} joueur${need > 1 ? "s" : ""} à envoûter cette nuit.</p></div>`, opts, need, okLabel: "Jouer la mélodie", ok: s => { N.flute = [...s]; hide(`<div class="bigdie">🪈</div><h2>${s.map(nm).join(" et ")} ${s.length > 1 ? "sont envoûtés" : "est envoûté(e)"}</h2>`, next); } });
      } else if (r === "voyante") {
        choose({ head: `<div class="passbox"><div class="bigdie">🔮</div><h2>Qui veux-tu sonder ?</h2></div>`, opts: alive().filter(j => j !== i), need: 1, okLabel: "Voir son rôle", ok: s => { const [e, t] = role(s[0]); hide(`<div class="bigdie">${e}</div><h2>${nm(s[0])} est ${t}</h2>`, next); } });
      } else if (r === "cupidon" && nightNo === 1) {
        choose({ head: `<div class="passbox"><div class="bigdie">💘</div><h2>Désigne deux amoureux</h2><p>Tu peux te choisir toi-même.</p></div>`, opts: alive(), need: 2, okLabel: "Unir ces deux joueurs", ok: s => { pl[s[0]].love = s[1]; pl[s[1]].love = s[0]; N.cupid = true; hide(`<div class="bigdie">💘</div><h2>Les amoureux sont unis</h2>`, next); } });
      } else if (r === "petitefille") {
        V(`<div class="passbox"><div class="bigdie">👧</div><h2>Espionner les loups ?</h2><p>Tu verras l'un d'eux, mais tu as <b>1 chance sur 3</b> d'être repérée : les loups te dévoreront alors à la place de leur victime.</p></div><button class="btn main" data-act="spy">👀 Espionner</button><button class="btn" data-act="skip">😴 Dormir</button>`);
        ACT.skip = next;
        ACT.spy = () => { const w = pick(alive().filter(j => isW(j))); if (rnd(3) === 0) N.caught = i; hide(`<div class="bigdie">👀</div><h2>Tu aperçois ${nm(w)}…</h2><p>…c'est un loup-garou ! Garde ça pour toi (et prie pour ne pas avoir été vue).</p>`, next); };
      } else if (r === "salvateur") {
        choose({ head: `<div class="passbox"><div class="bigdie">🛡️</div><h2>Qui protéger cette nuit ?</h2><p>${prevProt >= 0 && pl[prevProt].alive ? `Interdit : ${nm(prevProt)} (protégé(e) hier).` : "Tu peux te protéger toi-même."}</p></div>`, opts: alive().filter(j => j !== prevProt), need: 1, okLabel: "Protéger", ok: s => { N.protect = s[0]; hide(`<div class="bigdie">🛡️</div><h2>${nm(s[0])} est protégé(e)</h2>`, next); } });
      } else if (r === "corbeau") {
        choose({ head: `<div class="passbox"><div class="bigdie">🐦</div><h2>Qui désigner ?</h2><p>Ce joueur aura 2 voix contre lui au prochain vote.</p></div>`, opts: alive().filter(j => j !== i), need: 1, okLabel: "Désigner", ok: s => { N.raven = s[0]; hide(`<div class="bigdie">🐦</div><h2>${nm(s[0])} est désigné(e)</h2>`, next); },
          extra: `<button class="btn" data-act="skip">Ne désigner personne</button>` }); ACT.skip = next;
      } else if (r === "sorciere") {
        victim();
        const v = N.vic, can = (potions.heal && v >= 0 ? `<button class="btn" data-act="heal">🧪 Sauver ${nm(v)}</button>` : "") + (potions.kill ? `<button class="btn" data-act="pz">☠️ Empoisonner quelqu'un</button>` : "");
        V(`<div class="passbox"><div class="bigdie">🧪</div><h2>${v >= 0 ? `Les loups ont attaqué ${nm(v)}` : "Personne n'a été attaqué"}</h2></div>${can}<button class="btn main" data-act="skip">Ne rien faire de plus</button>`);
        ACT.heal = () => { potions.heal = false; N.save = true; next(); }; ACT.skip = next;
        ACT.pz = () => choose({ head: `<div class="passbox"><div class="bigdie">☠️</div><h2>Qui empoisonner ?</h2></div>`, opts: alive().filter(j => j !== i), need: 1, okLabel: "Empoisonner", ok: s => { potions.kill = false; N.poison = s[0]; next(); } });
      } else dummy(i, next);
    });
  };
  const victim = () => {
    if (N.vic === null) {
      if (N.caught !== null && pl[N.caught].alive) N.vic = N.caught; // la petite fille repérée remplace la victime
      else { const e = Object.entries(N.votes).sort((a, b) => b[1] - a[1]), top = e.filter(x => x[1] === e[0]?.[1]); N.vic = top.length ? Number(pick(top)[0]) : -1; }
    }
    return N.vic;
  };
  const resolveNight = () => {
    const v = victim(), dead = [];
    if (rust !== null) { if (pl[rust].alive) dead.push(...kill(rust)); rust = null; } // tétanos du chevalier
    if (N.infect && v >= 0) { pl[v].role = "loup"; pl[v].become = "Le Père infect t'a transformé : tu rejoins les loups-garous !"; pl[v].told = false; }
    else if (v >= 0) {
      const saved = (N.protect === v) !== N.save; // sorcière + salvateur sur la même personne : elle meurt quand même
      if (!saved) { if (pl[v].role === "ancien" && !pl[v].used) pl[v].used = true; else { dead.push(...kill(v)); if (pl[v].role === "chevalier" && !off) rust = leftWolf(v); } }
    }
    if (N.poison !== null && pl[N.poison].alive) dead.push(...kill(N.poison));
    if (N.wwKill !== null && pl[N.wwKill].alive) dead.push(...kill(N.wwKill));
    if (N.gml !== null && pl[N.gml].alive && N.protect !== N.gml) { if (pl[N.gml].role === "ancien" && !pl[N.gml].used) pl[N.gml].used = true; else dead.push(...kill(N.gml)); }
    if (N.flute) N.flute.forEach(j => { pl[j].enc = true; });
    prevProt = N.protect; raven = N.raven !== null && pl[N.raven].alive ? N.raven : null;
    lastDead = dead; nightNo === 1 && N.cupid ? loversPass(0) : flutePass(0);
  };
  const leftWolf = v => { for (let d = 1; d < n; d++) { const j = (v + d) % n; if (pl[j].alive && isW(j)) return j; } return null; };
  const flutePass = k => {
    if (!N.flute) return dawn(lastDead);
    const a = alive(); if (k >= a.length) return dawn(lastDead);
    const i = a[k], hit = N.flute.includes(i);
    pass(i, "🪈 Une mélodie…", () => hide(`<div class="bigdie">${hit ? "🪈" : "🌙"}</div><h2>${hit ? "Tu es envoûté(e) !" : "Tu n'entends rien"}</h2><p>${hit ? "Tu es sous l'emprise du Joueur de flûte… garde le secret." : ""}</p>`, () => flutePass(k + 1)));
  };
  const loversPass = k => { const a = alive(); if (k >= a.length) return flutePass(0); const i = a[k]; pass(i, "💘 Vérification", () => { const l = pl[i].love; hide(`<div class="bigdie">${l !== null ? "💘" : "🙂"}</div><h2>${l !== null ? `Tu es amoureux de ${nm(l)} !` : "Tu n'es pas amoureux"}</h2><p>${l !== null ? "Si l'un de vous meurt, l'autre aussi. Garde le secret (ou pas)…" : ""}</p>`, () => loversPass(k + 1)); }); };
  let lastDead = [];
  const winner = () => {
    const a = alive(), wt = a.filter(isW), w = wt.length, o = a.length - w;
    if (a.length === 2 && pl[a[0]].love === a[1] && w === 1) return "amoureux";
    const fl = a.find(j => pl[j].role === "flute"); if (fl !== undefined && a.every(j => j === fl || pl[j].enc)) return "flute";
    if (!w) return "village";
    if (a.length === 1 && pl[a[0]].role === "loupblanc") return "loupblanc";
    if (w >= o) return wt.every(j => pl[j].role === "loupblanc") ? null : "loups"; // un Loup blanc avec un seul villageois doit finir le travail
    return null;
  };
  const afterDeaths = (dead, then) => {
    const h = off ? [] : dead.filter(i => pl[i].role === "chasseur");
    const nx = () => { if (!h.length) return then(); const i = h.shift(), opts = alive();
      if (!opts.length) return nx();
      choose({ head: `<div class="passbox"><div class="bigdie">🏹</div><h2>${nm(i)} était chasseur !</h2><p>Il emporte un joueur avec lui.</p></div>`, opts, need: 1, okLabel: "Tirer", ok: s => { const d = kill(s[0]); h.push(...d.filter(j => pl[j].role === "chasseur"));
        V(`<div class="passbox"><div class="bigdie">💥</div><h2>${d.map(j => `${nm(j)} (${role(j)[0]} ${role(j)[1]})`).join(" et ")}</h2><p>${d.length > 1 ? "Les amoureux meurent ensemble." : ""}</p></div><button class="btn main" data-act="go2">Continuer</button>`); ACT.go2 = nx; } }); };
    nx();
  };
  const growl = () => {
    if (off) return ""; const a = alive(), b = a.find(j => pl[j].role === "montreur"); if (b === undefined) return "";
    const k = a.indexOf(b), nb = [a[(k - 1 + a.length) % a.length], a[(k + 1) % a.length]].filter(j => j !== b);
    return nb.some(j => isW(j)) ? "<p>🐻 <b>Grrrr !</b> L'ours grogne : un loup est tout près du Montreur d'ours…</p>" : "";
  };
  const dawn = dead => {
    lastDead = dead;
    V(`<div class="passbox"><div class="bigdie">☀️</div><h2>Le village se réveille</h2>${dead.length ? dead.map(j => `<p>💀 <b>${nm(j)}</b> a été tué(e) cette nuit. C'était ${role(j)[0]} <b>${role(j)[1]}</b>.</p>`).join("") : "<p>Personne n'est mort cette nuit !</p>"}${growl()}</div><button class="btn main" data-act="go">Continuer</button>`);
    ACT.go = () => afterDeaths(dead, () => endOr(day));
  };
  const endOr = f => { const w = winner(); w ? finish(w) : f(); };
  // vote du village : t = true quand l'égalité fait tomber le bouc émissaire
  const vote = (i, t) => {
    const r = pl[i].role;
    if (r === "ange" && dayNo === 1 && !t) { pl[i].alive = false; return finish("ange", i); }
    if (r === "idiot" && !pl[i].out && !t) {
      pl[i].out = true;
      V(`<div class="passbox"><div class="bigdie">🤡</div><h2>${nm(i)} est l'Idiot du village !</h2><p>Il reste en vie, mais ne peut plus voter.</p></div><button class="btn main" data-act="go">Continuer</button>`);
      ACT.go = () => endOr(night); return;
    }
    const sv = pl.findIndex((p, j) => p.alive && j !== i && p.role === "servante");
    if (sv >= 0 && !off && !t) return pass(sv, "🧹 Servante dévouée", () => {
      V(`<div class="passbox"><div class="bigdie">🧹</div><h2>${nm(i)} va être éliminé(e)</h2><p>Veux-tu prendre sa carte (une seule fois) ? Tu connaîtras son rôle, mais personne d'autre.</p></div><button class="btn main" data-act="yes">Prendre sa carte</button><button class="btn" data-act="no">Non merci</button>`);
      ACT.yes = () => { const rr = pl[i].role; Object.assign(pl[sv], { role: rr, model: pl[i].model, fox: pl[i].fox, used: pl[i].used }); pl[i].role = "servante"; pl[i].secret = true; hide(`<div class="bigdie">${LG[rr][0]}</div><h2>Tu es maintenant ${LG[rr][1]}</h2><p>${LG[rr][2]}</p>`, () => conclude(i, t, r)); };
      ACT.no = () => conclude(i, t, r);
    });
    conclude(i, t, r);
  };
  const conclude = (i, t, r) => {
    const d = kill(i); if (r === "ancien" && !t) off = true;
    V(`<div class="passbox"><div class="bigdie">⚰️</div><h2>${d.map(j => pl[j].secret ? `${nm(j)} (rôle gardé secret)` : `${nm(j)} (${role(j)[0]} ${role(j)[1]})`).join(" et ")}</h2><p>${t ? "⚖️ Égalité : le bouc émissaire est sacrifié.<br>" : ""}${d.length > 1 ? "Les amoureux meurent ensemble." : ""}${r === "ancien" && !t ? "<br>👴 C'était l'Ancien : les villageois perdent tous leurs pouvoirs !" : ""}</p></div><button class="btn main" data-act="go">Continuer</button>`);
    ACT.go = () => afterDeaths(d, () => endOr(night));
  };
  const day = () => {
    dayNo++;
    const bouc = alive().find(j => pl[j].role === "bouc"), mutes = alive().filter(j => pl[j].out).map(nm);
    ACT.tie = () => vote(bouc, true);
    choose({ head: `<div class="passbox"><div class="bigdie">🗣️</div><h2>Le village débat</h2><p>${alive().length} survivants : ${alive().map(nm).join(", ")}.<br>Discutez, puis votez à main levée. Qui est éliminé ?</p>
      ${raven !== null ? `<p>🐦 Le Corbeau a désigné <b>${nm(raven)}</b> : <b>+2 voix</b> contre lui.</p>` : ""}${mutes.length ? `<p>🤡 Sans droit de vote : <b>${mutes.join(", ")}</b></p>` : ""}</div>`,
      opts: alive(), need: 1, okLabel: "Éliminer ce joueur", ok: s => vote(s[0]), extra: bouc !== undefined ? `<button class="btn" data-act="tie">⚖️ Égalité des voix (le bouc émissaire est éliminé)</button>` : "" });
  };
  const finish = (w, who) => {
    const win = pl.map((p, i) => w === "village" ? !WR.includes(p.role) : w === "loups" ? (WR.includes(p.role) && p.role !== "loupblanc") : w === "ange" ? i === who : w === "flute" ? p.role === "flute" : alive().includes(i)),
      title = { village: "Les villageois gagnent ! 🧑‍🌾", loups: "Les loups-garous gagnent ! 🐺", amoureux: "Les amoureux gagnent ! 💘", loupblanc: "Le Loup blanc gagne seul ! 🐺⚪", ange: "L'Ange gagne seul ! 👼", flute: "Le Joueur de flûte gagne seul ! 🪈" }[w];
    V(`<div class="passbox"><div class="trophy">🏆</div><h2>${title}</h2></div><div class="rolelist">${pl.map((p, i) => `<div class="recent"><span>${LG[p.role][0]} ${nm(i)}</span><small>${LG[p.role][1]} ${p.alive ? "" : "💀"}</small></div>`).join("")}</div>`);
    c.end({ text: title, scores: win.map(x => x ? 1 : 0), win: true });
  };
  setup();
});

// ---------------- Undercover ----------------
const UC = [["Chat", "Chien"], ["Café", "Thé"], ["Plage", "Piscine"], ["Pizza", "Burger"], ["Guitare", "Piano"], ["Vélo", "Trottinette"], ["Cinéma", "Théâtre"], ["Soleil", "Lune"], ["Lait", "Yaourt"], ["Avion", "Hélicoptère"], ["Pomme", "Poire"], ["Football", "Rugby"], ["Docteur", "Infirmier"], ["Hiver", "Automne"], ["Mer", "Océan"], ["Chocolat", "Caramel"], ["Maison", "Appartement"], ["Fourchette", "Cuillère"], ["Ski", "Snowboard"], ["Lunettes", "Lentilles"], ["Stylo", "Crayon"], ["Train", "Métro"], ["Loup", "Renard"], ["Montagne", "Colline"], ["Bière", "Vin"], ["Tennis", "Badminton"], ["Pirate", "Corsaire"], ["Sorcier", "Magicien"], ["Mariage", "Anniversaire"], ["Douche", "Bain"], ["Rivière", "Fleuve"], ["Crêpe", "Gaufre"], ["Voiture", "Camion"], ["Ordinateur", "Tablette"], ["Facteur", "Livreur"], ["Princesse", "Reine"], ["Vampire", "Zombie"], ["Cirque", "Zoo"], ["Orange", "Mandarine"], ["Fraise", "Framboise"], ["Violon", "Violoncelle"], ["Boulanger", "Pâtissier"], ["Bateau", "Sous-marin"], ["Hamburger", "Sandwich"]];
// Thèmes de mots (paires de mots proches)
const UCP = { classique: UC,
  nourriture: [["Beurre", "Margarine"], ["Café", "Chocolat chaud"], ["Spaghetti", "Tagliatelles"], ["Croissant", "Pain au chocolat"], ["Miel", "Confiture"], ["Glace", "Sorbet"], ["Soupe", "Velouté"], ["Sushi", "Maki"], ["Camembert", "Brie"], ["Cidre", "Champagne"], ["Tarte", "Gâteau"], ["Poulet", "Dinde"], ["Riz", "Pâtes"], ["Ketchup", "Mayonnaise"], ["Jus d'orange", "Limonade"], ["Kebab", "Tacos"]],
  animaux: [["Lion", "Tigre"], ["Dauphin", "Requin"], ["Cheval", "Âne"], ["Lapin", "Lièvre"], ["Aigle", "Faucon"], ["Crocodile", "Alligator"], ["Grenouille", "Crapaud"], ["Abeille", "Guêpe"], ["Papillon", "Libellule"], ["Mouton", "Chèvre"], ["Pingouin", "Manchot"], ["Chameau", "Dromadaire"], ["Souris", "Hamster"], ["Corbeau", "Corneille"], ["Éléphant", "Rhinocéros"], ["Singe", "Gorille"]],
  lieux: [["Paris", "Londres"], ["Hôtel", "Auberge"], ["Aéroport", "Gare"], ["Désert", "Savane"], ["Château", "Palais"], ["Musée", "Galerie"], ["Camping", "Randonnée"], ["Île", "Presqu'île"], ["Supermarché", "Marché"], ["Église", "Cathédrale"], ["Bibliothèque", "Librairie"], ["Hôpital", "Clinique"], ["Plage", "Lac"], ["Forêt", "Jungle"], ["Pont", "Tunnel"], ["Stade", "Gymnase"]],
  sport: [["Natation", "Plongeon"], ["Basket", "Handball"], ["Judo", "Karaté"], ["Échecs", "Dames"], ["Yoga", "Pilates"], ["Marathon", "Trail"], ["Golf", "Minigolf"], ["Poker", "Belote"], ["Pêche", "Chasse"], ["Peinture", "Dessin"], ["Lecture", "Écriture"], ["Jardinage", "Bricolage"], ["Surf", "Kitesurf"], ["Escalade", "Alpinisme"], ["Danse", "Gym"], ["Boxe", "Lutte"]],
  maison: [["Canapé", "Fauteuil"], ["Frigo", "Congélateur"], ["Couette", "Couverture"], ["Lampe", "Bougie"], ["Miroir", "Vitre"], ["Clé", "Cadenas"], ["Montre", "Réveil"], ["Sac à dos", "Valise"], ["Parapluie", "Imperméable"], ["Table", "Bureau"], ["Savon", "Shampoing"], ["Chaussette", "Collant"], ["Livre", "Magazine"], ["Four", "Micro-ondes"], ["Balai", "Aspirateur"], ["Rideau", "Store"]],
  fantaisie: [["Dragon", "Dinosaure"], ["Père Noël", "Lapin de Pâques"], ["Sirène", "Fée"], ["Robot", "Alien"], ["Pirate", "Cow-boy"], ["Chevalier", "Samouraï"], ["Licorne", "Pégase"], ["Netflix", "YouTube"], ["Dracula", "Frankenstein"], ["Fantôme", "Squelette"], ["Roi", "Empereur"], ["Magie", "Sorcellerie"], ["Trésor", "Butin"], ["Super-héros", "Super-vilain"], ["Jeu vidéo", "Jeu de société"]],
  metiers: [["Pompier", "Policier"], ["Avocat", "Juge"], ["Professeur", "Directeur"], ["Cuisinier", "Serveur"], ["Pilote", "Contrôleur aérien"], ["Plombier", "Électricien"], ["Journaliste", "Écrivain"], ["Chanteur", "Acteur"], ["Médecin", "Pharmacien"], ["Coiffeur", "Esthéticienne"], ["Boucher", "Poissonnier"], ["Maçon", "Architecte"], ["Agriculteur", "Jardinier"], ["Dentiste", "Vétérinaire"], ["Astronaute", "Pilote"], ["Photographe", "Peintre"]] };
const UC_TH = [["tous", "🎲 Tous mélangés"], ["classique", "🎯 Classique"], ["nourriture", "🍕 Nourriture"], ["animaux", "🦁 Animaux"], ["lieux", "🌍 Lieux"], ["sport", "⚽ Sport & loisirs"], ["maison", "🏠 Maison"], ["fantaisie", "🧙 Pop culture"], ["metiers", "👷 Métiers"]];
G({ id: "undercover", name: "Undercover", emoji: "🕵️", cat: "Ambiance", min: 3, max: 12, dp: 5,
  rules: ["But du jeu : chaque joueur reçoit un mot en secret. Les civils ont le même mot ; l'Undercover a un mot proche mais différent ; Mr White n'a aucun mot.", "À tour de rôle, chacun dit un mot ou une courte phrase qui décrit son mot, sans le dire. Puis le groupe vote pour éliminer un suspect. Le téléphone passe de main en main pour découvrir son mot.",
    "Variantes : 8 thèmes de mots (ou tous mélangés), mots personnalisés, jusqu'à 2 Mr White, Double agent (mot des civils mais joue pour les infiltrés), Clown (gagne seul s'il est éliminé), rôles des éliminés cachés ou non, nombre d'infiltrés annoncé ou non."],
  scoring: ["Les joueurs de l'équipe gagnante marquent 1 point."], winner: ["Civils : éliminer tous les infiltrés (Undercover, Mr White, Double agent). Infiltrés : rester aussi nombreux que les civils. Mr White éliminé peut gagner seul en devinant le mot des civils. Le Clown gagne seul s'il est éliminé."] }, c => {
  const { ACT, V, choose } = engine(c), P = c.players, n = P.length;
  let cfg = { u: n >= 10 ? 3 : n >= 7 ? 2 : 1, w: n >= 6 ? 1 : 0, clown: false, agent: false, reveal: true, count: true, theme: "tous", c1: "", c2: "" }, pl, words;
  const INF = ["under", "white", "agent"], nm = i => E(P[i]), alive = () => pl.map((p, i) => p.alive ? i : -1).filter(i => i >= 0),
    RL = { civil: "🙂 Civil", under: "🕵️ Undercover", white: "⬜ Mr White", clown: "🤡 Clown", agent: "🎭 Double agent" },
    HINT = { civil: "Décris ce mot sans le dire. Attention : un infiltré a un mot proche…", under: "Décris ce mot sans le dire. Attention : un infiltré a un mot proche…",
      white: "Tu n'as aucun mot : écoute les autres et bluffe !", clown: "🤡 Tu es le Clown ! Tu as le mot des civils, mais ton but secret est de te faire éliminer par le village.",
      agent: "🎭 Tu es le Double agent ! Tu as le mot des civils, mais tu joues pour les infiltrés : fais éliminer des civils. Tu ne connais pas tes alliés." };
  c.box.oninput = e => { if (e.target.id === "c1") cfg.c1 = e.target.value; else if (e.target.id === "c2") cfg.c2 = e.target.value; };
  const setup = () => {
    const inf = cfg.u + cfg.w + (cfg.agent ? 1 : 0), civ = n - inf - (cfg.clown ? 1 : 0), bad = n - inf <= inf || civ < 1;
    V(`<h2>Composition (${n} joueurs)</h2>
      <div class="row"><span>🕵️ Undercover</span><span><button class="mini2" data-act="u" data-v="-1">−</button> <b>${cfg.u}</b> <button class="mini2" data-act="u" data-v="1">+</button></span></div>
      <div class="row"><span>⬜ Mr White</span><span><button class="mini2" data-act="wc" data-v="-1">−</button> <b>${cfg.w}</b> <button class="mini2" data-act="wc" data-v="1">+</button></span></div>
      ${[["agent", "🎭 Double agent", "Mot des civils, joue pour les infiltrés"], ["clown", "🤡 Clown", "Gagne seul s'il est éliminé"]].map(([k, t, d]) => `<button class="choice ${cfg[k] ? "on" : ""}" data-act="tg" data-v="${k}"><span>${t}<br><small>${d}</small></span><small>${cfg[k] ? "inclus" : "non"}</small></button>`).join("")}
      <p class="empty">🙂 Civils : <b>${civ}</b></p>
      <h3>Thème des mots</h3><div class="picker2">${UC_TH.map(([k, t]) => `<button class="choice ${cfg.theme === k ? "on" : ""}" data-act="th" data-v="${k}"><span>${t}</span></button>`).join("")}</div>
      <h3>Mots personnalisés (facultatif)</h3><input id="c1" placeholder="Mot des civils" value="${E(cfg.c1)}" autocomplete="off"><input id="c2" placeholder="Mot de l'Undercover" value="${E(cfg.c2)}" autocomplete="off">
      <p class="empty">Remplis les deux champs pour les utiliser à la place du thème.</p>
      <h3>Options</h3>${[["reveal", "Révéler le rôle des éliminés"], ["count", "Annoncer le nombre d'infiltrés"]].map(([k, t]) => `<button class="choice ${cfg[k] ? "on" : ""}" data-act="tg" data-v="${k}"><span>${t}</span><small>${cfg[k] ? "oui" : "non"}</small></button>`).join("")}
      ${bad ? `<div class="alert">Il faut plus de civils que d'infiltrés (et au moins un civil).</div>` : ""}<button class="btn main" data-act="start" ${bad ? "disabled" : ""}>🎭 Distribuer les mots</button>`);
  };
  ACT.u = v => { cfg.u = Math.max(1, cfg.u + Number(v)); setup(); }; ACT.wc = v => { cfg.w = Math.min(2, Math.max(0, cfg.w + Number(v))); setup(); };
  ACT.tg = k => { cfg[k] = !cfg[k]; setup(); }; ACT.th = k => { cfg.theme = k; setup(); };
  ACT.start = () => {
    const a1 = cfg.c1.trim(), a2 = cfg.c2.trim();
    if (a1 && a2) words = { civil: a1, under: a2 };
    else { const pool = cfg.theme === "tous" ? Object.values(UCP).flat() : UCP[cfg.theme], [x, y] = shuffle(pick(pool)); words = { civil: x, under: y }; }
    const r = [...Array(cfg.u).fill("under"), ...Array(cfg.w).fill("white"), ...(cfg.agent ? ["agent"] : []), ...(cfg.clown ? ["clown"] : [])]; while (r.length < n) r.push("civil");
    pl = shuffle(r).map(role => ({ role, alive: true })); deal(0);
  };
  const deal = i => {
    V(`<div class="passbox"><div class="bigdie">📱</div><h2>🎭 Ton mot secret</h2><p>Passe le téléphone à <b>${nm(i)}</b>.<br>Les autres ne regardent pas !</p></div><button class="btn main" data-act="go">Voir mon mot</button>`);
    ACT.go = () => { const r = pl[i].role; V(`<div class="passbox"><h2>${nm(i)}</h2><div class="word">${r === "white" ? "⬜ Tu es Mr White" : E(r === "under" ? words.under : words.civil)}</div><p>${HINT[r]}</p></div><button class="btn main" data-act="nx">J'ai compris, cacher</button>`); ACT.nx = () => i + 1 < n ? deal(i + 1) : talk(); };
  };
  const talk = () => {
    const a = alive(), cand = a.filter(i => pl[i].role !== "white"), s = pick(cand.length ? cand : a), inf = a.filter(i => INF.includes(pl[i].role)).length;
    V(`<div class="passbox"><div class="bigdie">🗣️</div><h2>Tour de table</h2><p>${nm(s)} commence, puis on tourne dans le sens des aiguilles d'une montre.<br>Chacun dit <b>un mot ou une courte phrase</b> en rapport avec son mot.</p><p class="empty">En jeu : ${a.map(nm).join(", ")}</p>${cfg.count ? `<p class="empty">🕵️ Infiltrés encore en jeu : <b>${inf}</b></p>` : ""}</div><button class="btn main" data-act="vote">🗳️ Passer au vote</button>`);
    ACT.vote = () => choose({ head: `<div class="passbox"><div class="bigdie">🗳️</div><h2>Qui est éliminé ?</h2><p>Votez à main levée, puis désignez le joueur le plus voté.</p></div>`, opts: alive(), need: 1, okLabel: "Éliminer", ok: s => elim(s[0]) });
  };
  const elim = i => {
    pl[i].alive = false; const r = pl[i].role;
    if (r === "white") {
      V(`<div class="passbox"><div class="bigdie">⬜</div><h2>${nm(i)} était Mr White !</h2><p>Dernière chance : quel est le mot des civils ?</p></div><input id="gs" placeholder="Le mot des civils…" autocomplete="off"><button class="btn main" data-act="gs">Valider</button>`);
      ACT.gs = () => { const ok = nrm($("#gs").value) === nrm(words.civil); ok ? finish("white", i) : chk(`❌ Mauvaise réponse ! Le mot des civils était « ${E(words.civil)} ».`); };
    } else if (r === "clown") finish("clown", i);
    else chk(cfg.reveal ? `${RL[r]} : <b>${nm(i)}</b> est éliminé(e).` : `<b>${nm(i)}</b> est éliminé(e).`);
  };
  const chk = msg => {
    const a = alive(), inf = a.filter(i => INF.includes(pl[i].role)).length, civ = a.length - inf;
    V(`<div class="passbox"><div class="bigdie">⚰️</div><h2>${msg}</h2></div><button class="btn main" data-act="go">Continuer</button>`);
    ACT.go = () => !inf ? finish("civils") : civ <= inf ? finish("infiltres") : talk();
  };
  const finish = (w, who) => {
    const win = pl.map((p, i) => w === "civils" ? p.role === "civil" : w === "infiltres" ? INF.includes(p.role) : i === who),
      title = { civils: "Les civils gagnent ! 🙂", infiltres: "Les infiltrés gagnent ! 🕵️", white: "Mr White gagne seul ! ⬜", clown: "Le Clown gagne seul ! 🤡" }[w];
    V(`<div class="passbox"><div class="trophy">🏆</div><h2>${title}</h2><p>Mot des civils : <b>${E(words.civil)}</b> · Undercover : <b>${E(words.under)}</b></p></div>${pl.map((p, i) => `<div class="recent"><span>${nm(i)}</span><small>${RL[p.role]}</small></div>`).join("")}`);
    c.end({ text: title, scores: win.map(x => x ? 1 : 0), win: true });
  };
  setup();
});

// ---------------- Action ou Vérité ----------------
const VER = ["Quelle est la chose la plus gênante qui te soit arrivée ?", "Quel est ton plus gros mensonge d'enfance ?", "Quelle est la dernière chose que tu as cherchée sur internet ?", "Qui, dans cette pièce, ferait le meilleur colocataire ? Et le pire ?", "Quel est ton plus grand défaut ?", "Quelle chanson écoutes-tu en cachette sans l'assumer ?", "Quel est le pire cadeau que tu aies reçu ?", "Quelle est ta plus grande peur ?", "Quel talent caché possèdes-tu ?", "As-tu déjà fait semblant d'être malade pour éviter quelque chose ?", "Quel est ton pire souvenir de cantine ou de travail ?", "Quel métier ne ferais-tu jamais, même payé très cher ?", "Quelle est la dernière chose que tu as volée (même un stylo) ?", "Si tu devais échanger ta vie avec quelqu'un ici pendant une semaine, qui ?", "Quel est ton plus gros fou rire ?", "Quelle application utilises-tu le plus et combien de temps par jour ?", "Quelle est la chose la plus folle que tu aies faite pour de l'argent ?", "Quel film as-tu pleuré à chaque visionnage ?"];
const ACTS = ["Fais ton meilleur imitateur d'un animal pendant 20 secondes.", "Raconte une blague. Si personne ne rit, refais-en une.", "Danse sans musique pendant 30 secondes.", "Parle avec l'accent d'un pirate jusqu'à ton prochain tour.", "Fais 10 pompes ou 15 squats.", "Chante le refrain de la chanson de ton choix.", "Garde un verre d'eau en équilibre sur la tête pendant 1 minute.", "Fais un compliment sincère à chaque joueur.", "Imite un autre joueur jusqu'à ce qu'on devine qui.", "Mime un métier, les autres doivent deviner.", "Marche comme un robot jusqu'à la fin de ton prochain tour.", "Fais le tour de la pièce en marchant à reculons.", "Fais une déclaration d'amour dramatique à un objet de la pièce.", "Dis l'alphabet à l'envers aussi vite que possible.", "Montre la dernière photo de ta galerie (si tu l'assumes !).", "Fais ta meilleure grimace et garde-la 15 secondes."];
G({ id: "action-verite", name: "Action ou Vérité", emoji: "🎭", cat: "Ambiance", min: 2, max: 12, dp: 4,
  rules: ["But du jeu : s'amuser ! Chacun son tour, le joueur désigné choisit « Action » (un défi) ou « Vérité » (une question franche).", "Les défis restent bon enfant. On peut passer son tour en buvant une gorgée ou en faisant un gage choisi par le groupe."],
  scoring: ["Pas de points : le but est de rire. Chaque défi relevé peut valoir 1 point si vous voulez compter à la main."], winner: ["Pas de gagnant officiel : le plus courageux de la soirée !"] }, c => {
  const { ACT, V } = engine(c), P = c.players; let bag = [], cur = -1, va = shuffle(VER), aa = shuffle(ACTS);
  const nextP = () => { if (!bag.length) bag = shuffle(P.map((_, i) => i)).filter(i => i !== cur); cur = bag.pop(); };
  const start = () => { nextP(); V(`<div class="passbox"><div class="bigdie">🎯</div><h2>C'est au tour de ${E(P[cur])}</h2><p>Action ou vérité ?</p></div><div class="row2"><button class="btn main" data-act="a">💪 Action</button><button class="btn main" data-act="v">🗣️ Vérité</button></div>`); };
  const card = (t, icon) => { V(`<div class="passbox"><div class="bigdie">${icon}</div><h2>${E(P[cur])}</h2><p class="big">${E(t)}</p></div><button class="btn main" data-act="nx">Joueur suivant</button><button class="btn" data-act="re">🔄 Autre ${icon === "💪" ? "défi" : "question"}</button>`); ACT.re = () => icon === "💪" ? ACT.a() : ACT.v(); };
  ACT.a = () => { if (!aa.length) aa = shuffle(ACTS); card(aa.pop(), "💪"); }; ACT.v = () => { if (!va.length) va = shuffle(VER); card(va.pop(), "🗣️"); }; ACT.nx = start;
  start();
});
