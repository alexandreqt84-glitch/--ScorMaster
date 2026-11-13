// Jeux jouables dans l'appli — partie 1 : solos et duels
window.PLAY = {};
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[rnd(a.length)];
const mmss = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
// Enregistre un jeu : meta (catalogue) + moteur
function G(meta, run) {
  PLAY[meta.id] = run;
  const ex = CAT_AUTRES.find(x => x.id === meta.id);
  if (ex) Object.assign(ex, { play: meta.id }, meta.solo ? { solo: true } : {}, meta.min !== undefined ? { min: meta.min } : {});
  else CAT_AUTRES.push({ teams: false, low: false, quick: [], targets: [], ...meta, play: meta.id });
}
// Ajoute un écouteur de swipe sur un élément ; cb(0=gauche,1=droite,2=haut,3=bas)
function swipe(el, cb) {
  let x, y;
  el.addEventListener("touchstart", e => { x = e.touches[0].clientX; y = e.touches[0].clientY; }, { passive: true });
  el.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - x, dy = e.changedTouches[0].clientY - y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    cb(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 0 : 1) : (dy < 0 ? 2 : 3));
  }, { passive: true });
}
function keys(c, fn) { const f = e => fn(e); document.addEventListener("keydown", f); c.onStop(() => document.removeEventListener("keydown", f)); }
function timer(c, fn, ms) { const t = setInterval(fn, ms); c.onStop(() => clearInterval(t)); return t; }
function later(c, fn, ms) { const t = setTimeout(fn, ms); c.onStop(() => clearTimeout(t)); return t; }
function beep(f, ms = 220) {
  if (!Core.opt("sound")) return;
  try {
    const a = beep.a || (beep.a = new (window.AudioContext || window.webkitAudioContext)()), o = a.createOscillator(), g = a.createGain();
    o.frequency.value = f; g.gain.value = .15; o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + ms / 1000);
  } catch (e) {}
}
const SOLO = { min: 1, max: 1, dp: 1, solo: true, cat: "Solo" };

// ---------------- 2048 ----------------
G({ ...SOLO, id: "2048", name: "2048", emoji: "🔢",
  rules: ["But du jeu : fusionner des tuiles identiques pour former la tuile 2048 (et aller plus loin).", "Glisse ton doigt (ou utilise les flèches du clavier) : toutes les tuiles se déplacent dans cette direction. Deux tuiles identiques qui se touchent fusionnent."],
  scoring: ["Chaque fusion rapporte la valeur de la nouvelle tuile."], winner: ["La partie s'arrête quand plus aucun mouvement n'est possible. Bats ton record !"] }, c => {
  let g, score = 0, won = false, over = false, N = 4, GL = 2048;
  const add = () => { const e = g.map((v, i) => v ? -1 : i).filter(i => i >= 0); g[pick(e)] = Math.random() < .9 ? 2 : 4; };
  const slide = r => { r = r.filter(Boolean); let s = 0; for (let i = 0; i < r.length - 1; i++) if (r[i] === r[i + 1]) { r[i] *= 2; s += r[i]; r.splice(i + 1, 1); } while (r.length < N) r.push(0); return [r, s]; };
  const stuck = () => !g.includes(0) && !g.some((v, i) => (i % N < N - 1 && v === g[i + 1]) || (i < N * N - N && v === g[i + N]));
  const move = d => {
    if (over || !g) return; let moved = false, gain = 0; const ng = [...g];
    for (let k = 0; k < N; k++) {
      const idx = Array.from({ length: N }, (_, j) => j).map(j => d < 2 ? k * N + j : j * N + k); let line = idx.map(i => g[i]);
      if (d === 1 || d === 3) line.reverse(); let [r, s] = slide(line); if (d === 1 || d === 3) r.reverse();
      idx.forEach((i, j) => { if (ng[i] !== r[j]) moved = true; ng[i] = r[j]; }); gain += s;
    }
    if (!moved) return; g = ng; score += gain; add(); if (g.includes(GL)) won = true;
    draw(); if (stuck()) { over = true; c.end({ text: `Plus de mouvement ! Score : ${score}`, scores: [score], win: true }); }
  };
  const col = v => v ? `background:hsl(${(Math.log2(v) * 38 + 200) % 360},70%,${v > 4 ? 45 : 60}%)` : "";
  const draw = () => {
    c.box.innerHTML = `<div class="gbar"><span>Score <b>${score}</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div>${won ? `<div class="alert">🎉 ${GL} atteint ! Continue si tu veux.</div>` : ""}
      <div class="g2048" id="b2" style="grid-template-columns:repeat(${N},1fr)">${g.map(v => `<div class="t" style="${col(v)}">${v || ""}</div>`).join("")}</div>
      <div class="dpad"><button data-m="2">⬆️</button><div><button data-m="0">⬅️</button><button data-m="3">⬇️</button><button data-m="1">➡️</button></div></div>`;
    swipe($("#b2"), move);
  };
  c.box.onclick = e => { const b = e.target.closest("[data-m]"); if (b) move(Number(b.dataset.m)); };
  keys(c, e => { const d = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 }[e.key]; if (d !== undefined) { e.preventDefault(); move(d); } });
  const h = c.box.onclick;
  menu(c, "Variante de 2048", [{ k: "n", label: "🔢 Grille", opts: [[4, "4×4 · objectif 2048"], [3, "3×3 · objectif 256"], [5, "5×5 · objectif 4096"], [6, "6×6 · objectif 8192"]] }], o => { N = o.n; GL = { 3: 256, 4: 2048, 5: 4096, 6: 8192 }[N]; c.box.onclick = h; g = Array(N * N).fill(0); add(); add(); draw(); });
});

// ---------------- Démineur ----------------
G({ ...SOLO, id: "demineur", name: "Démineur", emoji: "💣", low: true,
  rules: ["But du jeu : découvrir toutes les cases sans mines.", "Touche une case pour la creuser. Un chiffre indique combien de mines touchent cette case (8 voisines). Utilise le bouton 🚩 pour poser des drapeaux sur les mines supposées."],
  scoring: ["Ton score est le temps : plus il est court, mieux c'est."], winner: ["Tu gagnes quand toutes les cases sans mine sont découvertes. Creuser une mine = perdu."] }, c => {
  const LV = { "Débutant": [6, 6, 5], "Facile": [8, 8, 8], "Moyen": [10, 10, 15], "Difficile": [12, 12, 30], "Expert": [12, 16, 45] };
  let W, H, M, cells, flag = false, t0 = 0, done = false, secs = 0, first = true;
  const nb = i => { const x = i % W, y = Math.floor(i / W), r = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if ((dx || dy) && nx >= 0 && ny >= 0 && nx < W && ny < H) r.push(ny * W + nx); } return r; };
  const menu = () => { c.box.innerHTML = `<p>Choisis la difficulté :</p>` + Object.keys(LV).map(k => `<button class="btn main" data-l="${k}">${k} <small>${LV[k][0]}×${LV[k][1]} · ${LV[k][2]} mines</small></button>`).join(""); };
  const start = k => { [W, H, M] = LV[k]; cells = Array.from({ length: W * H }, () => ({ m: false, o: false, f: false, n: 0 })); first = true; done = false; secs = 0; draw(); };
  const plant = safe => {
    const ban = new Set([safe, ...nb(safe)]); let n = 0;
    while (n < M) { const i = rnd(W * H); if (!cells[i].m && !ban.has(i)) { cells[i].m = true; n++; } }
    cells.forEach((x, i) => x.n = nb(i).filter(j => cells[j].m).length);
  };
  const open = i => { const st = [i]; while (st.length) { const j = st.pop(), x = cells[j]; if (x.o || x.f) continue; x.o = true; if (!x.n && !x.m) st.push(...nb(j)); } };
  const draw = () => {
    const left = M - cells.filter(x => x.f).length;
    c.box.innerHTML = `<div class="gbar"><span>💣 <b>${left}</b></span><span>⏱️ <b id="tm">${mmss(secs)}</b></span><span>Record <b>${c.best() !== null ? mmss(c.best()) : "—"}</b></span></div>
      <div class="mines" style="grid-template-columns:repeat(${W},1fr)">${cells.map((x, i) => `<button class="m ${x.o ? "o" : ""} ${x.o && x.m ? "bomb" : ""}" data-i="${i}">${x.o ? (x.m ? "💥" : x.n || "") : x.f ? "🚩" : (done && x.m ? "💣" : "")}</button>`).join("")}</div>
      <button class="btn ${flag ? "main" : ""}" data-fl="1">${flag ? "🚩 Mode drapeau activé" : "⛏️ Mode creuser (touche pour passer au drapeau)"}</button>`;
  };
  c.box.onclick = e => {
    const l = e.target.closest("[data-l]"); if (l) return start(l.dataset.l);
    if (e.target.closest("[data-fl]")) { flag = !flag; return draw(); }
    const b = e.target.closest("[data-i]"); if (!b || done) return; const i = Number(b.dataset.i), x = cells[i];
    if (flag) { if (!x.o) x.f = !x.f; return draw(); }
    if (x.f || x.o) return;
    if (first) { plant(i); first = false; t0 = Date.now(); }
    if (x.m) { cells.forEach(y => { if (y.m) y.o = true; }); done = true; draw(); return c.end({ text: "💥 Boum ! Tu as touché une mine." }); }
    open(i);
    if (cells.every(y => y.m || y.o)) { done = true; secs = Math.round((Date.now() - t0) / 1000); draw(); return c.end({ text: `✅ Gagné en ${mmss(secs)} !`, scores: [secs], low: true, win: true }); }
    draw();
  };
  timer(c, () => { if (!done && !first) { secs = Math.round((Date.now() - t0) / 1000); const t = $("#tm"); if (t) t.textContent = mmss(secs); } }, 500);
  menu();
});

// ---------------- Memory ----------------
G({ ...SOLO, id: "memory", name: "Memory", emoji: "🧠", low: true,
  rules: ["But du jeu : retrouver toutes les paires de cartes identiques.", "Retourne deux cartes : si elles sont identiques, elles restent visibles ; sinon elles se cachent à nouveau."],
  scoring: ["Ton score est le nombre de coups (une paire retournée = 1 coup). Moins il y en a, mieux c'est."], winner: ["Tu gagnes quand toutes les paires sont trouvées."] }, c => {
  const FACES = ["🐶", "🐱", "🦊", "🐼", "🦁", "🐸", "🐵", "🐙", "🦄", "🐢", "🦋", "🐝"], LV = { "Mini": 4, "Facile": 6, "Moyen": 8, "Difficile": 12 };
  let cards, open = [], moves = 0, lock = false, found = 0, pairs;
  const start = k => { pairs = LV[k]; cards = shuffle([...FACES.slice(0, pairs), ...FACES.slice(0, pairs)]).map(f => ({ f, s: 0 })); moves = 0; found = 0; open = []; draw(); };
  const draw = () => {
    c.box.innerHTML = `<div class="gbar"><span>Coups <b>${moves}</b></span><span>Paires <b>${found}/${pairs}</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div>
      <div class="memo">${cards.map((x, i) => `<button class="mc ${x.s ? "up" : ""} ${x.s === 2 ? "ok" : ""}" data-i="${i}">${x.s ? x.f : "❔"}</button>`).join("")}</div>`;
  };
  c.box.onclick = e => {
    const l = e.target.closest("[data-l]"); if (l) return start(l.dataset.l);
    const b = e.target.closest("[data-i]"); if (!b || lock) return; const i = Number(b.dataset.i); if (cards[i].s) return;
    cards[i].s = 1; open.push(i); draw();
    if (open.length === 2) {
      moves++; const [a, d] = open; lock = true;
      if (cards[a].f === cards[d].f) { cards[a].s = cards[d].s = 2; found++; open = []; lock = false; draw(); if (found === pairs) c.end({ text: `✅ Bravo, ${moves} coups !`, scores: [moves], low: true, win: true }); }
      else later(c, () => { cards[a].s = cards[d].s = 0; open = []; lock = false; draw(); }, 800);
    }
  };
  c.box.innerHTML = `<p>Choisis la difficulté :</p>` + Object.keys(LV).map(k => `<button class="btn main" data-l="${k}">${k} <small>${LV[k]} paires</small></button>`).join("");
});

// ---------------- Taquin ----------------
G({ ...SOLO, id: "taquin", name: "Taquin", emoji: "🔟", low: true,
  rules: ["But du jeu : remettre les tuiles dans l'ordre (1, 2, 3…) avec la case vide en bas à droite.", "Touche une tuile voisine de la case vide pour la faire glisser."],
  scoring: ["Ton score est le nombre de déplacements. Moins il y en a, mieux c'est."], winner: ["Tu gagnes quand toutes les tuiles sont dans l'ordre."] }, c => {
  let N, t, moves;
  const start = n => {
    N = n; t = [...Array(N * N).keys()].map(i => (i + 1) % (N * N)); moves = 0; let e = N * N - 1, prev = -1;
    for (let k = 0; k < 250; k++) { const x = e % N, y = Math.floor(e / N), o = []; if (x > 0) o.push(e - 1); if (x < N - 1) o.push(e + 1); if (y > 0) o.push(e - N); if (y < N - 1) o.push(e + N);
      const m = pick(o.filter(z => z !== prev)); [t[e], t[m]] = [t[m], t[e]]; prev = e; e = m; }
    draw();
  };
  const draw = () => {
    c.box.innerHTML = `<div class="gbar"><span>Coups <b>${moves}</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div>
      <div class="taq" style="grid-template-columns:repeat(${N},1fr)">${t.map((v, i) => `<button class="tt ${v ? "" : "empty"}" data-i="${i}">${v || ""}</button>`).join("")}</div>`;
  };
  c.box.onclick = e => {
    const l = e.target.closest("[data-n]"); if (l) return start(Number(l.dataset.n));
    const b = e.target.closest("[data-i]"); if (!b) return; const i = Number(b.dataset.i), z = t.indexOf(0);
    const ok = (i % N === z % N && Math.abs(i - z) === N) || (Math.floor(i / N) === Math.floor(z / N) && Math.abs(i - z) === 1); if (!ok) return;
    [t[i], t[z]] = [t[z], t[i]]; moves++; draw();
    if (t.every((v, k) => v === (k + 1) % (N * N))) c.end({ text: `✅ Résolu en ${moves} coups !`, scores: [moves], low: true, win: true });
  };
  c.box.innerHTML = `<p>Choisis la taille :</p><button class="btn main" data-n="3">3 × 3 <small>facile</small></button><button class="btn main" data-n="4">4 × 4 <small>difficile</small></button><button class="btn main" data-n="5">5 × 5 <small>expert</small></button>`;
});

// ---------------- Simon ----------------
G({ ...SOLO, id: "simon", name: "Simon", emoji: "🔴",
  rules: ["But du jeu : mémoriser et reproduire une suite de couleurs qui s'allonge à chaque tour.", "Regarde la séquence (avec le son), puis touche les couleurs dans le même ordre."],
  scoring: ["Ton score est le nombre de séquences réussies."], winner: ["Le jeu s'arrête à la première erreur. Bats ton record !"] }, c => {
  const AC = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#f97316"], AF = [330, 392, 440, 523, 587, 659];
  let COL = AC.slice(0, 4), FR = AF.slice(0, 4), SP = 700, REV = false, NB = 4, seq = [], pos = 0, show = false;
  const draw = (lit = -1, msg = "") => {
    c.box.innerHTML = `<div class="gbar"><span>Niveau <b>${seq.length}</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div><p class="empty">${msg}</p>
      <div class="simon" style="grid-template-columns:repeat(${NB === 6 ? 3 : 2},1fr)">${COL.map((k, i) => `<button data-i="${i}" style="background:${k};opacity:${lit === i ? 1 : .45}"></button>`).join("")}</div>`;
  };
  const flash = i => { beep(FR[i], 280); draw(i, show ? "👀 Regarde…" : "À toi !"); };
  const play = () => {
    show = true; pos = 0; seq.push(rnd(NB)); draw(-1, "👀 Regarde…");
    seq.forEach((s, k) => { later(c, () => flash(s), SP + k * SP); later(c, () => draw(-1, "👀 Regarde…"), SP + k * SP + 380); });
    later(c, () => { show = false; draw(-1, REV ? "À toi ! (à l'envers)" : "À toi !"); }, SP + seq.length * SP);
  };
  c.box.onclick = e => {
    const b = e.target.closest("[data-i]"); if (!b || show) return; const i = Number(b.dataset.i);
    if (!seq.length) return;
    flash(i);
    if (i !== (REV ? seq[seq.length - 1 - pos] : seq[pos])) { const s = seq.length - 1; return c.end({ text: `❌ Raté ! Tu as réussi ${s} séquence(s).`, scores: [s], win: s > 0 }); }
    if (++pos === seq.length) { show = true; later(c, play, 700); }
  };
  const h = c.box.onclick;
  menu(c, "Variante de Simon", [{ k: "b", label: "🔴 Boutons", opts: [[4, "4 (classique)"], [6, "6 (difficile)"]] }, { k: "s", label: "⏱️ Vitesse", opts: [[700, "Normale"], [1000, "Lente"], [450, "Rapide"]] }, { k: "r", label: "🔁 Sens", opts: [[0, "Normal"], [1, "À l'envers (dernier d'abord)"]] }], o => {
    NB = o.b; COL = AC.slice(0, NB); FR = AF.slice(0, NB); SP = o.s; REV = !!o.r; c.box.onclick = h; draw(-1, "Touche une couleur pour commencer");
    c.box.addEventListener("click", function once(e) { if (!seq.length && e.target.closest("[data-i]")) { c.box.removeEventListener("click", once); play(); } }, true);
  });
});

// ---------------- Pendu ----------------
const MOTS = ["MAISON", "CHOCOLAT", "VOITURE", "ORDINATEUR", "BIBLIOTHEQUE", "ELEPHANT", "MONTAGNE", "FROMAGE", "GUITARE", "PARAPLUIE", "CROISSANT", "ASTRONAUTE", "PAPILLON", "TELEPHONE", "CHAMPIGNON", "DINOSAURE", "BOULANGERIE", "TRAMPOLINE", "ARC EN CIEL", "KANGOUROU", "LABYRINTHE", "SAXOPHONE", "TOURNESOL", "HELICOPTERE", "CARNAVAL", "ESCARGOT", "CHEVALIER", "VOLCAN", "BOUSSOLE", "PIRATE", "DRAGON", "HORLOGE", "FANTOME", "CACTUS", "LICORNE", "MOUSTACHE", "PYJAMA", "REFRIGERATEUR", "TORTUE", "ZEBRE", "CAROTTE", "PIZZA", "VACANCES", "ARAIGNEE", "CHATEAU", "ORAGE", "SORCIERE", "TRESOR", "PLAGE", "SOLEIL"];
G({ ...SOLO, id: "pendu", name: "Pendu", emoji: "🪢", low: true,
  rules: ["But du jeu : deviner le mot caché lettre par lettre.", "Chaque mauvaise lettre ajoute un morceau au dessin. Après 7 erreurs, c'est perdu."],
  scoring: ["Ton score est le nombre d'erreurs commises (moins = mieux)."], winner: ["Tu gagnes si le mot est complet avant la 7e erreur."] }, c => {
  let w, got, err, MAXE = 7;
  const parts = ["<circle cx='150' cy='60' r='16'/>", "<line x1='150' y1='76' x2='150' y2='130'/>", "<line x1='150' y1='90' x2='125' y2='115'/>", "<line x1='150' y1='90' x2='175' y2='115'/>", "<line x1='150' y1='130' x2='130' y2='165'/>", "<line x1='150' y1='130' x2='170' y2='165'/>", "<line x1='143' y1='56' x2='157' y2='56' stroke='#f87171'/>"];
  const start = () => { w = pick(MOTS); got = new Set([" "]); err = 0; draw(); };
  const menu = () => { c.box.innerHTML = `<p>Choisis la difficulté :</p><button class="btn main" data-e="10">Facile <small>10 erreurs permises</small></button><button class="btn main" data-e="7">Classique <small>7 erreurs</small></button><button class="btn main" data-e="5">Difficile <small>5 erreurs</small></button><button class="btn main" data-e="3">Impitoyable <small>3 erreurs</small></button>`; };
  const draw = () => {
    const word = [...w].map(l => got.has(l) ? l : "_").join(" ");
    c.box.innerHTML = `<div class="gbar"><span>Erreurs <b>${err}/${MAXE}</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div>
      <svg viewBox="0 0 220 180" class="pendu"><g stroke="#e2e8f0" stroke-width="4" fill="none" stroke-linecap="round"><line x1="20" y1="172" x2="100" y2="172"/><line x1="60" y1="172" x2="60" y2="10"/><line x1="60" y1="10" x2="150" y2="10"/><line x1="150" y1="10" x2="150" y2="44"/>${parts.slice(0, err).join("")}</g></svg>
      <div class="word">${word}</div><div class="kb">${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => `<button data-k="${l}" ${got.has(l) ? "disabled" : ""}>${l}</button>`).join("")}</div>`;
  };
  const tap = l => {
    if (!got || got.has(l)) return; got.add(l); if (!w.includes(l)) err++; draw();
    if ([...w].every(x => got.has(x))) c.end({ text: `✅ Trouvé : ${w} (${err} erreur(s))`, scores: [err], low: true, win: true });
    else if (err >= MAXE) c.end({ text: `💀 Perdu ! Le mot était : ${w}` });
  };
  c.box.onclick = e => { const m = e.target.closest("[data-e]"); if (m) { MAXE = Number(m.dataset.e); return start(); } const b = e.target.closest("[data-k]"); if (b) tap(b.dataset.k); };
  keys(c, e => { if (/^[a-z]$/i.test(e.key) && !e.ctrlKey && !e.metaKey) tap(e.key.toUpperCase()); });
  menu();
});

// ---------------- Mastermind ----------------
G({ ...SOLO, id: "mastermind", name: "Mastermind", emoji: "🔐", low: true,
  rules: ["But du jeu : trouver la combinaison secrète de 4 couleurs (les couleurs peuvent se répéter).", "Compose ta proposition puis valide. Pion noir ⚫ = bonne couleur bien placée. Pion blanc ⚪ = bonne couleur mal placée."],
  scoring: ["Ton score est le nombre d'essais (10 maximum). Moins = mieux."], winner: ["Tu gagnes si tu trouves la combinaison en 10 essais ou moins."] }, c => {
  const ALLC = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "🔶"]; let COL = ALLC.slice(0, 6), L = 4, MX = 10, DUP = true, secret, rows, cur;
  const start = () => { secret = DUP ? Array.from({ length: L }, () => rnd(COL.length)) : shuffle(COL.map((_, i) => i)).slice(0, L); rows = []; cur = []; draw(); };
  const fb = g => { let b = 0, w = 0; const s = [...secret], r = []; g.forEach((v, i) => { if (v === s[i]) b++; else r.push(v); }); const rest = secret.filter((v, i) => v !== g[i]); r.forEach(v => { const k = rest.indexOf(v); if (k >= 0) { w++; rest.splice(k, 1); } }); return [b, w]; };
  const draw = () => {
    c.box.innerHTML = `<div class="gbar"><span>Essai <b>${Math.min(rows.length + 1, MX)}/${MX}</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div>
      <div class="mm">${rows.map(r => `<div>${r.g.map(v => COL[v]).join("")} <span>${"⚫".repeat(r.b)}${"⚪".repeat(r.w)}</span></div>`).join("")}</div>
      <div class="mmcur">${Array.from({ length: L }, (_, i) => i).map(i => `<span>${cur[i] !== undefined ? COL[cur[i]] : "⬜"}</span>`).join("")}</div>
      <div class="pills">${COL.map((k, i) => `<button data-c="${i}">${k}</button>`).join("")}</div>
      <div class="row2"><button class="btn" data-a2="back">⌫ Effacer</button><button class="btn main" data-a2="ok" ${cur.length < L ? "disabled" : ""}>Valider</button></div>`;
  };
  c.box.onclick = e => {
    const k = e.target.closest("[data-c]"); if (k && cur.length < L) { cur.push(Number(k.dataset.c)); return draw(); }
    const a = e.target.closest("[data-a2]"); if (!a) return;
    if (a.dataset.a2 === "back") { cur.pop(); return draw(); }
    if (cur.length < L) return; const [b, w] = fb(cur); rows.push({ g: cur, b, w }); cur = []; draw();
    if (b === L) c.end({ text: `✅ Trouvé en ${rows.length} essai(s) !`, scores: [rows.length], low: true, win: true });
    else if (rows.length >= MX) c.end({ text: `❌ Perdu ! C'était ${secret.map(v => COL[v]).join("")}` });
  };
  const h = c.box.onclick;
  menu(c, "Variante du Mastermind", [{ k: "l", label: "📏 Pions à trouver", opts: [[4, "4 (classique)"], [3, "3 (facile)"], [5, "5 (difficile)"]] }, { k: "n", label: "🎨 Couleurs", opts: [[6, "6"], [8, "8"]] }, { k: "m", label: "🔁 Doublons", opts: [[1, "Permis"], [0, "Interdits (plus facile)"]] }, { k: "t", label: "🎯 Essais", opts: [[10, "10"], [8, "8"], [12, "12"]] }], o => { L = o.l; COL = ALLC.slice(0, o.n); DUP = !!o.m; MX = o.t; c.box.onclick = h; start(); });
});

// ---------------- Plus ou moins ----------------
G({ ...SOLO, id: "plus-ou-moins", name: "Plus ou moins", emoji: "🔼", low: true,
  rules: ["But du jeu : trouver le nombre mystère entre 1 et 100.", "À chaque proposition, l'appli te dit si le nombre est plus grand ou plus petit."],
  scoring: ["Ton score est le nombre d'essais (moins = mieux)."], winner: ["Tu gagnes en trouvant le nombre."] }, c => {
  let n, tries, log, lo, hi, R = 100;
  const start = () => { n = 1 + rnd(R); tries = 0; log = []; lo = 1; hi = R; draw(); };
  const menu = () => { c.box.innerHTML = `<p>Choisis la plage du nombre mystère :</p>` + [[10, "1 à 10 · enfant"], [50, "1 à 50"], [100, "1 à 100 · classique"], [1000, "1 à 1000"], [10000, "1 à 10 000 · expert"]].map(([v, l]) => `<button class="btn main" data-r="${v}">${l}</button>`).join(""); };
  const draw = () => {
    c.box.innerHTML = `<div class="gbar"><span>Essais <b>${tries}</b></span><span>Entre <b>${lo}</b> et <b>${hi}</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div>
      <input id="num" type="number" inputmode="numeric" placeholder="Ton nombre…" min="1" max="${R}"><button class="btn main" data-ok="1">Proposer</button>
      <div class="mm">${log.slice().reverse().map(l => `<div>${l}</div>`).join("")}</div>`;
    const i = $("#num"); if (i) i.focus();
  };
  const go = () => {
    const v = Number($("#num").value); if (!v || v < 1 || v > R) return; tries++;
    if (v === n) return c.end({ text: `✅ Trouvé : ${n} en ${tries} essai(s) !`, scores: [tries], low: true, win: true });
    v < n ? (lo = Math.max(lo, v + 1), log.push(`${v} → ⬆️ plus grand`)) : (hi = Math.min(hi, v - 1), log.push(`${v} → ⬇️ plus petit`)); draw();
  };
  c.box.onclick = e => { const r = e.target.closest("[data-r]"); if (r) { R = Number(r.dataset.r); return start(); } if (e.target.closest("[data-ok]")) go(); };
  c.box.onkeydown = e => { if (e.key === "Enter") go(); };
  menu();
});

// ---------------- Snake ----------------
G({ ...SOLO, id: "snake", name: "Snake", emoji: "🐍",
  rules: ["But du jeu : manger des pommes pour grandir sans toucher les murs ni ta propre queue.", "Glisse ton doigt sur la zone de jeu, utilise les flèches du clavier ou les boutons."],
  scoring: ["1 point par pomme mangée."], winner: ["La partie s'arrête à la première collision. Bats ton record !"] }, c => {
  const N = 16; let sn, dir, nd, ap, score, tick, SP = 140, WR = false;
  const dv = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const food = () => { do ap = [rnd(N), rnd(N)]; while (sn.some(s => s[0] === ap[0] && s[1] === ap[1])); };
  const turn = d => { const o = [1, 0, 3, 2][dir]; if (d !== o) nd = d; };
  const paint = () => {
    const cv = $("#cv"), x = cv.getContext("2d"), k = cv.width / N; x.fillStyle = "#0f172a"; x.fillRect(0, 0, cv.width, cv.width);
    x.fillStyle = "#ef4444"; x.beginPath(); x.arc((ap[0] + .5) * k, (ap[1] + .5) * k, k * .4, 0, 7); x.fill();
    sn.forEach((s, i) => { x.fillStyle = i ? "#22c55e" : "#86efac"; x.fillRect(s[0] * k + 1, s[1] * k + 1, k - 2, k - 2); });
  };
  const step = () => {
    dir = nd; const h = [sn[0][0] + dv[dir][0], sn[0][1] + dv[dir][1]]; if (WR) { h[0] = (h[0] + N) % N; h[1] = (h[1] + N) % N; }
    if (h[0] < 0 || h[1] < 0 || h[0] >= N || h[1] >= N || sn.some(s => s[0] === h[0] && s[1] === h[1])) { clearInterval(tick); return c.end({ text: `💀 Game over ! ${score} pomme(s).`, scores: [score], win: score > 0 }); }
    sn.unshift(h); if (h[0] === ap[0] && h[1] === ap[1]) { score++; food(); $("#sc").textContent = score; } else sn.pop(); paint();
  };
  const begin = () => {
  c.box.innerHTML = `<div class="gbar"><span>Score <b id="sc">0</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div><canvas id="cv" width="320" height="320" class="cv"></canvas>
    <div class="dpad"><button data-m="2">⬆️</button><div><button data-m="0">⬅️</button><button data-m="3">⬇️</button><button data-m="1">➡️</button></div></div>`;
  sn = [[8, 8], [7, 8], [6, 8]]; dir = nd = 1; score = 0; food(); paint();
  c.box.onclick = e => { const b = e.target.closest("[data-m]"); if (b) turn(Number(b.dataset.m)); };
  swipe($("#cv"), turn); keys(c, e => { const d = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 }[e.key]; if (d !== undefined) { e.preventDefault(); turn(d); } });
  tick = timer(c, step, SP); };
  const mn = () => { c.box.innerHTML = `<p>Vitesse</p>` + [[200, "🐢 Lent"], [140, "🐍 Normal"], [90, "⚡ Rapide"]].map(([v, l]) => `<button class="choice ${SP === v ? "on" : ""}" data-sp="${v}"><span>${l}</span></button>`).join("") + `<button class="choice ${WR ? "on" : ""}" data-wr="1"><span>🌀 Murs traversants<br><small>Sortir d'un côté fait revenir de l'autre</small></span><small>${WR ? "oui" : "non"}</small></button><button class="btn main" data-go="1">▶️ Jouer</button>`; };
  c.box.onclick = e => { const b = e.target.closest("[data-sp],[data-wr],[data-go]"); if (!b) return; if (b.dataset.go) return begin(); if (b.dataset.sp) SP = Number(b.dataset.sp); else WR = !WR; mn(); };
  mn();
});

// ---------------- Allume-toi (Lights Out) ----------------
G({ ...SOLO, id: "lights-out", name: "Lights Out", emoji: "💡", low: true,
  rules: ["But du jeu : éteindre toutes les lumières de la grille.", "Toucher une case inverse son état et celui de ses 4 voisines (haut, bas, gauche, droite)."],
  scoring: ["Ton score est le nombre de coups (moins = mieux)."], winner: ["Tu gagnes quand toute la grille est éteinte."] }, c => {
  let g, moves, N = 5;
  const press = i => { const x = i % N, y = Math.floor(i / N); [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < N && ny < N) g[ny * N + nx] ^= 1; }); };
  const start = () => { g = Array(N * N).fill(0); moves = 0; for (let k = 0; k < N * 2 + 2; k++) press(rnd(N * N)); if (!g.some(Boolean)) press(N * N >> 1); draw(); };
  const draw = () => { c.box.innerHTML = `<div class="gbar"><span>Coups <b>${moves}</b></span><span>Record <b>${c.best() ?? "—"}</b></span></div><div class="lo" style="grid-template-columns:repeat(${N},1fr)">${g.map((v, i) => `<button class="${v ? "on" : ""}" data-i="${i}"></button>`).join("")}</div>`; };
  c.box.onclick = e => { const z = e.target.closest("[data-sz]"); if (z) { N = Number(z.dataset.sz); return start(); } const b = e.target.closest("[data-i]"); if (!b) return; press(Number(b.dataset.i)); moves++; draw(); if (!g.some(Boolean)) c.end({ text: `✅ Éteint en ${moves} coups !`, scores: [moves], low: true, win: true }); };
  c.box.innerHTML = `<p>Choisis la taille de la grille :</p><button class="btn main" data-sz="3">3 × 3 <small>facile</small></button><button class="btn main" data-sz="5">5 × 5 <small>classique</small></button><button class="btn main" data-sz="7">7 × 7 <small>expert</small></button>`;
});

// ---------------- Réflexes ----------------
G({ ...SOLO, id: "reflexes", name: "Test de réflexes", emoji: "⚡", low: true,
  rules: ["But du jeu : toucher l'écran le plus vite possible quand il passe au vert.", "Si tu touches trop tôt (rouge), la manche est annulée. 5 manches."],
  scoring: ["Ton score est la moyenne de tes 5 temps en millisecondes (moins = mieux)."], winner: ["Compare-toi à tes amis et à ton record."] }, c => {
  let rounds = [], state = "idle", t0 = 0, to, RN = 5, TR = false;
  const draw = (cls, txt, sub = "") => { c.box.innerHTML = `<div class="gbar"><span>Manche <b>${Math.min(rounds.length + 1, RN)}/${RN}</b></span><span>Record <b>${c.best() ?? "—"} ms</b></span></div><button class="react ${cls}" data-r="1"><b>${txt}</b><small>${sub}</small></button><div class="mm">${rounds.map((r, i) => `<div>Manche ${i + 1} : ${r} ms</div>`).join("")}</div>`; };
  const wait = () => { state = "wait"; draw("red", "Attends le vert…"); const go = () => { state = "go"; t0 = performance.now(); draw("green", "TOUCHE !"); };
    to = later(c, () => { if (TR && Math.random() < .5) { draw("amber", "⚠️ Piège… attends !"); to = later(c, go, 900 + rnd(1500)); } else go(); }, 1200 + rnd(3000)); };
  c.box.onclick = e => {
    if (!e.target.closest("[data-r]")) return;
    if (state === "idle") return wait();
    if (state === "wait") { clearTimeout(to); state = "idle"; return draw("amber", "Trop tôt !", "Touche pour recommencer cette manche"); }
    if (state === "go") {
      rounds.push(Math.round(performance.now() - t0)); state = "idle";
      if (rounds.length === RN) { const avg = Math.round(rounds.reduce((a, b) => a + b) / RN); return c.end({ text: `⚡ Moyenne : ${avg} ms`, scores: [avg], low: true, win: true }); }
      draw("blue", rounds[rounds.length - 1] + " ms", "Touche pour la manche suivante");
    }
  };
  const h = c.box.onclick;
  menu(c, "Variante du Test de réflexes", [{ k: "n", label: "🔢 Manches", opts: [[5, "5"], [3, "3"], [10, "10"]] }, { k: "t", label: "🎮 Mode", opts: [[0, "Classique"], [1, "⚠️ Pièges (faux signaux orange)"]] }], o => { RN = o.n; TR = !!o.t; c.box.onclick = h; draw("blue", "Touche pour commencer"); });
});

// ---------------- Pierre-feuille-ciseaux ----------------
G({ id: "pfc", name: "Pierre-feuille-ciseaux", emoji: "✊", cat: "Duel", min: 1, max: 1, dp: 1,
  rules: ["But du jeu : battre l'IA en 3 manches gagnantes.", "La pierre bat les ciseaux, les ciseaux battent la feuille, la feuille bat la pierre."],
  scoring: ["1 point par manche gagnée."], winner: ["Le premier à 3 manches gagne."] }, c => {
  const F = ["✊", "✋", "✌️"], N = ["Pierre", "Feuille", "Ciseaux"]; let a = 0, b = 0, msg = "Fais ton choix !";
  const draw = () => { c.box.innerHTML = `<div class="gbar"><span>Toi <b>${a}</b></span><span>IA <b>${b}</b></span></div><p class="big">${msg}</p><div class="pfc">${F.map((f, i) => `<button data-i="${i}">${f}<small>${N[i]}</small></button>`).join("")}</div>`; };
  c.box.onclick = e => {
    const k = e.target.closest("[data-i]"); if (!k) return; const m = Number(k.dataset.i), o = rnd(3);
    if (m === o) msg = `${F[m]} contre ${F[o]} : égalité`; else if ((m + 2) % 3 === o) { a++; msg = `${F[m]} bat ${F[o]} : +1 pour toi !`; } else { b++; msg = `${F[o]} bat ${F[m]} : +1 pour l'IA`; }
    draw(); if (a === 3 || b === 3) c.end({ text: a === 3 ? "🏆 Tu gagnes !" : "🤖 L'IA gagne…", names: [c.players[0], "🤖 IA"], scores: [a, b] });
  };
  draw();
});

// ---------------- Morpion ----------------
const LINES3 = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
G({ id: "morpion", name: "Morpion", emoji: "⭕", cat: "Duel", min: 1, max: 2, dp: 1,
  rules: ["But du jeu : aligner 3 symboles (horizontal, vertical ou diagonal).", "Choisis « 1 joueur » pour affronter l'IA, ou « 2 joueurs » pour jouer à deux sur le même téléphone."],
  scoring: ["1 point par partie gagnée."], winner: ["Le premier qui aligne 3 symboles gagne. Grille pleine : égalité."] }, c => {
  const vsIA = c.players.length < 2, names = [c.players[0], vsIA ? "🤖 IA" : c.players[1]]; let b, turn, score = [0, 0], over;
  const win = (s, p) => LINES3.some(l => l.every(i => s[i] === p));
  const mm = (s, p) => { // renvoie [valeur pour X(0), coup]
    if (win(s, 0)) return [1]; if (win(s, 1)) return [-1]; const m = s.map((v, i) => v === null ? i : -1).filter(i => i >= 0); if (!m.length) return [0];
    let best = p === 0 ? -2 : 2, mv = m[0]; for (const i of shuffle(m)) { s[i] = p; const v = mm(s, 1 - p)[0]; s[i] = null; if (p === 0 ? v > best : v < best) { best = v; mv = i; } } return [best, mv];
  };
  const reset = () => { b = Array(9).fill(null); turn = 0; over = false; draw(); };
  const draw = (msg) => { c.box.innerHTML = `<div class="gbar"><span>❌ ${names[0]} <b>${score[0]}</b></span><span>⭕ ${names[1]} <b>${score[1]}</b></span></div><p class="big">${msg || (over ? "" : `Tour de ${["❌", "⭕"][turn]} ${names[turn]}`)}</p>
    <div class="ttt">${b.map((v, i) => `<button data-i="${i}">${v === null ? "" : ["❌", "⭕"][v]}</button>`).join("")}</div>
    ${over ? `<button class="btn main" data-n="1">Manche suivante</button><button class="btn" data-f="1">🏁 Terminer</button>` : ""}`; };
  const after = () => {
    if (win(b, 0) || win(b, 1)) { const w = win(b, 0) ? 0 : 1; score[w]++; over = true; draw(`🏆 ${names[w]} gagne la manche !`); }
    else if (b.every(v => v !== null)) { over = true; draw("🤝 Égalité"); } else { turn = 1 - turn; draw(); if (vsIA && turn === 1) later(c, ia, 350); }
  };
  const ia = () => { const m = b.map((v, i) => v === null ? i : -1).filter(i => i >= 0); const i = Math.random() < .15 ? pick(m) : mm([...b], 1)[1]; b[i] = 1; after(); };
  c.box.onclick = e => {
    if (e.target.closest("[data-n]")) return reset(); if (e.target.closest("[data-f]")) return c.end({ text: "Partie terminée", names, scores: score });
    const k = e.target.closest("[data-i]"); if (!k || over || (vsIA && turn === 1)) return; const i = Number(k.dataset.i); if (b[i] !== null) return; b[i] = turn; after();
  };
  reset();
});

// ---------------- Puissance 4 ----------------
G({ id: "puissance4", name: "Puissance 4", emoji: "🔴", cat: "Duel", min: 1, max: 2, dp: 1,
  rules: ["But du jeu : aligner 4 jetons de sa couleur (ligne, colonne ou diagonale).", "Touche une colonne pour y faire tomber ton jeton. « 1 joueur » = contre l'IA, « 2 joueurs » = à deux sur le même téléphone."],
  scoring: ["1 point par partie gagnée."], winner: ["Le premier qui aligne 4 jetons gagne. Grille pleine : égalité."] }, c => {
  const W = 7, H = 6, vsIA = c.players.length < 2, names = [c.players[0], vsIA ? "🤖 IA" : c.players[1]]; let g, turn, score = [0, 0], over;
  const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H ? g[y * W + x] : null;
  const four = (p, gg = g) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { let k = 0; for (; k < 4; k++) { const nx = x + dx * k, ny = y + dy * k; if (nx < 0 || ny < 0 || nx >= W || ny >= H || gg[ny * W + nx] !== p) break; } if (k === 4) return true; } return false; };
  const drop = (gg, x, p) => { for (let y = H - 1; y >= 0; y--) if (gg[y * W + x] === null) { gg[y * W + x] = p; return y; } return -1; };
  const heur = gg => { let s = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { let a = 0, b = 0, ok = true; for (let k = 0; k < 4; k++) { const nx = x + dx * k, ny = y + dy * k; if (nx < 0 || ny < 0 || nx >= W || ny >= H) { ok = false; break; } const v = gg[ny * W + nx]; if (v === 1) a++; else if (v === 0) b++; } if (ok) { if (!b) s += [0, 1, 4, 20][a] || 0; if (!a) s -= [0, 1, 4, 20][b] || 0; } } for (let y = 0; y < H; y++) if (gg[y * W + 3] === 1) s += 3; return s; };
  const search = (gg, d, al, be, p) => {
    if (four(1, gg)) return [1e5 + d]; if (four(0, gg)) return [-1e5 - d]; if (!d || gg.every(v => v !== null)) return [heur(gg)];
    let best = p === 1 ? -Infinity : Infinity, mv = 3; const order = [3, 2, 4, 1, 5, 0, 6];
    for (const x of order) { if (gg[x] !== null) continue; const n = [...gg]; drop(n, x, p); const v = search(n, d - 1, al, be, 1 - p)[0];
      if (p === 1 ? v > best : v < best) { best = v; mv = x; } if (p === 1) al = Math.max(al, v); else be = Math.min(be, v); if (be <= al) break; }
    return [best, mv];
  };
  const reset = () => { g = Array(W * H).fill(null); turn = 0; over = false; draw(); };
  const draw = msg => { c.box.innerHTML = `<div class="gbar"><span>🔴 ${names[0]} <b>${score[0]}</b></span><span>🟡 ${names[1]} <b>${score[1]}</b></span></div><p class="big">${msg || (over ? "" : `Tour de ${["🔴", "🟡"][turn]} ${names[turn]}`)}</p>
    <div class="p4">${Array.from({ length: W }, (_, x) => `<button class="col" data-x="${x}">${Array.from({ length: H }, (_, y) => { const v = g[y * W + x]; return `<i class="${v === null ? "" : v ? "y" : "r"}"></i>`; }).join("")}</button>`).join("")}</div>
    ${over ? `<button class="btn main" data-n="1">Manche suivante</button><button class="btn" data-f="1">🏁 Terminer</button>` : ""}`; };
  const after = () => {
    if (four(0) || four(1)) { const w = four(0) ? 0 : 1; score[w]++; over = true; draw(`🏆 ${names[w]} gagne la manche !`); }
    else if (g.every(v => v !== null)) { over = true; draw("🤝 Égalité"); } else { turn = 1 - turn; draw(); if (vsIA && turn === 1) later(c, ia, 400); }
  };
  const ia = () => { const x = search([...g], 5, -Infinity, Infinity, 1)[1]; drop(g, x, 1); after(); };
  c.box.onclick = e => {
    if (e.target.closest("[data-n]")) return reset(); if (e.target.closest("[data-f]")) return c.end({ text: "Partie terminée", names, scores: score });
    const k = e.target.closest("[data-x]"); if (!k || over || (vsIA && turn === 1)) return; const x = Number(k.dataset.x); if (g[x] !== null) return; drop(g, x, turn); after();
  };
  reset();
});
