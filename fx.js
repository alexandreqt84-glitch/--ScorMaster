// ScoreMaster v1.3.0 — effets visuels : ondulation des boutons, projecteur sur les cartes, compteurs animés, confettis
const FX = (() => {
  const calm = () => (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) || !Core.opt("fond");

  // ondulation au toucher sur les boutons
  document.addEventListener("pointerdown", e => {
    const b = e.target.closest(".btn"); if (!b || calm()) return;
    const r = b.getBoundingClientRect(), s = document.createElement("span");
    s.className = "rip"; s.style.left = (e.clientX - r.left) + "px"; s.style.top = (e.clientY - r.top) + "px";
    b.appendChild(s); setTimeout(() => s.remove(), 650);
  });

  // projecteur lumineux qui suit le pointeur
  let lit = null;
  document.addEventListener("pointermove", e => {
    if (calm() || e.pointerType !== "mouse") return;
    const c = e.target.closest && e.target.closest(".card, .menu a");
    if (lit && lit !== c) lit.classList.remove("lit");
    if (!c) { lit = null; return; }
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    c.classList.add("lit"); lit = c;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { if (lit) lit.classList.remove("lit"); lit = null; });

  // compteurs qui montent jusqu'à leur valeur
  function countUp(root) {
    if (calm()) return;
    root.querySelectorAll(".kpis b, .rk em").forEach(el => {
      const m = el.textContent.match(/^(-?\d+)(.*)$/); if (!m) return;
      const end = +m[1], suf = m[2], t0 = performance.now(), dur = 600;
      if (!end) return;
      (function step(t) {
        const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3)));
        el.textContent = v + suf; if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  // confettis
  function confetti(n = 140) {
    if (calm() || !Core.opt("confetti")) return;
    let cv = document.getElementById("confetti");
    if (!cv) { cv = document.createElement("canvas"); cv.id = "confetti"; document.body.appendChild(cv); }
    const ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cols = document.body.dataset.mode === "autres" ? ["#2563eb", "#22d3ee", "#14b8a6", "#38bdf8", "#a5f3fc", "#fff"] : ["#e11d48", "#f59e0b", "#fb7185", "#facc15", "#fda4af", "#fff"];
    const ps = Array.from({ length: n }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 15 - 4,
      w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[Math.floor(Math.random() * cols.length)] }));
    let f = 0;
    (function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => { p.vy += .38; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - f / 150); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (++f < 150) requestAnimationFrame(tick); else cv.remove();
    })();
  }

  // préférences appliquées à toute l'appli
  function apply() { document.body.classList.toggle("calme", !Core.opt("fond")); document.body.classList.toggle("grand", !!Core.opt("grand")); }
  // vibration légère au toucher
  document.addEventListener("pointerdown", e => { if (Core.opt("haptic") && navigator.vibrate && e.target.closest(".btn,.choice,.tabs a,.chips button,.sw")) navigator.vibrate(8); });
  // petit message temporaire
  let tt;
  function toast(msg) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2200);
  }
  // écran qui reste allumé pendant une partie
  let lock = null;
  async function veille(on) {
    try {
      if (on && Core.opt("veille") && navigator.wakeLock && !lock) { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); }
      else if (!on && lock) { await lock.release(); lock = null; }
    } catch (e) { lock = null; }
  }
  // petits sons d'interface
  const SFX = { ok: [[660, 70], [880, 110]], undo: [[520, 90], [390, 120]], star: [[880, 70], [1175, 130]], win: [[523, 110], [659, 110], [784, 110], [1047, 260]] };
  function sfx(k) {
    if (!Core.opt("sound")) return;
    try {
      const a = sfx.a || (sfx.a = new (window.AudioContext || window.webkitAudioContext)()); let t = a.currentTime;
      (SFX[k] || []).forEach(([f, ms]) => { const o = a.createOscillator(), g = a.createGain(); o.type = "sine"; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + ms / 1000);
        o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + ms / 1000 + .02); t += ms / 1000 * .85; });
    } catch (e) {}
  }
  return { countUp, confetti, apply, toast, veille, sfx };
})();
document.querySelectorAll("[data-ver]").forEach(el => el.textContent = "v" + Core.VERSION);
