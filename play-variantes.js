// Variantes (lot 4) : Cochon, Quiz, Action ou Vérité — remplace les versions simples de play-party.js
function menu(c, title, defs, go) {
  const o = {}; defs.forEach(d => o[d.k] = d.opts[0][0]);
  const draw = () => { c.box.innerHTML = `<h2>${title}</h2>` + defs.map(d => `<p class="empty">${d.label}</p><div class="picker2">${d.opts.map(([v, l]) => `<button class="choice ${o[d.k] === v ? "on" : ""}" data-k="${d.k}" data-v="${v}"><span>${l}</span></button>`).join("")}</div>`).join("") + `<button class="btn main" data-go="1">▶️ Commencer</button>`; };
  c.box.onclick = e => { const b = e.target.closest("[data-k],[data-go]"); if (!b) return; if (b.dataset.go) return go(o); o[b.dataset.k] = isNaN(b.dataset.v) ? b.dataset.v : Number(b.dataset.v); draw(); };
  draw();
}
const meta = (id, rules) => { const x = CAT_AUTRES.find(g => g.id === id); if (x) x.rules = [...x.rules, ...rules]; };

// ---------- Cochon ----------
meta("cochon", ["Variantes : objectif 50/100/150 ; 2 dés (Big Pig : un 1 = tour perdu, double 1 = score total remis à 0) ; IA prudente, normale ou audacieuse."]);
PLAY.cochon = c => menu(c, "Variante de Cochon", [
  { k: "t", label: "🎯 Objectif", opts: [[50, "50"], [100, "100"], [150, "150"]] },
  { k: "d", label: "🎲 Dés", opts: [[1, "1 dé (classique)"], [2, "2 dés (Big Pig)"]] },
  { k: "i", label: "🤖 IA (si tu joues seul)", opts: [[18, "Normale"], [10, "Prudente"], [28, "Audacieuse"]] }], o => {
  const vsIA = c.players.length < 2, P = vsIA ? [c.players[0], "🤖 IA"] : c.players, T = P.map(() => 0), F = "⚀⚁⚂⚃⚄⚅"; let turn = 0, run = 0, last = [], msg = "", busy = false;
  const draw = () => {
    c.box.innerHTML = `<div class="gbar yb">${P.map((n, i) => `<span class="${i === turn ? "now" : ""}">${E(n)} <b>${T[i]}</b></span>`).join("")}</div>
      <p class="big">Tour de <b>${E(P[turn])}</b> · objectif ${o.t}</p><div class="bigdie">${last.length ? last.map(x => F[x - 1]).join(" ") : "🎲"}</div><p class="big">${msg}</p><p class="empty">Points du tour : <b>${run}</b> · total si tu gardes : <b>${T[turn] + run}</b></p>
      ${vsIA && turn === 1 ? "" : `<button class="btn main" data-r="1">🎲 Lancer</button><button class="btn" data-h="1" ${run ? "" : "disabled"}>✋ Garder ${run} points</button>`}`;
  };
  const next = () => { run = 0; turn = (turn + 1) % P.length; draw(); if (vsIA && turn === 1) later(c, bot, 700); };
  const lose = m => { msg = m; run = 0; busy = true; draw(); later(c, () => { busy = false; msg = ""; last = []; next(); }, 1200); };
  const roll = () => {
    last = Array.from({ length: o.d }, () => 1 + rnd(6));
    if (o.d === 2 && last[0] === 1 && last[1] === 1) { T[turn] = 0; return lose(`💥💥 Double 1 : ${P[turn]} retombe à 0 !`); }
    if (last.includes(1)) return lose(`💥 ${P[turn]} fait 1 : tour perdu !`);
    run += last[0] + (last[1] || 0); msg = ""; draw();
  };
  const keep = () => { T[turn] += run; if (T[turn] >= o.t) { draw(); return c.end({ text: `🏆 ${P[turn]} atteint ${T[turn]} points !`, names: P, scores: T, win: true }); } last = []; msg = `${P[turn]} garde ses points.`; next(); };
  const bot = () => { if (turn !== 1 || busy) return; if (run >= o.i || T[1] + run >= o.t) return keep(); roll(); if (!busy && turn === 1) later(c, bot, 800); };
  c.box.onclick = e => { if (busy || (vsIA && turn === 1)) return; if (e.target.closest("[data-r]")) roll(); else if (e.target.closest("[data-h]") && run) keep(); };
  draw();
});

// ---------- Quiz ----------
meta("quiz", ["Variantes : 5, 10 ou 15 questions par joueur ; 💀 Mort subite (une erreur = éliminé) ; ⏱️ Chrono de 15 s (+1 point bonus si tu réponds avant 7 s) ; 🃏 Joker 50/50 (1 par joueur)."]);
PLAY.quiz = c => menu(c, "Variante du Quiz", [
  { k: "n", label: "📏 Questions par joueur", opts: [[5, "5"], [10, "10"], [15, "15"]] },
  { k: "m", label: "🎮 Mode", opts: [["norm", "Classique"], ["sub", "💀 Mort subite"], ["chrono", "⏱️ Chrono 15 s"]] },
  { k: "j", label: "🃏 Joker 50/50", opts: [[0, "Non"], [1, "Oui, 1 par joueur"]] }], o => {
  const P = c.players, total = Math.min(QUIZ.length, Math.max(10, o.n * P.length)), qs = shuffle(QUIZ).slice(0, total), S = P.map(() => 0), dead = P.map(() => false), J = P.map(() => o.j);
  let n = 0, who = 0, ans = null, opts = [], hid = [], t = 15, gen = 0;
  const q = () => qs[n];
  const tick = g => { if (g !== gen || ans !== null) return; t--; const el = $("#qt"); if (el) el.textContent = t; if (t <= 0) answer(""); else later(c, () => tick(g), 1000); };
  const answer = a => { ans = a; gen++; if (a === q()[1]) S[who] += 1 + (o.m === "chrono" && t >= 8 ? 1 : 0); else if (o.m === "sub") dead[who] = true; show(); };
  const show = () => {
    const x = q(); if (ans === null && !opts.length) { opts = shuffle(x.slice(1)); hid = []; t = 15; if (o.m === "chrono") { const g = ++gen; later(c, () => tick(g), 1000); } }
    c.box.innerHTML = `<div class="gbar yb">${P.map((p, i) => `<span class="${i === who ? "now" : ""}">${dead[i] ? "💀 " : ""}${E(p)} <b>${S[i]}</b></span>`).join("")}</div>
      <p class="empty">Question ${n + 1}/${total} · pour <b>${E(P[who])}</b>${o.m === "chrono" && ans === null ? ` · ⏱️ <b id="qt">${t}</b> s` : ""}</p><h2 class="qq">${E(x[0])}</h2>
      ${opts.filter(a => ans !== null || !hid.includes(a)).map(a => `<button class="choice ${ans !== null ? (a === x[1] ? "good" : a === ans ? "bad" : "") : ""}" data-o="${E(a)}" ${ans !== null ? "disabled" : ""}><span>${E(a)}</span></button>`).join("")}
      ${ans === null && J[who] ? `<button class="btn" data-jk="1">🃏 Joker 50/50</button>` : ""}
      ${ans !== null ? `<button class="btn main" data-nx="1">${n + 1 === total ? "🏁 Voir le résultat" : "Question suivante"}</button>` : ""}`;
  };
  c.box.onclick = e => {
    const a = e.target.closest("[data-o]"); if (a && ans === null) return answer(a.dataset.o);
    if (e.target.closest("[data-jk]") && ans === null && J[who]) { J[who]--; hid = shuffle(opts.filter(v => v !== q()[1])).slice(0, 2); return show(); }
    if (e.target.closest("[data-nx]")) {
      const alive = dead.filter(d => !d).length; n++;
      if (n >= total || alive < (P.length > 1 ? 2 : 1)) { const w = o.m === "sub" && P.length > 1 ? dead.indexOf(false) : -1; if (w >= 0) S[w] += 3; return c.end({ text: w >= 0 ? `💀 ${P[w]} est le dernier survivant (+3) !` : "🏁 Quiz terminé !", scores: S, win: true }); }
      do who = (who + 1) % P.length; while (dead[who]); ans = null; opts = []; show();
    }
  };
  show();
});

// ---------- Action ou Vérité ----------
const VER_H = ["Quel est ton plus gros mensonge récent ?", "Quelle est la chose la plus honteuse dans ton historique de recherche ?", "Quel message regrettes-tu d'avoir envoyé ?", "Quel joueur ici trouves-tu le plus drôle, et le moins drôle ?", "Quel est ton pire rendez-vous galant ?", "Quelle personne ici aimerais-tu avoir comme voisin(e) ? Et jamais ?", "Quel secret n'as-tu jamais avoué à tes parents ?", "Quelle est la pire chose que tu aies dite sur quelqu'un dans son dos ?"];
const ACT_H = ["Laisse le groupe envoyer un SMS de leur choix à un de tes contacts (validé par toi).", "Appelle un proche et chante-lui « Joyeux anniversaire » (même hors date).", "Laisse un joueur te dessiner une moustache au stylo lavable.", "Fais 20 secondes de danse la plus ridicule possible.", "Lis à voix haute ton dernier message envoyé.", "Parle sans jamais dire « oui » ni « non » jusqu'à ton prochain tour.", "Fais une pub pour un objet choisi par le groupe, avec la voix d'un présentateur télé.", "Laisse le groupe choisir ta photo de profil pour la journée."];
const ACT_G = ["Tout le monde imite un animal : le moins convaincant fait un gage.", "Tout le monde chante un refrain : le groupe vote le pire, qui boit une gorgée d'eau !", "Défi du silence : le premier qui rit ou parle perd.", "Tout le monde désigne du doigt, en même temps, le plus susceptible de gagner à ce jeu."];
meta("action-verite", ["Variantes : niveau Tout public / Piquant / Mélange ; 🃏 cartes bonus (Joker pour passer un défi, Défi de groupe, Échange) ; ⭐ compteur de points optionnel."]);
PLAY["action-verite"] = c => menu(c, "Variante d'Action ou Vérité", [
  { k: "l", label: "🌶️ Niveau", opts: [["soft", "😇 Tout public"], ["hot", "🌶️ Piquant"], ["mix", "🎲 Mélange"]] },
  { k: "b", label: "🃏 Cartes bonus", opts: [[0, "Non"], [1, "Oui : Joker, Défi de groupe, Échange"]] },
  { k: "s", label: "⭐ Points", opts: [[0, "Non"], [1, "Oui, +1 par défi relevé"]] }], o => {
  const { ACT, V } = engine(c), P = c.players, pts = P.map(() => 0), jk = P.map(() => 0), pool = (a, b) => shuffle(o.l === "soft" ? a : o.l === "hot" ? b : [...a, ...b]);
  let bag = [], cur = -1, va = pool(VER, VER_H), aa = pool(ACTS, ACT_H);
  const nextP = () => { if (!bag.length) bag = shuffle(P.map((_, i) => i)).filter(i => i !== cur); cur = bag.pop(); };
  const bar = () => o.s || o.b ? `<div class="gbar yb">${P.map((p, i) => `<span class="${i === cur ? "now" : ""}">${E(p)}${o.s ? ` <b>${pts[i]}</b>` : ""}${jk[i] ? " 🃏" + jk[i] : ""}</span>`).join("")}</div>` : "";
  const start = () => { nextP(); V(`${bar()}<div class="passbox"><div class="bigdie">🎯</div><h2>C'est au tour de ${E(P[cur])}</h2><p>Action ou vérité ?</p></div><div class="row2"><button class="btn main" data-act="a">💪 Action</button><button class="btn main" data-act="v">🗣️ Vérité</button></div>${o.s ? `<button class="btn" data-act="fin">🏁 Terminer la partie</button>` : ""}`); };
  const card = (t, icon, kind) => { cur0 = kind; V(`${bar()}<div class="passbox"><div class="bigdie">${icon}</div><h2>${E(P[cur])}</h2><p class="big">${E(t)}</p></div>
    ${o.s && kind !== "jk" ? `<button class="btn main" data-act="ok">✅ Relevé (+1)</button>` : ""}<button class="btn ${o.s ? "" : "main"}" data-act="nx">Joueur suivant</button>
    ${kind === "a" || kind === "v" ? `<button class="btn" data-act="re">🔄 Autre ${kind === "a" ? "défi" : "question"}</button>` : ""}${jk[cur] && kind !== "jk" ? `<button class="btn" data-act="use">🃏 Utiliser un Joker (passer)</button>` : ""}`); };
  let cur0 = "";
  const bonus = () => {
    const r = rnd(3);
    if (r === 0) { jk[cur]++; card("Tu gagnes un Joker ! Garde-le pour passer un défi ou une question.", "🃏", "jk"); }
    else if (r === 1) { if (!ACT_G.length) return false; card(pick(ACT_G), "👥", "g"); }
    else { const t = pick(P.map((_, i) => i).filter(i => i !== cur)); card(`Échange ! ${P[t]} prend ta place et choisit Action ou Vérité.`, "🔁", "x"); cur = t; V(`${bar()}<div class="passbox"><div class="bigdie">🔁</div><h2>${E(P[cur])}</h2><p>Tu prends la place : Action ou vérité ?</p></div><div class="row2"><button class="btn main" data-act="a">💪 Action</button><button class="btn main" data-act="v">🗣️ Vérité</button></div>`); }
    return true;
  };
  ACT.a = () => { if (o.b && rnd(5) === 0 && bonus()) return; if (!aa.length) aa = pool(ACTS, ACT_H); card(aa.pop(), "💪", "a"); };
  ACT.v = () => { if (o.b && rnd(5) === 0 && bonus()) return; if (!va.length) va = pool(VER, VER_H); card(va.pop(), "🗣️", "v"); };
  ACT.re = () => cur0 === "a" ? ACT.a() : ACT.v();
  ACT.ok = () => { pts[cur]++; start(); }; ACT.use = () => { jk[cur]--; start(); }; ACT.nx = start;
  ACT.fin = () => c.end({ text: "🏁 Fin de la soirée !", scores: pts, win: true });
  start();
});

// ---------- Lot 5 : duels (Pierre-feuille-ciseaux, Morpion, Puissance 4) ----------
const segs = (W, H, K) => { const L = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) { const l = []; for (let k = 0; k < K; k++) { const nx = x + dx * k, ny = y + dy * k; if (nx < 0 || ny < 0 || nx >= W || ny >= H) break; l.push(ny * W + nx); } if (l.length === K) L.push(l); } return L; };
const manche = (c, names, score, draw, reset) => e => { if (e.target.closest("[data-n]")) return reset(); if (e.target.closest("[data-f]")) c.end({ text: "Partie terminée", names, scores: score }); };
const endBtns = `<button class="btn main" data-n="1">Manche suivante</button><button class="btn" data-f="1">🏁 Terminer</button>`;

// Pierre-feuille-ciseaux
meta("pfc", ["Variantes : 2, 3 ou 5 manches gagnantes ; 🖖 Pierre-feuille-ciseaux-lézard-Spock (5 gestes : ciseaux coupent feuille, feuille couvre pierre, pierre écrase lézard, lézard empoisonne Spock, Spock casse ciseaux, ciseaux décapitent lézard, lézard mange feuille, feuille désavoue Spock, Spock vaporise pierre) ; IA rusée (elle anticipe que tu rejoues le même geste)."]);
PLAY.pfc = c => menu(c, "Variante de Pierre-feuille-ciseaux", [
  { k: "w", label: "🏆 Manches gagnantes", opts: [[3, "3"], [2, "2"], [5, "5"]] },
  { k: "g", label: "✋ Gestes", opts: [[3, "Classique (3)"], [5, "Lézard-Spock (5)"]] },
  { k: "i", label: "🤖 IA", opts: [["rnd", "Hasard"], ["rus", "Rusée"]] }], o => {
  const F = ["✊", "✋", "✌️", "🖖", "🦎"].slice(0, o.g), N = ["Pierre", "Feuille", "Ciseaux", "Spock", "Lézard"], n = o.g;
  const beats = (m, x) => n === 3 ? (m + 2) % 3 === x : [2, 4].includes((x - m + 5) % 5);
  let a = 0, b = 0, last = -1, msg = "Fais ton choix !";
  const draw = () => { c.box.innerHTML = `<div class="gbar"><span>Toi <b>${a}</b></span><span>IA <b>${b}</b></span></div><p class="big">${msg}</p><div class="pfc" style="grid-template-columns:repeat(${n === 5 ? 3 : 3},1fr)">${F.map((f, i) => `<button data-i="${i}">${f}<small>${N[i]}</small></button>`).join("")}</div>`; };
  c.box.onclick = e => {
    const k = e.target.closest("[data-i]"); if (!k) return; const m = Number(k.dataset.i);
    const win = F.map((_, i) => i).filter(i => beats(i, last)), ia = o.i === "rus" && last >= 0 && Math.random() < .6 ? pick(win) : rnd(n); last = m;
    if (m === ia) msg = `${F[m]} contre ${F[ia]} : égalité`; else if (beats(m, ia)) { a++; msg = `${F[m]} bat ${F[ia]} : +1 pour toi !`; } else { b++; msg = `${F[ia]} bat ${F[m]} : +1 pour l'IA`; }
    draw(); if (a === o.w || b === o.w) c.end({ text: a === o.w ? "🏆 Tu gagnes !" : "🤖 L'IA gagne…", names: [c.players[0], "🤖 IA"], scores: [a, b] });
  };
  draw();
});

// Morpion
meta("morpion", ["Variantes : grille 3×3 (aligner 3), 4×4 (aligner 4) ou 5×5 (aligner 4) ; 🙃 Misère : celui qui aligne perd."]);
PLAY.morpion = c => menu(c, "Variante du Morpion", [
  { k: "g", label: "🔲 Grille", opts: [[3, "3×3 · aligner 3"], [4, "4×4 · aligner 4"], [5, "5×5 · aligner 4"]] },
  { k: "m", label: "🎮 Règle", opts: [[0, "Classique"], [1, "🙃 Misère (aligner = perdre)"]] }], o => {
  const vsIA = c.players.length < 2, names = [c.players[0], vsIA ? "🤖 IA" : c.players[1]], N = o.g, K = N === 3 ? 3 : 4, L = segs(N, N, K); let b, turn, score = [0, 0], over;
  const line = (s, p) => L.some(l => l.every(i => s[i] === p));
  const res = (s, last) => line(s, last) ? (o.m ? -1 : 1) : 0; // valeur pour le joueur qui vient de jouer
  const mm = (s, p) => { const m = s.map((v, i) => v === null ? i : -1).filter(i => i >= 0); if (!m.length) return [0]; let best = -2, mv = m[0];
    for (const i of shuffle(m)) { s[i] = p; const r = res(s, p), v = r || -mm(s, 1 - p)[0]; s[i] = null; if (v > best) { best = v; mv = i; } if (best === 1) break; } return [best, mv]; };
  const ia = () => { const m = b.map((v, i) => v === null ? i : -1).filter(i => i >= 0); let i;
    if (N === 3) i = Math.random() < .15 ? pick(m) : mm([...b], 1)[1];
    else { const t = (p, x) => { b[x] = p; const r = line(b, p); b[x] = null; return r; }, w = m.find(x => t(1, x)), bl = m.find(x => t(0, x)), safe = m.filter(x => !t(1, x));
      i = o.m ? pick(safe.length ? safe : m) : w ?? bl ?? pick([...m].sort((x, y) => nb(y) - nb(x)).slice(0, 3)); }
    b[i] = 1; after(); };
  const nb = x => { let s = 0; const X = x % N, Y = Math.floor(x / N); for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const px = X + dx, py = Y + dy; if (px >= 0 && py >= 0 && px < N && py < N && b[py * N + px] === 1) s++; } return s; };
  const reset = () => { b = Array(N * N).fill(null); turn = 0; over = false; draw(); };
  const draw = msg => { c.box.innerHTML = `<div class="gbar"><span>❌ ${E(names[0])} <b>${score[0]}</b></span><span>⭕ ${E(names[1])} <b>${score[1]}</b></span></div><p class="big">${msg || (over ? "" : `Tour de ${["❌", "⭕"][turn]} ${E(names[turn])}`)}</p>
    <div class="ttt" style="grid-template-columns:repeat(${N},1fr)">${b.map((v, i) => `<button data-i="${i}" style="font-size:${N === 3 ? 42 : N === 4 ? 30 : 22}px">${v === null ? "" : ["❌", "⭕"][v]}</button>`).join("")}</div>${over ? endBtns : ""}`; };
  const after = () => { const p = turn;
    if (line(b, p)) { const w = o.m ? 1 - p : p; score[w]++; over = true; draw(`🏆 ${names[w]} gagne la manche !`); }
    else if (b.every(v => v !== null)) { over = true; draw("🤝 Égalité"); } else { turn = 1 - turn; draw(); if (vsIA && turn === 1) later(c, ia, 350); } };
  const fin = manche(c, names, score, draw, reset);
  c.box.onclick = e => { fin(e); const k = e.target.closest("[data-i]"); if (!k || over || (vsIA && turn === 1)) return; const i = Number(k.dataset.i); if (b[i] !== null) return; b[i] = turn; after(); };
  reset();
});

// Puissance 4
meta("puissance4", ["Variantes : Classique (7×6, aligner 4), Puissance 3 (5×5, aligner 3), Puissance 5 (9×7, aligner 5) ; 🙃 Misère (aligner = perdre) ; IA facile, normale ou experte."]);
PLAY.puissance4 = c => menu(c, "Variante de Puissance 4", [
  { k: "v", label: "🔴 Mode", opts: [["p4", "Classique 7×6 · aligner 4"], ["p3", "Puissance 3 · 5×5"], ["p5", "Puissance 5 · 9×7"]] },
  { k: "m", label: "🎮 Règle", opts: [[0, "Classique"], [1, "🙃 Misère (aligner = perdre)"]] },
  { k: "d", label: "🤖 IA", opts: [[4, "Normale"], [2, "Facile"], [6, "Experte"]] }], o => {
  const [W, H, K] = { p4: [7, 6, 4], p3: [5, 5, 3], p5: [9, 7, 5] }[o.v], L = segs(W, H, K), vsIA = c.players.length < 2, names = [c.players[0], vsIA ? "🤖 IA" : c.players[1]], mid = (W - 1) / 2;
  const order = Array.from({ length: W }, (_, i) => i).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid)), D = o.v === "p5" ? Math.min(o.d, 4) : o.d; let g, turn, score = [0, 0], over;
  const four = (p, gg = g) => L.some(l => l.every(i => gg[i] === p));
  const drop = (gg, x, p) => { for (let y = H - 1; y >= 0; y--) if (gg[y * W + x] === null) { gg[y * W + x] = p; return y; } return -1; };
  const heur = gg => { let s = 0; const T = [0, 1, 4, 20, 60]; for (const l of L) { let a = 0, b = 0; for (const i of l) { if (gg[i] === 1) a++; else if (gg[i] === 0) b++; } if (!b) s += T[a] || 0; if (!a) s -= T[b] || 0; } return o.m ? -s : s; };
  const search = (gg, d, al, be, p) => { // 1 = IA maximise ; misère : celui qui aligne perd
    const f1 = four(1, gg), f0 = four(0, gg); if (f1 || f0) return [(f1 ? 1 : -1) * (o.m ? -1 : 1) * (1e5 + d)]; if (!d || gg.every(v => v !== null)) return [gg.every(v => v !== null) ? 0 : heur(gg)];
    let best = p === 1 ? -Infinity : Infinity, mv = order.find(x => gg[x] === null);
    for (const x of order) { if (gg[x] !== null) continue; const n = [...gg]; drop(n, x, p); const v = search(n, d - 1, al, be, 1 - p)[0];
      if (p === 1 ? v > best : v < best) { best = v; mv = x; } if (p === 1) al = Math.max(al, v); else be = Math.min(be, v); if (be <= al) break; } return [best, mv]; };
  const reset = () => { g = Array(W * H).fill(null); turn = 0; over = false; draw(); };
  const draw = msg => { c.box.innerHTML = `<div class="gbar"><span>🔴 ${E(names[0])} <b>${score[0]}</b></span><span>🟡 ${E(names[1])} <b>${score[1]}</b></span></div><p class="big">${msg || (over ? "" : `Tour de ${["🔴", "🟡"][turn]} ${E(names[turn])}`)}</p>
    <div class="p4" style="grid-template-columns:repeat(${W},1fr)">${Array.from({ length: W }, (_, x) => `<button class="col" data-x="${x}">${Array.from({ length: H }, (_, y) => { const v = g[y * W + x]; return `<i class="${v === null ? "" : v ? "y" : "r"}"></i>`; }).join("")}</button>`).join("")}</div>${over ? endBtns : ""}`; };
  const after = () => { const p = turn;
    if (four(p)) { const w = o.m ? 1 - p : p; score[w]++; over = true; draw(`🏆 ${names[w]} gagne la manche !`); }
    else if (g.every(v => v !== null)) { over = true; draw("🤝 Égalité"); } else { turn = 1 - turn; draw(); if (vsIA && turn === 1) later(c, ia, 400); } };
  const ia = () => { drop(g, search([...g], D, -Infinity, Infinity, 1)[1], 1); after(); };
  const fin = manche(c, names, score, draw, reset);
  c.box.onclick = e => { fin(e); const k = e.target.closest("[data-x]"); if (!k || over || (vsIA && turn === 1)) return; const x = Number(k.dataset.x); if (g[x] !== null) return; drop(g, x, turn); after(); };
  reset();
});

// ---------- Lot 6 : descriptions des variantes des jeux solo ----------
meta("2048", ["Variantes : grille 3×3 (objectif 256), 4×4 (2048), 5×5 (4096) ou 6×6 (8192)."]);
meta("demineur", ["Niveaux : Débutant, Facile, Moyen, Difficile, Expert."]);
meta("memory", ["Niveaux : Mini (4 paires), Facile, Moyen, Difficile."]);
meta("taquin", ["Tailles : 3×3, 4×4 ou 5×5."]);
meta("simon", ["Variantes : 4 ou 6 boutons ; vitesse lente / normale / rapide ; sens normal ou à l'envers (tu rejoues la séquence en commençant par la fin)."]);
meta("pendu", ["Difficulté : 10, 7, 5 ou 3 erreurs permises."]);
meta("mastermind", ["Variantes : 3, 4 ou 5 pions ; 6 ou 8 couleurs ; doublons permis ou interdits ; 8, 10 ou 12 essais."]);
meta("plus-ou-moins", ["Plage au choix : 1 à 10, 50, 100, 1000 ou 10 000."]);
meta("snake", ["Variantes : vitesse lente / normale / rapide ; murs traversants."]);
meta("lights-out", ["Grille 3×3, 5×5 ou 7×7."]);
meta("reflexes", ["Variantes : 3, 5 ou 10 manches ; mode Pièges (de faux signaux orange : ne touche pas !)."]);
