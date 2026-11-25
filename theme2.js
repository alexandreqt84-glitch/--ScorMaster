/* ScoreMaster thème 2 : bento (accueil), juice (totaux), ambiance par famille. Aucune dépendance. */
(() => {
  const root = document.getElementById("root"); if (!root) return;
  const FAM = { Plis: "tapis", Rami: "tapis", "Défausse": "tapis", Combinaisons: "tapis", Capture: "tapis", Mises: "tapis",
    Plateau: "bois", Familial: "bois", "Dés": "neon", "Jeux vidéo": "neon", Sport: "neon", Ambiance: "pop", "Plein air": "pop" };
  let idx = null, last = { k: "", v: [] }, busy = false;
  const index = () => { idx = []; for (const k in window) { try { const a = window[k];
    if (Array.isArray(a) && a[0] && a[0].name && a[0].cat) a.forEach(g => g.name && g.cat && idx.push([g.name, g.cat])); } catch (e) {} }
    idx.sort((x, y) => y[0].length - x[0].length); };
  const family = () => { if (!/^#\/(partie|jeu\/)/.test(location.hash)) return "";
    if (!idx) index(); const t = root.textContent.slice(0, 400); const g = idx.find(x => t.includes(x[0])); return g ? FAM[g[1]] || "" : ""; };
  const spark = c => { for (let i = 0; i < 8; i++) { const s = document.createElement("i"), a = Math.PI * 2 * i / 8 + Math.random() * .6, d = 22 + Math.random() * 18;
    s.className = "sp"; s.style.setProperty("--x", Math.cos(a) * d + "px"); s.style.setProperty("--y", Math.sin(a) * d + "px"); c.appendChild(s); setTimeout(() => s.remove(), 750); } };
  const run = () => { if (busy) return; busy = true; obs.disconnect();
    try {
      const home = /^#?\/?$/.test(location.hash);
      root.classList.toggle("bento", home);
      if (home) { const t = [...root.children].filter(c => {
          const h = c.querySelector("h2"); const cur = h && /Partie en cours/.test(h.textContent);
          c.classList.toggle("cur", !!cur); const on = cur || c.classList.contains("daily"); c.classList.toggle("tile", on); c.classList.remove("wide"); return on; });
        if (t.length % 2) t[t.length - 1].classList.add("wide"); }
      const f = family(); f ? document.body.dataset.fam = f : delete document.body.dataset.fam;
      const cells = [...root.querySelectorAll("tfoot td")], now = cells.map(c => c.textContent);
      if (last.k === location.hash) cells.forEach((c, i) => { if (last.v[i] !== undefined && last.v[i] !== now[i]) { c.classList.add("pop"); spark(c); if (navigator.vibrate) navigator.vibrate(12); } });
      last = { k: location.hash, v: now };
    } catch (e) { console.log("theme2", e); }
    obs.observe(root, { childList: true }); busy = false; };
  const obs = new MutationObserver(() => requestAnimationFrame(run));
  window.addEventListener("hashchange", () => requestAnimationFrame(run));
  run();
})();
