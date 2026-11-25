// ScoreMaster : menu Plus rangé en groupes qui se déplient (un seul ouvert à la fois). Remis en v2.8.4 après l'essai des sections fixes.
// Remplace les anciens ajouts en chaîne de PAGES.plus (extras*.js) : le menu est maintenant construit une seule fois, depuis cette liste.
(function () {
  "use strict";
  const GROUPES = [
    ["jouer", "🎮", "Jouer", [
      ["cesoir", "🍿", "Que jouer ce soir ?"], ["outils", "🧰", "Outils de jeu"], ["defis", "🎯", "Défis de la semaine"], ["envies", "⭐", "Liste d'envies"]]],
    ["jeux", "📚", "Jeux et parties", [
      ["jeux", "📚", "Jeux et règles"], ["regles", "📌", "Règles maison"], ["historique", "📜", "Historique"]]],
    ["resultats", "📊", "Mes résultats", [
      ["stats", "📊", "Statistiques"], ["succes", "🏆", "Succès"], ["forces", "💪", "Forces et faiblesses"], ["records", "🏆", "Records et anecdotes"],
      ["activite", "📈", "Mon activité"], ["recap", "📅", "Récap du mois"], ["bilan", "🎁", "Bilan de l'année"]]],
    ["amis", "🧑‍🤝‍🧑", "Entre amis", [
      ["soirees", "🌙", "Soirées jeux"], ["soireeoutils", "🎉", "Outils de soirée"], ["duels", "⚔️", "Duels entre joueurs"], ["gages", "🍻", "Gages et dettes"], ["joueurs", "🧑‍🤝‍🧑", "Joueurs"], ["general", "🌍", "Classement général"]]],
    ["appli", "🛠️", "Application", [
      ["compte", "👥", "Mon compte"], ["sauvegarde", "💾", "Sauvegarde"], ["parametres", "⚙️", "Paramètres"], ["aide", "💡", "Aide et nouveautés"]]]
  ];
  // mise en page des groupes (injectée ici : indépendante du cache de style.css) : chiffre en pastille et chevron à droite
  if (!document.getElementById("pgrp-css")) { const st = document.createElement("style"); st.id = "pgrp-css";
    st.textContent = "details.card.nav.pgrp>summary{display:flex!important;align-items:center;gap:14px;min-height:56px;padding:6px 0;list-style:none}"
      + "details.card.nav.pgrp>summary::-webkit-details-marker{display:none}details.card.nav.pgrp>summary::before{order:3;margin-left:2px}"
      + "details.card.nav.pgrp>summary i{font-style:normal;font-size:26px;width:38px;flex:none;text-align:center}"
      + "details.card.nav.pgrp>summary span{flex:1;font-weight:800}"
      + "details.card.nav.pgrp>summary em{flex:none;font-style:normal;font-size:12.5px;line-height:1;opacity:.75;padding:4px 10px;border-radius:99px;background:rgba(255,255,255,.12);margin-left:4px}";
    document.head.appendChild(st); }
  let ouvert = "jouer";                       // un seul groupe ouvert à la fois
  const ok = id => !!PAGES[id];                // n'affiche que les pages qui existent vraiment
  PAGES.plus = function () {
    return `<section class="card"><h1>Plus</h1></section>` + GROUPES.map(g => {
      const items = g[3].filter(x => ok(x[0]));
      if (!items.length) return "";
      return `<details class="card nav pgrp" data-g="${g[0]}"${ouvert === g[0] ? " open" : ""}><summary><i>${g[1]}</i><span>${g[2]}</span><em>${items.length}</em></summary>`
        + items.map(x => `<a href="#/${x[0]}"><i>${x[1]}</i><span>${x[2]}</span><u>›</u></a>`).join("") + `</details>`;
    }).join("");
  };
  // accordéon : ouvrir un groupe ferme les autres (sans redessiner la page)
  document.addEventListener("toggle", e => {
    const d = e.target; if (!d.classList || !d.classList.contains("pgrp")) return;
    if (d.open) { ouvert = d.dataset.g; document.querySelectorAll("details.pgrp[open]").forEach(o => { if (o !== d) o.open = false; }); }
    else if (ouvert === d.dataset.g) ouvert = "";
  }, true);
})();
