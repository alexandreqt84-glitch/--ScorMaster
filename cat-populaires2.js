// Jeux populaires ajoutés (lot 2 : AUTRES JEUX). Même format que cat-populaires.js.
(function () {
  const A = (id, name, emoji, cat, min, max, dp, rules, scoring, winner, o = {}) =>
    window.CAT_AUTRES.push({ id, name, emoji, cat, min, max, dp, low: false, teams: false, quick: [], targets: [], rules, scoring, winner, ...o });

  // ----- stratégie / plateau -----
  A("quacks", "Les Quacks de Quedlinburg", "🧪", "Plateau", 2, 4, 3,
    ["But du jeu : préparer des potions en tirant des ingrédients de son sac et en les posant sur son chaudron. 9 manches.", "Si les pétards blancs posés dépassent 7, le chaudron explose : on choisit entre gagner des points ou acheter des ingrédients."],
    ["Chaque manche : points indiqués sur la dernière case du chaudron, rubis et achats d'ingrédients ; les rubis valent 1 point chacun en fin de partie."],
    ["Le plus de points de victoire après 9 manches gagne."]);
  A("brass", "Brass: Birmingham", "🏭", "Plateau", 2, 4, 3,
    ["But du jeu : développer son industrie (coton, fer, charbon, poterie...) et ses liaisons en 2 ères : canaux puis chemins de fer.", "À chaque tour on joue 2 actions : construire, développer, vendre, emprunter, explorer ou réseau."],
    ["À la fin de chaque ère : points des liaisons (selon les villes reliées) et des bâtiments retournés. Le revenu sert d'ordre du tour, pas de points."],
    ["Le plus de points de victoire à la fin de l'ère du rail gagne."]);
  A("chateaux-bourgogne", "Les Châteaux de Bourgogne", "🏰", "Plateau", 2, 4, 3,
    ["But du jeu : compléter sa principauté de 37 cases en plaçant des tuiles (châteaux, bâtiments, animaux, navires, mines...). 5 phases de 5 tours, avec 2 dés par tour.", "Le numéro du dé détermine où l'on peut placer la tuile."],
    ["Points de tuiles complétées (régions), bonus de phase, marchandises vendues, ouvriers et argent restants, points des tuiles de connaissance."],
    ["Le plus de points après les 5 phases gagne."]);
  A("wingspan", "Wingspan", "🦅", "Plateau", 1, 5, 3,
    ["But du jeu : attirer des oiseaux dans ses habitats (forêt, prairie, zone humide) et déclencher leurs pouvoirs. 4 manches avec de moins en moins d'actions.", "Actions : jouer un oiseau, prendre de la nourriture, pondre des œufs, piocher des cartes."],
    ["Points : valeur des oiseaux, objectifs de fin de manche, cartes bonus, 1 point par œuf, 1 par nourriture mise en réserve, 1 par carte glissée sous un oiseau."],
    ["Le plus de points après 4 manches gagne."]);
  A("pandemic", "Pandemic", "🦠", "Coopératif", 2, 4, 4,
    ["But du jeu (coopératif) : guérir les 4 maladies avant que l'humanité soit submergée. Chaque joueur a un rôle et 4 actions par tour.", "On défausse 5 cartes de la même couleur dans un centre de recherche pour découvrir un remède."],
    ["Pas de points : on note simplement victoire ou défaite (1 point si l'équipe gagne)."],
    ["Victoire collective si les 4 remèdes sont trouvés ; défaite en cas de 8 éclosions, de pénurie de cubes ou de pioche épuisée."],
    { coop: true, target: 1 });
  A("king-of-tokyo", "King of Tokyo", "🦖", "Dés", 2, 6, 4,
    ["But du jeu : monstres qui s'affrontent en lançant des dés pour attaquer, soigner, gagner de l'énergie ou marquer des points.", "Celui qui est dans Tokyo frappe tous les autres mais reçoit tous les coups."],
    ["Points de victoire : 1 pour entrer dans Tokyo, 2 par début de tour passé dedans, brelan de chiffres (1, 2, 3) et cartes."],
    ["Premier à 20 points de victoire gagne, ou le dernier monstre en vie."],
    { target: 20 });
  A("bang", "Bang!", "🤠", "Cartes", 4, 7, 5,
    ["But du jeu : jeu de rôles secrets : Shérif, adjoints, hors-la-loi, renégat. Chacun joue des cartes de tir (Bang!), de défense et d'équipement.", "Les rôles sont cachés (sauf le Shérif) jusqu'à l'élimination."],
    ["Pas de points : 1 victoire pour chaque joueur du camp gagnant."],
    ["Shérif et adjoints gagnent en éliminant tous les hors-la-loi et le renégat ; hors-la-loi, en tuant le Shérif ; renégat, en étant le dernier en vie."]);
  A("cluedo", "Cluedo", "🔍", "Déduction", 3, 6, 4,
    ["But du jeu : découvrir qui a tué, avec quelle arme et dans quelle pièce, en posant des questions et en déduisant avec les cartes de ses voisins.", "On avance avec les dés, on émet une hypothèse dans une pièce ; les autres montrent une carte pour la réfuter."],
    ["Pas de points : 1 victoire pour le premier à accuser juste."],
    ["Le premier joueur à faire l'accusation exacte (personnage, arme, lieu) gagne."],
    { target: 3 });
  A("puissance4", "Puissance 4", "🔴", "Abstrait", 2, 2, 2,
    ["But du jeu : aligner 4 jetons de sa couleur (ligne, colonne ou diagonale) sur la grille verticale de 7 colonnes × 6 lignes.", "Chacun à son tour laisse tomber un jeton dans une colonne."],
    ["Pas de points : 1 victoire par partie gagnée (0 en cas d'égalité, grille pleine)."],
    ["Le premier à 3 ou 5 victoires (à convenir) gagne le match."],
    { target: 3 });
  A("echecs", "Échecs", "♟️", "Abstrait", 2, 2, 2,
    ["But du jeu : mettre le roi adverse en échec et mat.", "Les blancs commencent ; chaque pièce se déplace selon son type (pion, tour, cavalier, fou, dame, roi)."],
    ["Victoire = 1 point, nulle = ½ point (on peut noter 1 = 2 points, nulle = 1 point), défaite = 0."],
    ["Le plus de points après la série de parties (ou un match en 2, 4, 6 parties) gagne."]);
  A("dames", "Jeu de dames", "⚫", "Abstrait", 2, 2, 2,
    ["But du jeu : capturer ou bloquer tous les pions adverses sur le damier de 100 cases (dames internationales) ou de 64 cases (anglaises).", "Les pions avancent d'une case en diagonale et prennent en sautant ; la prise est obligatoire."],
    ["Pas de points : 1 victoire par partie, 0 en cas de nulle."],
    ["Le premier à 3 victoires (ou le total convenu) gagne le match."],
    { target: 3 });
  A("backgammon", "Backgammon", "🎲", "Abstrait", 2, 2, 2,
    ["But du jeu : faire sortir ses 15 pions du plateau avant l'adversaire, en les déplaçant selon les dés (2 dés par tour).", "On peut doubler la mise grâce au videau."],
    ["Partie simple = 1 point, gammon (l'adversaire n'a sorti aucun pion) = 2, backgammon = 3 ; ×2, ×4... selon le videau."],
    ["Le premier à atteindre le nombre de points du match (3, 5, 7...) gagne."],
    { target: 5 });
  A("jenga", "Jenga", "🧱", "Adresse", 2, 8, 3,
    ["But du jeu : retirer un bloc de la tour d'un seul doigt ou d'une seule main, et le poser en haut, sans la faire tomber.", "Un seul bloc par tour, on ne touche pas aux deux étages supérieurs."],
    ["Pas de points : celui qui fait tomber la tour perd la partie ; on compte 1 point pour les autres joueurs."],
    ["Le dernier joueur à ne pas avoir fait tomber la tour gagne."]);
  A("bananagrams", "Bananagrams", "🍌", "Mots", 2, 8, 3,
    ["But du jeu : former le plus vite possible une grille de mots croisés avec toutes ses lettres, sans plateau.", "Quand un joueur a posé toutes ses lettres, il crie « Peel » et chacun reçoit une lettre ; à la fin de la pioche, on termine avec « Bananas »."],
    ["On compte 1 victoire par partie (ou 10 points moins le nombre de lettres inutilisées)."],
    ["Le premier à poser toutes ses lettres une fois la pioche vide gagne la manche."]);
  A("patchwork", "Patchwork", "🧵", "Duel", 2, 2, 2,
    ["But du jeu : coudre le plus beau couvre-lit sur un plateau de 9×9 en achetant des pièces avec des boutons et du temps.", "Le joueur le plus en retard sur la piste de temps joue."],
    ["Boutons restants − 2 points par case vide de son plateau + 7 points de bonus pour un carré de 7×7 complet."],
    ["Le plus haut score gagne."]);
  A("sept-wonders-duel", "7 Wonders Duel", "🏺", "Duel", 2, 2, 2,
    ["But du jeu : en duel, développer sa cité sur 3 âges en choisissant des cartes dans une pyramide, et construire ses merveilles.", "Trois victoires immédiates possibles : suprématie militaire, scientifique, ou victoire aux points."],
    ["Points : cartes bleues, merveilles, jetons progrès, pièces (1 point par 3 pièces), points militaires de fin de partie."],
    ["Victoire militaire ou scientifique immédiate, sinon le plus de points de victoire à la fin de l'âge III."]);
  A("cascadia", "Cascadia", "🐻", "Plateau", 1, 4, 3,
    ["But du jeu : bâtir un paysage de la Cascadie en plaçant des tuiles d'habitat (rivières, montagnes, forêts...) et des jetons animaux.", "À chaque tour on prend une tuile et un jeton associés."],
    ["Points : cartes faune (1 par animal), plus grand groupe de chaque habitat, bonus pour la majorité, 1 point par jeton nature."],
    ["Le plus haut total gagne."]);
  A("loups-garous", "Les Loups-garous de Thiercelieux", "🐺", "Ambiance", 8, 18, 10,
    ["But du jeu : jeu de rôles cachés avec un meneur. La nuit, les loups-garous dévorent un villageois ; le jour, tout le monde vote pour éliminer un suspect.", "Rôles spéciaux : voyante, sorcière, chasseur, cupidon, etc."],
    ["Pas de points : 1 victoire pour chaque joueur du camp gagnant."],
    ["Le village gagne en éliminant tous les loups ; les loups gagnent quand ils sont aussi nombreux que les villageois."]);
  A("small-world", "Small World", "🧙", "Plateau", 2, 5, 4,
    ["But du jeu : conquérir des régions avec un peuple associé à un pouvoir, puis le mettre en déclin pour en choisir un nouveau.", "Les jetons de victoire sont gardés cachés jusqu'à la fin."],
    ["À la fin de chaque tour, on marque 1 pièce de victoire par région occupée (plus les bonus de pouvoirs)."],
    ["Le plus de pièces de victoire après le dernier tour gagne."]);
  A("skull", "Skull", "💀", "Bluff", 3, 6, 4,
    ["But du jeu : chaque joueur a 3 roses et 1 crâne. On pose un disque face cachée, puis on mise sur le nombre de roses que l'on pourra retourner sans trouver un crâne.", "Le plus offrant doit retourner ses disques puis ceux des autres."],
    ["Un défi réussi = 1 point."],
    ["Le premier joueur à réussir 2 défis gagne."],
    { target: 2 });
  A("sagrada", "Sagrada", "🪟", "Plateau", 1, 4, 3,
    ["But du jeu : construire un vitrail en plaçant des dés de couleurs et de valeurs sans jamais mettre deux dés identiques côte à côte.", "Chaque joueur a une carte vitrail avec des contraintes de couleur ou de valeur."],
    ["Points : 3 objectifs publics, 1 objectif privé (couleur), 1 point par jeton faveur, −1 par case vide."],
    ["Le plus haut score gagne."]);

  // ----- sports / jeux vidéo -----
  A("mario-party", "Mario Party", "🍄", "Jeux vidéo", 2, 4, 4,
    ["But du jeu : plateau avec mini-jeux. On avance avec un dé, on gagne des pièces et on achète des étoiles.", "À la fin, on reçoit des étoiles bonus."],
    ["Score : étoiles d'abord, puis pièces en cas d'égalité (on peut noter ⭐ × 100 + pièces)."],
    ["Le joueur avec le plus d'étoiles à la fin du dernier tour gagne."]);
  A("rocket-league", "Rocket League", "🚗", "Jeux vidéo", 2, 8, 4,
    ["But du jeu : football en voiture : marquer plus de buts que l'adversaire en 5 minutes (prolongation au but en or).", "On joue en 1v1, 2v2 ou 3v3."],
    ["1 point par but ; compte les buts de chaque équipe (ou joueur en 1v1)."],
    ["L'équipe qui a marqué le plus de buts gagne."],
    { teams: true });
  A("padel", "Padel", "🎾", "Sport", 2, 4, 4,
    ["But du jeu : sport de raquette en double sur un court entouré de parois en verre. Le service se fait en dessous, et la balle peut rebondir sur les parois après son rebond.", "Le décompte est celui du tennis : 15, 30, 40, jeu, set."],
    ["Noter les jeux gagnés par chaque équipe (6 jeux gagnants avec 2 d'écart, jeu décisif à 6-6)."],
    ["Le premier à 2 sets gagne le match."],
    { teams: true });
  A("beer-pong", "Beer-pong", "🏓", "Adresse", 2, 4, 2,
    ["But du jeu : lancer une balle de ping-pong dans les gobelets de l'équipe adverse (10 gobelets en triangle).", "Chaque équipe joue deux balles par tour ; un gobelet touché est retiré (et l'adversaire le boit, version classique). À consommer avec modération."],
    ["Points = nombre de gobelets touchés."],
    ["La première équipe à avoir éliminé tous les gobelets adverses gagne."],
    { teams: true, target: 10 });
  A("kubb", "Kubb", "🪵", "Plein air", 2, 12, 4,
    ["But du jeu : jeu de quilles suédois : abattre avec des bâtons les kubbs (blocs de bois) de l'équipe adverse, puis le roi au centre.", "Les kubbs renversés sont renvoyés dans le camp adverse, qui doit les redresser."],
    ["Pas de points : 1 manche gagnée par l'équipe qui abat le roi après avoir éliminé tous les kubbs."],
    ["L'équipe qui abat le roi (après tous les kubbs) gagne ; abattre le roi trop tôt fait perdre."],
    { teams: true });
})();
