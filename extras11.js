// ScoreMaster v2.4.0 : fluidité automatique (Paramètres), listes par paquets, défilement fluide. Chargé après extras10.js.
(function () {
  "use strict";
  const $q = s => document.querySelector(s), upd = (id, h) => { const el = document.getElementById(id); if (el) el.outerHTML = h; };
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; };
  // ---------- FLUIDITÉ AUTO ----------
  const mode = () => ls("sm_eco") || "auto";
  const dec = () => { try { return JSON.parse(ls("sm_autoeco")); } catch (e) { return null; } };
  const apply = () => window.SM_applyEco && window.SM_applyEco();
  const measure = ms => new Promise(res => { let n = 0, t0 = 0; const f = t => { if (!t0) t0 = t; n++; if (t - t0 < ms) requestAnimationFrame(f); else res(Math.min(144, Math.round(1000 * (n - 1) / (t - t0)))); }; requestAnimationFrame(f); });
  async function autoMeasure() { const h = document.documentElement, was = h.classList.contains("eco"); h.classList.remove("eco");
    await new Promise(r => setTimeout(r, 400)); const fps = await measure(1500), eco = fps < 45;
    ls("sm_autoeco", JSON.stringify({ eco, fps, at: Date.now() })); apply(); upd("s-fl", flSec()); return { fps, eco, was }; }
  const flSec = () => { const m = mode(), d = dec(), chip = (v, t) => `<button class="btn ${m === v ? "on" : ""}" data-a="flm" data-v="${v}">${t}</button>`;
    return `<section class="card tools" id="s-fl"><h2>⚡ Fluidité</h2><p class="hint">Réduit les effets qui tournent en continu quand l'appli saccade.</p><div class="chs">${chip("auto", "🤖 Auto")}${chip("on", "⚡ Toujours fluide")}${chip("off", "✨ Tous les effets")}</div>
      ${m === "auto" ? `<p class="hint">${d ? "Dernière mesure : " + d.fps + " images/s → " + (d.eco ? "effets réduits" : "effets complets") + " (" + new Date(d.at).toLocaleDateString("fr-FR") + ")" : "Pas encore mesuré : la mesure se fait toute seule dans quelques secondes."}</p>` : ""}
      <button class="btn" data-a="fltest">📊 Tester ma fluidité maintenant</button><p id="flres" class="hint"></p></section>`; };
  const par0 = PAGES.parametres; PAGES.parametres = function () { return par0.apply(this, arguments) + flSec(); };
  const verdict = f => f >= 55 ? "✅ Excellent" : f >= 40 ? "👍 Correct" : "⚠️ Ça saccade";
  window.addEventListener("load", () => { if (mode() === "auto") { const d = dec(); if (!d || Date.now() - d.at > 14 * 864e5) setTimeout(autoMeasure, 800); } });
  // ---------- LISTES PAR PAQUETS ----------
  const LIM = { historique: 30, soirees: 10, classement: 30 }, STEP = { historique: 30, soirees: 10, classement: 30 };
  function limit(html, key, marker, end, label) { const n = LIM[key], p = html.split(marker), tot = p.length - 1; if (tot <= n) return html;
    const last = p[tot], tail = last.slice(last.indexOf(end) + end.length), kept = p.slice(1, n + 1).join(marker);
    const btn = `<button class="btn main" data-a="more" data-v="${key}">⬇️ Voir plus (${tot - n} ${label} restant${tot - n > 1 ? "s" : ""})</button>`;
    return p[0] + marker + kept + (key === "classement" ? `<div style="padding:8px 0">${btn}</div>` : `<section class="card">${btn}</section>`) + tail; }
  const wrap = (page, key, marker, end, label) => { const f = PAGES[page]; if (!f) return; PAGES[page] = function () { return limit(f.apply(this, arguments), key, marker, end, label); }; };
  wrap("historique", "historique", '<section class="card"><details>', "</details></section>", "partie");
  wrap("soirees", "soirees", '<details class="card soi"', "</details>", "soirée");
  wrap("classement", "classement", '<a class="pl lnk', "</a>", "joueur");
  window.addEventListener("hashchange", () => { LIM.historique = 30; LIM.soirees = 10; LIM.classement = 30; });
  // ---------- DÉFILEMENT FLUIDE ----------
  let sc = false, tm; window.addEventListener("scroll", () => { if (!sc) { sc = true; document.documentElement.classList.add("scrolling"); } clearTimeout(tm); tm = setTimeout(() => { sc = false; document.documentElement.classList.remove("scrolling"); }, 160); }, { passive: true });
  Object.assign(ACTIONS, {
    flm: v => { ls("sm_eco", v); if (v === "auto") { ls("sm_autoeco", ""); apply(); upd("s-fl", flSec()); autoMeasure(); } else { apply(); upd("s-fl", flSec()); } },
    fltest: async () => { const el = $q("#flres"); if (el) el.textContent = "Mesure en cours (2 s)… ne touche pas l'écran."; const f = await measure(2000), el2 = $q("#flres");
      let msg = verdict(f) + " : " + f + " images par seconde."; if (mode() === "auto" && f < 40 && !document.documentElement.classList.contains("eco")) { ls("sm_autoeco", JSON.stringify({ eco: true, fps: f, at: Date.now() })); apply(); upd("s-fl", flSec()); msg += " Effets réduits automatiquement."; }
      const e3 = $q("#flres"); if (e3) e3.textContent = msg; },
    more: k => { LIM[k] += STEP[k]; draw(); }
  });
  draw();
})();
