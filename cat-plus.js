// Jeux supplémentaires (comptage de points) — ajoutés au catalogue « Autres jeux »
(function () {
  const J = (id, name, emoji, cat, min, max, dp, rules, scoring, winner, o = {}) =>
    window.CAT_AUTRES.push({ id, name, emoji, cat, min, max, dp, low: false, teams: false, quick: [], targets: [], rules, scoring, winner, ...o });

  J("monopoly", "Monopoly", "🎩", "Plateau", 2, 6, 4,
    ["But du jeu : ruiner les autres joueurs en achetant, louant et construisant des propriétés.", "On lance les dés, on avance, on achète la case si elle est libre ou on paie le loyer au propriétaire."],
    ["Pour un score de fin de partie rapide : on additionne l'argent, la valeur des propriétés et des constructions."],
    ["Version classique : le dernier joueur non ruiné gagne. Version courte : le plus gros patrimoine à l'heure convenue gagne."]);
  J("risk", "Risk", "🌍", "Plateau", 2, 6, 4,
    ["But du jeu : conquérir des territoires avec ses armées, jusqu'à accomplir sa mission ou dominer la carte.", "À son tour on renforce, on attaque (dés contre dés) puis on déplace des troupes."],
    ["Pour compter : 1 point par territoire contrôlé en fin de partie, +1 par continent entièrement tenu (variante maison)."],
    ["Selon la règle choisie : mission accomplie, ou plus de territoires à la fin du temps imparti."]);
  J("azul", "Azul", "🔷", "Plateau", 2, 4, 3,
    ["But du jeu : décorer le mur du palais en plaçant des tuiles de couleur.", "On prend toutes les tuiles d'une couleur dans une fabrique, on les place sur une ligne de motif, puis on les transfère sur le mur en fin de manche."],
    ["Tuile posée sur le mur : 1 point par tuile de la ligne et de la colonne qu'elle touche (1 seule si isolée).", "Pénalités du plancher : −1, −1, −2, −2, −2, −3, −3.", "Bonus de fin : ligne complète +2, colonne complète +7, les 5 tuiles d'une couleur +10."],
    ["La partie se termine quand un joueur complète une ligne horizontale du mur. Le plus haut total gagne."]);
  J("splendor", "Splendor", "💎", "Plateau", 2, 4, 3,
    ["But du jeu : atteindre 15 points de prestige en achetant des cartes de développement avec des jetons gemmes.", "À son tour : prendre des jetons, réserver une carte ou acheter une carte."],
    ["Chaque carte porte son nombre de points de prestige.", "Un noble visité rapporte 3 points."],
    ["Le premier à 15 points déclenche la fin du tour de table. Le plus de points gagne (égalité : le moins de cartes)."],
    { target: 15 });
  J("sept-wonders", "7 Wonders", "🏛️", "Plateau", 3, 7, 4,
    ["But du jeu : développer sa cité sur 3 âges en jouant des cartes de ressources, de science, de commerce et de guerre."],
    ["Points militaires (jetons de conquête), pièces (1 point par 3 pièces), merveille, bâtiments civils (bleus), sciences (vertes), commerce (jaunes), guildes (violettes)."],
    ["Après le 3e âge, on additionne toutes les catégories. Le plus haut total gagne."]);
  J("dixit", "Dixit", "🖼️", "Ambiance", 3, 8, 4,
    ["But du jeu : donner des indices ni trop évidents ni trop obscurs pour que certains seulement retrouvent votre carte illustrée."],
    ["Le conteur marque 3 points si au moins un joueur (mais pas tous) retrouve sa carte, sinon 0 et les autres marquent 2.", "Les joueurs qui trouvent la carte du conteur marquent 3.", "+1 point pour chaque vote reçu sur sa propre carte (hors conteur)."],
    ["Le premier qui atteint 30 points gagne."], { target: 30, targets: [] });
  J("codenames", "Codenames", "🕵️", "Ambiance", 4, 10, 4,
    ["But du jeu : en deux équipes, retrouver tous ses agents grâce aux indices d'un maître-espion (un mot + un nombre).", "Toucher l'assassin fait perdre immédiatement l'équipe."],
    ["On compte les manches gagnées (1 point par manche), ou les cartes agents trouvées."],
    ["L'équipe qui trouve tous ses agents en premier gagne la manche."], { teams: true });
  J("perudo", "Perudo / Dudo", "🎲", "Dés", 2, 8, 4,
    ["But du jeu : être le dernier à avoir encore des dés. Chacun cache ses dés sous un gobelet et annonce un pari sur le total de dés d'une valeur à la table.", "Le joueur suivant surenchérit ou dit « menteur »."],
    ["Pari perdu : on perd un dé. Pour compter les points : dés restants à la fin de chaque manche."],
    ["Le dernier joueur qui a encore un dé gagne la manche."], { quick: [["Dé perdu", -1]] });
  J("mille-sabords", "Mille Sabords", "🏴‍☠️", "Dés", 2, 6, 3,
    ["But du jeu : atteindre 6 000 points en lançant 8 dés. On relance ceux de son choix sauf les têtes de mort."],
    ["Chaque tête de mort met un dé de côté ; à 3 têtes de mort, le tour s'arrête et on ne marque rien.", "Pièce et diamant : 100 points chacun. Suites et brelans : bonus selon la grille de la carte.", "Combinaison complète de 8 dés : bonus de 500."],
    ["Le premier qui atteint 6 000 déclenche le dernier tour. Le plus haut score gagne."], { target: 6000 });
  J("kingdomino", "Kingdomino", "👑", "Plateau", 2, 4, 3,
    ["But du jeu : assembler un royaume de 5×5 cases avec des dominos de terrain."],
    ["Pour chaque zone de terrain d'un seul tenant : nombre de cases × nombre de couronnes de la zone.", "Bonus : +10 royaume complet 5×5, +5 château au centre."],
    ["Le plus haut total gagne."]);
  J("dobble", "Dobble", "🔮", "Ambiance", 2, 8, 4,
    ["But du jeu : repérer le seul symbole commun entre deux cartes avant les autres, et le nommer."],
    ["On compte les cartes gagnées (jeu « La tour infernale » ou « Le puits »)."],
    ["Le joueur qui a récupéré le plus de cartes gagne."], { quick: [["+1", 1], ["+3", 3], ["+5", 5]] });
  J("jungle-speed", "Jungle Speed", "🗿", "Ambiance", 2, 10, 4,
    ["But du jeu : se débarrasser de toutes ses cartes. Quand deux joueurs retournent la même carte, il faut attraper le totem en premier."],
    ["Le perdant du duel ramasse les cartes. On note le nombre de cartes restantes (le moins est le mieux)."],
    ["Le premier sans carte gagne la manche."], { low: true });
  J("taboo", "Taboo", "🚫", "Ambiance", 4, 10, 4,
    ["But du jeu : faire deviner un mot à son équipe sans prononcer le mot ni les mots interdits de la carte."],
    ["Mot deviné : +1 point. Mot interdit prononcé (buzzer) : −1 point."],
    ["À la fin des manches prévues, l'équipe qui a le plus de points gagne."], { teams: true, quick: [["Deviné +1", 1], ["Buzzer −1", -1]] });
  J("boggle", "Boggle", "🔠", "Ambiance", 2, 8, 4,
    ["But du jeu : trouver le plus de mots possibles dans une grille de lettres en 3 minutes, en enchaînant des lettres voisines."],
    ["Mots de 3 à 4 lettres : 1 point. 5 lettres : 2. 6 lettres : 3. 7 lettres : 5. 8 lettres ou plus : 11.", "Les mots trouvés par plusieurs joueurs ne comptent pour personne."],
    ["Après plusieurs manches, le plus haut total gagne."], { quick: [["1", 1], ["2", 2], ["3", 3], ["5", 5], ["11", 11]] });
  J("tick-tack-bomb", "Tic Tac Boum", "💣", "Ambiance", 2, 10, 4,
    ["But du jeu : trouver un mot contenant la syllabe annoncée avant que la bombe n'explose. La bombe passe de main en main."],
    ["Celui qui tient la bombe quand elle explose perd la manche : on lui note 1 point de pénalité."],
    ["Après plusieurs manches, le joueur avec le moins de pénalités gagne."], { low: true, quick: [["Boum +1", 1]] });
  J("mikado", "Mikado", "🥢", "Plein air", 2, 6, 3,
    ["But du jeu : retirer un à un les bâtonnets du tas sans faire bouger les autres."],
    ["Chaque couleur de bâtonnet a sa valeur ; le Mikado (bâtonnet noir) est le plus précieux (20 points)."],
    ["Quand tous les bâtonnets sont retirés, le plus haut total gagne."], { quick: [["Mikado 20", 20], ["10", 10], ["5", 5], ["3", 3], ["2", 2]] });
  J("cornhole", "Cornhole", "🌽", "Plein air", 2, 2, 2,
    ["But du jeu : lancer des sacs de graines sur une planche inclinée, ou dans son trou."],
    ["Sac dans le trou : 3 points. Sac resté sur la planche : 1 point.", "Les points des deux équipes s'annulent à chaque manche : seule la différence est marquée."],
    ["La première équipe à 21 points gagne."], { teams: true, target: 21, quick: [["+1", 1], ["+2", 2], ["+3", 3], ["+4", 4], ["+5", 5], ["+6", 6]] });
  J("basket", "Basket", "🏀", "Sport", 2, 2, 2,
    ["But du jeu : mettre le ballon dans le panier adverse."],
    ["Lancer franc : 1 point. Tir normal : 2 points. Tir derrière la ligne à 3 points : 3 points."],
    ["L'équipe qui a marqué le plus de points à la fin du temps de jeu gagne (ou la première à l'objectif choisi)."],
    { teams: true, target: 21, targets: [11, 15], quick: [["+1", 1], ["+2", 2], ["+3", 3]] });
  J("tennis", "Tennis (points)", "🎾", "Sport", 2, 2, 2,
    ["But du jeu : gagner plus de jeux que l'adversaire. Pour simplifier, l'appli compte ici les jeux gagnés."],
    ["Un jeu gagné : +1. Un set se gagne en 6 jeux avec 2 d'écart (tie-break à 6-6)."],
    ["Le premier à 6 jeux (ou l'objectif choisi) gagne le set."], { teams: true, target: 6, targets: [4, 12], quick: [["Jeu +1", 1]] });
  J("billard", "Billard", "🎱", "Plein air", 2, 4, 2,
    ["But du jeu : empocher toutes ses billes puis la noire (billard américain), ou enchaîner les carambolages (billard français)."],
    ["On compte les billes empochées. Noire empochée trop tôt : manche perdue."],
    ["Le premier à vider sa série puis rentrer la noire gagne la manche."], { quick: [["Bille +1", 1], ["Noire +1", 1]] });
  J("fifa", "Jeu de foot vidéo", "🎮", "Jeux vidéo", 2, 4, 2,
    ["But du jeu : marquer plus de buts que l'adversaire sur console."],
    ["Chaque but : +1."],
    ["Le plus de buts à la fin du match, ou le plus de points sur un mini-championnat (3 pts victoire, 1 nul)."], { quick: [["But +1", 1], ["Victoire 3", 3], ["Nul 1", 1]] });
  J("smash", "Super Smash Bros", "🥊", "Jeux vidéo", 2, 4, 4,
    ["But du jeu : éjecter les adversaires de l'écran. Les parties se jouent en stocks (vies) ou en temps limité."],
    ["Éjection d'un adversaire : +1. Chute ou auto-éjection : −1."],
    ["Le plus haut score à la fin du temps (ou le dernier survivant en stocks) gagne."], { quick: [["KO +1", 1], ["Chute −1", -1]] });
  J("just-dance", "Just Dance", "💃", "Jeux vidéo", 2, 8, 4,
    ["But du jeu : reproduire les chorégraphies à l'écran en rythme."],
    ["Le jeu affiche un score par chanson ; on le note à chaque chanson."],
    ["Après le nombre de chansons choisi, le plus haut total gagne."], { quick: [["Étoiles 3", 3], ["Étoiles 4", 4], ["Étoiles 5", 5]] });
})();
