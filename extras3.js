// ScoreMaster v1.5.0 : courbe d'évolution des scores, image de résultat à partager, export CSV, thème clair/sombre/auto. Chargé après extras2.js.
(function () {
  "use strict";
  const E = Core.esc, COL = ["#f43f5e", "#38bdf8", "#facc15", "#34d399", "#c084fc", "#fb923c", "#f472b6", "#a3e635"];
  // ---------- thème clair / sombre / auto ----------
  const look = () => { try { return localStorage.getItem("sm_look") || "auto"; } catch (e) { return "auto"; } };
  const applyLook = () => { const l = look(), c = l === "clair" || (l === "auto" && matchMedia("(prefers-color-scheme: light)").matches);
    document.body.dataset.look = c ? "clair" : "sombre"; document.documentElement.dataset.look = c ? "clair" : "sombre"; const hb = document.getElementById("lookbtn"); if (hb) hb.textContent = c ? "🌙" : "☀️"; const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = c ? "#f4f1ec" : "#06060d"; };
  const eco = () => { try { return localStorage.getItem("sm_eco") || "auto"; } catch (e) { return "auto"; } };
  const applyEco = () => { const m = eco(); let on = m === "on"; if (m === "auto") { try { const d = JSON.parse(localStorage.getItem("sm_autoeco")); on = !!(d && d.eco); } catch (x) { on = false; } } document.documentElement.classList.toggle("eco", on); };
  window.SM_applyEco = applyEco;
  applyEco(); applyLook(); matchMedia("(prefers-color-scheme: light)").addEventListener && matchMedia("(prefers-color-scheme: light)").addEventListener("change", applyLook);
  // ---------- courbe : total cumulé de chaque joueur, manche après manche ----------
  const chart = p => {
    if (!p || !p.manches || p.manches.length < 2) return "";
    const n = p.joueurs.length, W = 320, H = 170, L = 30, B = 20, T = 10, cum = p.joueurs.map(() => [0]);
    p.manches.forEach(m => m.forEach((x, i) => cum[i].push(cum[i][cum[i].length - 1] + (Number(x) || 0))));
    const all = cum.flat(), mn = Math.min(0, ...all), mx = Math.max(1, ...all), len = p.manches.length;
    const X = k => L + (W - L - 8) * k / len, Y = v => T + (H - T - B) * (1 - (v - mn) / (mx - mn || 1));
    const grid = [0, .5, 1].map(f => { const v = mn + (mx - mn) * f; return `<line x1="${L}" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" stroke="currentColor" opacity=".15"/><text x="${L - 4}" y="${Y(v) + 3}" text-anchor="end" font-size="9" fill="currentColor" opacity=".7">${Math.round(v)}</text>`; }).join("");
    const lines = cum.map((c, i) => `<polyline fill="none" stroke="${COL[i % 8]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" points="${c.map((v, k) => X(k) + "," + Y(v)).join(" ")}"/><circle cx="${X(len)}" cy="${Y(c[len])}" r="3.5" fill="${COL[i % 8]}"/>`).join("");
    const leg = p.joueurs.map((nm, i) => `<span style="display:inline-flex;align-items:center;gap:5px;margin:2px 10px 2px 0"><i style="width:10px;height:10px;border-radius:50%;background:${COL[i % 8]}"></i><small>${E(nm)}</small></span>`).join("");
    return `<section class="card"><h2>📈 Évolution des scores</h2><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Courbe des scores par manche" style="color:var(--soft)">${grid}${lines}<text x="${L}" y="${H - 5}" font-size="9" fill="currentColor" opacity=".7">manche 0</text><text x="${W - 8}" y="${H - 5}" text-anchor="end" font-size="9" fill="currentColor" opacity=".7">manche ${len}</text></svg><div>${leg}</div></section>`;
  };
  const partie0 = PAGES.partie, fin0 = PAGES.fin, outils0 = PAGES.outils;
  PAGES.partie = function () { return partie0.apply(this, arguments) + chart(S.cur); };
  PAGES.fin = function () { const h = fin0.apply(this, arguments);
    return h + (S.last ? chart(S.last) + `<section class="card"><button class="btn main" data-a="shareimg">🖼️ Partager l'image du résultat</button></section>` : ""); };
  // ---------- image de résultat (canvas 1080×1350) ----------
  async function shareImg() {
    const p = S.last; if (!p) return; const rk = Core.ranking(p), cs = document.createElement("canvas"); cs.width = 1080; cs.height = 1350; const c = cs.getContext("2d");
    const st = getComputedStyle(document.body), a1 = st.getPropertyValue("--a1").trim() || "#e11d48", a2 = st.getPropertyValue("--a2").trim() || "#f59e0b";
    c.fillStyle = "#0a0a16"; c.fillRect(0, 0, 1080, 1350);
    let g = c.createRadialGradient(200, 100, 20, 200, 100, 900); g.addColorStop(0, a1 + "aa"); g.addColorStop(1, "transparent"); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    g = c.createRadialGradient(950, 1250, 20, 950, 1250, 800); g.addColorStop(0, a2 + "66"); g.addColorStop(1, "transparent"); c.fillStyle = g; c.fillRect(0, 0, 1080, 1350);
    c.textAlign = "center"; c.fillStyle = "#fff"; c.font = "900 64px system-ui,sans-serif"; c.fillText("🎲 ScoreMaster", 540, 120);
    c.font = "800 84px system-ui,sans-serif"; c.fillText((p.emoji || "") + " " + p.jeu, 540, 280);
    c.font = "500 38px system-ui,sans-serif"; c.fillStyle = "#c3c3dc"; c.fillText(new Date(p.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + " · " + p.manches.length + " manche(s)", 540, 350);
    const top = rk[0] ? rk[0].total : 1, med = ["🥇", "🥈", "🥉"];
    rk.slice(0, 6).forEach((r, k) => { const y = 440 + k * 135; c.fillStyle = k ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.16)";
      c.beginPath(); c.roundRect(80, y, 920, 112, 36); c.fill();
      const w = Math.max(.06, Math.abs(r.total) / Math.max(1, Math.abs(top))) * 860; c.fillStyle = k ? a1 + "55" : a2 + "99"; c.beginPath(); c.roundRect(90, y + 94, w, 10, 5); c.fill();
      c.textAlign = "left"; c.fillStyle = "#fff"; c.font = "800 50px system-ui,sans-serif"; c.fillText((med[k] || (k + 1) + ".") + "  " + String(r.nom).slice(0, 16), 110, y + 66);
      c.textAlign = "right"; c.font = "900 62px system-ui,sans-serif"; c.fillText(String(r.total), 970, y + 70); });
    c.textAlign = "center"; c.fillStyle = "#8f8fb0"; c.font = "500 32px system-ui,sans-serif"; c.fillText("Scores suivis avec ScoreMaster", 540, 1300);
    const blob = await new Promise(r => cs.toBlob(r, "image/png")), f = new File([blob], "resultat-scoremaster.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: "Résultat " + p.jeu }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = f.name; a.click(); FX.toast("🖼️ Image enregistrée");
  }
  // ---------- export CSV de tout l'historique ----------
  function csv() {
    const q = v => '"' + String(v).replace(/"/g, '""') + '"', rows = [["Date", "Mode", "Jeu", "Joueur", "Rang", "Total", "Manches", "Détail des manches"]];
    S.hist.forEach(p => { try { const t = Core.totals(p), rk = Core.ranking(p);
      p.joueurs.forEach((n, i) => rows.push([(p.date || "").slice(0, 10), p.mode || "", p.jeu, n, rk.findIndex(x => x.i === i) + 1, t[i], p.manches.length, p.manches.map(m => m[i]).join(" | ")])); } catch (e) {} });
    if (rows.length < 2) return FX.toast("Aucune partie à exporter");
    const b = new Blob(["\ufeff" + rows.map(r => r.map(q).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "scoremaster-parties.csv"; a.click(); FX.toast("📤 " + (rows.length - 1) + " lignes exportées");
  }
  PAGES.outils = function () { const l = look();
    return outils0.apply(this, arguments) + `<section class="card tools"><h2>🎨 Apparence</h2><div class="chp">${[["auto", "🌓 Auto"], ["sombre", "🌙 Sombre"], ["clair", "☀️ Clair"]].map(x => `<button class="btn ${l === x[0] ? "on" : ""}" data-a="look" data-v="${x[0]}">${x[1]}</button>`).join("")}</div></section>
      <section class="card tools"><h2>📤 Mes données</h2><p>Toutes tes parties dans un tableur (Excel, Google Sheets).</p><button class="btn main" data-a="csv">📊 Exporter en CSV</button></section>`; };
  Object.assign(ACTIONS, { look: v => { try { localStorage.setItem("sm_look", v); } catch (e) {} applyLook(); document.querySelectorAll('[data-a="look"]').forEach(b => b.classList.toggle("on", b.dataset.v === v)); }, csv, shareimg: shareImg });
  // bouton ☀️/🌙 toujours visible dans l'en-tête + numéro de version réel
  const hd = document.querySelector("header");
  if (hd && !document.getElementById("lookbtn")) { const b = document.createElement("button"); b.id = "lookbtn"; b.type = "button"; b.setAttribute("aria-label", "Basculer thème clair / sombre");
    b.onclick = () => ACTIONS.look(document.body.dataset.look === "clair" ? "sombre" : "clair"); hd.appendChild(b); applyLook(); }
  document.querySelectorAll("[data-ver]").forEach(e => { e.textContent = "v2.8.6"; });
})();
