// Jeux familiaux ajoutés (lot 3). Même format que cat-populaires.js : C = jeu de cartes, A = autre jeu.
// Les règles sont celles du jeu de base ; beaucoup ont des variantes « maison », à adapter au besoin.
(function () {
  const mk = (list) => (id, name, emoji, cat, min, max, dp, rules, scoring, winner, o = {}) =>
    list.push({ id, name, emoji, cat, min, max, dp, low: false, teams: false, quick: [], targets: [], rules, scoring, winner, ...o });
  const C = mk(window.CAT_CARTES), A = mk(window.CAT_AUTRES);

  // =================== JEUX DE CARTES ===================
  C("memory-cartes", "Memory (jeu de cartes)", "🧠", "Mémoire", 2, 6, 3,
    ["But du jeu : retrouver le plus de paires de cartes identiques.", "Toutes les cartes sont posées face cachée. À son tour on retourne 2 cartes : si elles sont identiques on les garde et on rejoue, sinon on les retourne et le joueur suivant joue."],
    ["Chaque paire gagnée vaut 1 point."], ["Quand toutes les cartes sont prises, celui qui a le plus de paires gagne."],
    { quick: [["Paire +1", 1]] });
  C("sept-familles", "Jeu des 7 familles", "👨‍👩‍👧‍👦", "Familial", 3, 6, 4,
    ["But du jeu : réunir des familles complètes (6 cartes chacune, ex. la famille Dupont).", "À son tour on demande à un joueur précis une carte précise (« as-tu Mme Dupont ? »). S'il l'a, il la donne et on rejoue ; sinon on pioche."],
    ["Chaque famille complète posée devant soi vaut 1 point."], ["Le joueur qui a posé le plus de familles gagne."],
    { quick: [["Famille +1", 1]] });
  C("nain-jaune", "Nain jaune", "🟡", "Défausse", 3, 8, 5,
    ["But du jeu : être le premier à se débarrasser de toutes ses cartes. On pose des suites de cartes de la même couleur, en montant.", "Certaines cartes (7 de carreau, dame de pique, roi de cœur, 10 de carreau) permettent de gagner des jetons en les posant."],
    ["On joue avec des jetons : on les mise au départ et on gagne ceux posés sur les cartes spéciales.", "À la fin d'une manche, le gagnant reçoit de chaque adversaire un jeton par carte qui lui reste en main (règle courante, à adapter)."],
    ["Celui qui a le plus de jetons à la fin des manches convenues gagne."]);
  C("skip-bo", "Skip-Bo", "⏭️", "Défausse", 2, 6, 4,
    ["But du jeu : vider sa pile de départ en posant les cartes en suites de 1 à 12 au centre de la table.", "On joue des cartes de sa main, de sa pile ou de ses 4 défausses. Les cartes Skip-Bo remplacent n'importe quel nombre."],
    ["Le gagnant d'une manche marque 25 points + 5 points par carte restant dans la pile de départ de chaque adversaire."], ["Le premier à atteindre 500 points gagne la partie."],
    { target: 500, targets: [300, 500] });
  C("yaniv", "Yaniv", "🃏", "Défausse", 2, 6, 4,
    ["But du jeu : avoir la main la plus faible. À son tour on défausse une ou plusieurs cartes (suite ou même valeur) puis on pioche.", "Quand on a 7 points ou moins en main, on peut annoncer « Yaniv » pour finir la manche."],
    ["Valeur des cartes : As = 1, 2 à 10 = leur valeur, Valet / Dame / Roi = 10, Joker = 0.", "Celui qui annonce Yaniv marque 0 si sa main est la plus faible ; sinon (« Assaf ») il prend 30 points de pénalité. Les autres marquent la valeur de leur main."],
    ["Le plus petit score gagne. Un joueur qui dépasse 200 points est éliminé (variante courante : retour à 100 en tombant pile sur 200)."],
    { low: true, target: 200, targets: [100, 200] });
  C("crapette", "Crapette", "♣️", "Duel de cartes", 2, 2, 2,
    ["But du jeu : se débarrasser de toutes ses cartes en les posant sur les 8 piles centrales (par couleur, de l'As au Roi) ou sur les cartes de l'adversaire.", "Chacun a une pile de réserve (le « talon ») et jette ses cartes sur celles de l'autre : le jeu est rapide et agressif."],
    ["Le gagnant d'une manche marque 1 point par carte qui reste à son adversaire."], ["On joue en un nombre de manches convenu ; le plus de points gagne."]);
  C("tichu", "Tichu", "🐉", "Plis", 4, 4, 4,
    ["But du jeu : en équipes de 2, être le premier à se débarrasser de toutes ses cartes. On joue des combinaisons (paires, suites, full…) qu'il faut battre avec plus fort.", "Avant ou pendant la manche on peut annoncer « Tichu » (finir 1er) ou « Grand Tichu » pour gagner gros... ou perdre gros."],
    ["Cartes : les 5 valent 5 points, les 10 et les Rois 10 points, le Dragon 25, le Phénix −25.", "Tichu réussi +100 (raté −100), Grand Tichu +200 (raté −200). Si une équipe finit 1re et 2e : 200 points pour elle."],
    ["La première équipe à atteindre 1000 points gagne."],
    { teams: true, target: 1000, quick: [["Tichu +100", 100], ["Tichu raté −100", -100], ["Grand Tichu +200", 200], ["Grand raté −200", -200], ["Double victoire +200", 200]] });
  C("lama", "Lama", "🦙", "Défausse", 2, 6, 3,
    ["But du jeu : se débarrasser de ses cartes (de 1 à 7 et Lamas) en les posant sur la carte du dessus de la défausse : même valeur ou valeur supérieure.", "Si on ne peut pas ou ne veut pas jouer, on pioche ou on se couche pour la manche."],
    ["À la fin de la manche on additionne ses cartes restantes : 1 à 6 = leur valeur, Lama = 10 (chaque valeur ne compte qu'une fois).", "Celui qui vide sa main peut se débarrasser d'un jeton."],
    ["La partie s'arrête quand un joueur atteint 40 points : le plus petit score gagne."],
    { low: true, target: 40 });
  C("saboteur", "Saboteur", "⛏️", "Ambiance", 3, 10, 6,
    ["But du jeu : en secret, chacun est chercheur d'or ou saboteur. Les chercheurs construisent un chemin vers le trésor, les saboteurs essaient de les en empêcher.", "La partie se joue en 3 manches, avec de nouveaux rôles à chaque manche."],
    ["Si le trésor est atteint, les chercheurs piochent des pépites d'or (1 à 3 points chacune). Si le chemin échoue, les saboteurs se partagent l'or."],
    ["Celui qui a le plus de pépites d'or après 3 manches gagne."],
    { quick: [["Or +1", 1], ["Or +2", 2], ["Or +3", 3]] });
  C("jaipur", "Jaipur", "🐪", "Duel de cartes", 2, 2, 2,
    ["But du jeu : devenir le marchand le plus riche en vendant des marchandises (épices, soie, cuir, tissu, argent, or, diamants) et en gardant des chameaux.", "À son tour on prend une carte au marché, ou on échange, ou on vend des cartes de même type contre des jetons."],
    ["Chaque vente rapporte des jetons de points (plus un bonus en vendant 3, 4 ou 5 cartes). Le joueur qui a le plus de chameaux à la fin de la manche gagne 5 points."],
    ["Le plus de points gagne la manche ; on gagne un sceau d'excellence. Le premier à 2 sceaux gagne la partie."],
    { target: 2, quick: [["Chameaux +5", 5]] });
  C("lost-cities", "Lost Cities", "🏔️", "Duel de cartes", 2, 2, 2,
    ["But du jeu : mener des expéditions dans 5 couleurs en posant des cartes de valeur croissante. Chaque expédition coûte 20 points à lancer.", "À son tour on joue une carte (sur une expédition ou la défausse) puis on pioche. Les cartes Pari doublent, triplent ou quadruplent le résultat."],
    ["Par expédition commencée : (somme des cartes − 20) × (1 + nombre de Paris). +20 points de bonus si l'expédition compte 8 cartes ou plus. Une expédition non commencée vaut 0."],
    ["Le plus de points après 3 manches gagne."]);
  C("bohnanza", "Bohnanza", "🫘", "Familial", 3, 7, 4,
    ["But du jeu : planter, récolter et vendre des haricots pour gagner des pièces d'or. On ne peut pas changer l'ordre de sa main.", "On plante ses haricots dans 2 champs, on négocie des échanges avec les autres, puis on récolte pour gagner des pièces."],
    ["Chaque champ récolté donne des pièces selon le nombre de haricots. Les cartes retournées en pièces d'or se comptent à la fin de la pioche."],
    ["Quand le paquet est épuisé 3 fois, celui qui a le plus de pièces d'or gagne."]);
  C("cortex", "Cortex Challenge", "🧩", "Rapidité", 2, 6, 3,
    ["But du jeu : réussir des défis très variés (mémoire, observation, logique, rapidité) plus vite que les autres.", "On retourne une carte défi, tout le monde joue en même temps, le plus rapide ou le plus juste gagne la carte."],
    ["Chaque carte gagnée vaut 1 point."], ["À la fin de la pioche, celui qui a le plus de cartes gagne."],
    { quick: [["Carte +1", 1]] });
  C("ligretto", "Ligretto", "⚡", "Rapidité", 2, 4, 3,
    ["But du jeu : poser ses cartes le plus vite possible, en même temps que les autres, sur des suites de 1 à 10 au centre de la table.", "La manche s'arrête quand un joueur vide sa pile Ligretto."],
    ["Chaque carte posée au centre vaut +1 point. Chaque carte restant dans sa pile Ligretto vaut −2 points."],
    ["Le premier à atteindre 100 points gagne."], { target: 100, targets: [50, 100], quick: [["Pénalité −2", -2]] });
  C("set", "Set", "🔷", "Rapidité", 1, 8, 4,
    ["But du jeu : repérer le plus vite possible des « Sets » parmi 12 cartes : 3 cartes dont chaque caractéristique (forme, couleur, nombre, remplissage) est soit toute identique, soit toute différente.", "Le premier qui voit un Set crie « Set ! » et prend les 3 cartes."],
    ["Chaque Set trouvé vaut 1 point. Une erreur peut coûter 1 point (règle optionnelle)."], ["À la fin de la pioche, le plus de Sets gagne."],
    { quick: [["Set +1", 1], ["Erreur −1", -1]] });

  // =================== AUTRES JEUX ===================
  A("qwixx", "Qwixx", "🎲", "Dés", 2, 5, 3,
    ["But du jeu : cocher des nombres de gauche à droite sur 4 lignes de couleur (2 à 12 en rouge et jaune, 12 à 2 en vert et bleu) avec les dés.", "On peut sauter des nombres mais pas revenir en arrière. Prendre 4 pénalités ou fermer 2 lignes met fin à la partie."],
    ["Chaque ligne rapporte selon le nombre de croix : 1→1, 2→3, 3→6, 4→10, 5→15, 6→21, 7→28, 8→36, 9→45, 10→55, 11→66, 12→78 (le cadenas compte comme une croix de plus).", "Chaque pénalité coûte −5 points."],
    ["Le plus de points gagne."], { quick: [["Pénalité −5", -5]] });
  A("zombie-dice", "Zombie Dice", "🧟", "Dés", 2, 8, 4,
    ["But du jeu : manger 13 cerveaux. À son tour on tire 3 dés dans un gobelet et on les lance : cerveau, pas de chance (pieds) ou coup de fusil.", "On peut continuer de lancer pour accumuler des cerveaux, mais à 3 coups de fusil on perd tous les cerveaux du tour."],
    ["Chaque cerveau gardé vaut 1 point. On marque en s'arrêtant avant le 3e coup de fusil."], ["Le premier à 13 cerveaux déclenche le dernier tour ; le plus de cerveaux gagne."],
    { target: 13, quick: [["Cerveau +1", 1], ["Cerveau +2", 2], ["Cerveau +3", 3]] });
  A("cant-stop", "Can't Stop", "🛑", "Dés", 2, 4, 3,
    ["But du jeu : remporter 3 colonnes (numérotées de 2 à 12) en les grimpant avec 4 dés. On les regroupe 2 par 2 pour avancer.", "On peut continuer de lancer autant qu'on veut, mais si on ne peut plus avancer on perd les progrès du tour. On a 3 marqueurs par tour."],
    ["Chaque colonne remportée vaut 1 point."], ["Le premier à remporter 3 colonnes gagne."],
    { target: 3, quick: [["Colonne +1", 1]] });
  A("petit-bac", "Petit Bac", "✍️", "Mots", 2, 10, 5,
    ["But du jeu : trouver le plus vite possible un mot par catégorie (pays, animal, métier, prénom…) commençant par la lettre tirée au sort.", "Quand un joueur a fini, tout le monde s'arrête. On compare les réponses."],
    ["Règle courante : 10 points par mot unique, 5 points si un autre joueur a écrit le même, 0 point si pas de mot ou mot refusé."],
    ["Après le nombre de manches convenu, le plus de points gagne."],
    { quick: [["Unique 10", 10], ["Doublon 5", 5]] });
  A("qui-est-ce", "Qui est-ce ?", "🕵️", "Déduction", 2, 2, 2,
    ["But du jeu : deviner le personnage mystère de l'autre en lui posant des questions auxquelles on répond par oui ou non.", "On rabat les personnages éliminés au fur et à mesure."],
    ["Une manche gagnée vaut 1 point."], ["On joue en plusieurs manches : le premier à 3 manches (ou le plus de manches) gagne."],
    { target: 3, quick: [["Manche +1", 1]] });
  A("mastermind-duo", "Mastermind (à deux, en vrai)", "🔴", "Déduction", 2, 2, 2,
    ["But du jeu : trouver le code secret de couleurs de l'adversaire. Le décodeur propose une combinaison, le codeur répond par des pions noirs (bonne couleur bien placée) et blancs (bonne couleur mal placée).", "Les rôles s'inversent à chaque manche."],
    ["Le codeur marque 1 point par essai du décodeur (+1 point si le code n'est pas trouvé)."], ["Après un nombre pair de manches, le plus de points gagne."]);
  A("bataille-navale", "Bataille navale", "🚢", "Déduction", 2, 2, 2,
    ["But du jeu : couler tous les bateaux de l'adversaire en devinant leur position sur sa grille (« B4 — touché ! »).", "On place ses bateaux en secret, puis chacun tire à tour de rôle."],
    ["Une partie gagnée vaut 1 point."], ["Le premier à 3 parties (ou le plus de parties) gagne."], { target: 3, quick: [["Victoire +1", 1]] });
  A("pendu-duo", "Le Pendu (papier-crayon)", "🪢", "Mots", 2, 6, 3,
    ["But du jeu : trouver le mot choisi par un autre joueur en proposant des lettres, avant que le dessin du pendu soit fini.", "Chaque mauvaise lettre ajoute un trait au dessin."],
    ["Un mot trouvé vaut 1 point pour le devineur, un mot non trouvé vaut 1 point pour celui qui l'a choisi."], ["Le plus de points après le nombre de tours convenu gagne."],
    { quick: [["Point +1", 1]] });
  A("jeu-oie", "Jeu de l'oie", "🪿", "Plateau", 2, 6, 4,
    ["But du jeu : arriver le premier sur la case 63. On lance un dé et on avance ; les cases oie font doubler le déplacement, le pont, l'auberge, le puits, le labyrinthe et la prison ont des effets spéciaux.", "Il faut tomber pile sur 63, sinon on recule."],
    ["On compte 1 point par partie gagnée."], ["Le plus de parties gagnées gagne."], { quick: [["Victoire +1", 1]] });
  A("petits-chevaux", "Petits chevaux", "🐴", "Plateau", 2, 4, 4,
    ["But du jeu : faire entrer ses 4 pions dans son escalier d'arrivée. On sort un pion de l'écurie avec un 6.", "On avance de la valeur du dé, on mange les pions adverses en tombant dessus."],
    ["On compte 1 point par pion arrivé, ou 1 point par partie gagnée."], ["Le premier qui a ses 4 pions à l'arrivée gagne."], { quick: [["Pion rentré +1", 1]] });
  A("serpents-echelles", "Serpents et échelles", "🐍", "Plateau", 2, 6, 4,
    ["But du jeu : arriver le premier sur la dernière case (100). On lance un dé et on avance : les échelles font monter, les serpents font redescendre.", "Il faut parfois tomber pile sur la dernière case."],
    ["On compte 1 point par partie gagnée."], ["Le plus de parties gagnées gagne."], { quick: [["Victoire +1", 1]] });
  A("labyrinthe", "Labyrinthe", "🧭", "Plateau", 2, 4, 3,
    ["But du jeu : ramasser dans l'ordre tous ses objets secrets dans un labyrinthe qui change à chaque tour.", "À son tour on glisse la plaque libre dans le labyrinthe pour modifier les chemins, puis on déplace son pion."],
    ["Chaque objet ramassé vaut 1 point."], ["Le premier qui a ramassé tous ses objets et qui est revenu à son point de départ gagne."], { quick: [["Objet +1", 1]] });
  A("sequence", "Sequence", "🔴", "Plateau", 2, 12, 4,
    ["But du jeu : aligner 5 jetons de sa couleur (une « séquence ») sur le plateau en jouant les cartes de sa main (chaque carte correspond à 2 cases).", "Les valets permettent de poser n'importe où ou de retirer un jeton adverse."],
    ["Chaque séquence réalisée compte pour son équipe."], ["Avec 2 équipes il faut 2 séquences, avec 3 équipes 1 séquence. Le plus de manches gagnées l'emporte."],
    { teams: true, quick: [["Séquence +1", 1]] });
  A("blokus", "Blokus", "🟦", "Abstrait", 2, 4, 3,
    ["But du jeu : poser le plus de ses 21 pièces de forme différente sur le plateau. Une nouvelle pièce ne doit toucher les siennes que par un coin, jamais par un côté.", "Quand on ne peut plus poser, on passe. La partie s'arrête quand plus personne ne peut jouer."],
    ["On compte le nombre de carrés restant dans ses pièces non posées. Bonus : −15 si toutes ses pièces sont posées, et −5 de plus si la dernière était la plus petite (1 carré)."],
    ["Le plus petit total gagne."], { low: true });
  A("takenoko", "Takenoko", "🐼", "Plateau", 2, 4, 3,
    ["But du jeu : cultiver le jardin de l'empereur de Chine (parcelles, bambous, irrigation) tout en nourrissant le panda.", "À son tour on lance le dé météo, puis on fait 2 actions : poser une parcelle, un canal, déplacer le jardinier ou le panda, piocher un objectif."],
    ["Chaque objectif accompli (parcelles, jardinier, panda) rapporte le nombre de points inscrit sur la carte."],
    ["Quand un joueur remplit assez d'objectifs (9 à 2 joueurs, 8 à 3, 7 à 4), il prend la carte Empereur (+2 points) et tout le monde joue un dernier tour. Le plus de points gagne."],
    { quick: [["Objectif +2", 2], ["Objectif +3", 3], ["Objectif +4", 4], ["Objectif +5", 5], ["Empereur +2", 2]] });
  A("draftosaurus", "Draftosaurus", "🦖", "Plateau", 2, 5, 3,
    ["But du jeu : construire le meilleur parc en plaçant des dinosaures dans des enclos aux règles différentes. 2 manches de 6 tours.", "On choisit un dinosaure dans sa main, on le place dans son parc, et on passe sa main à son voisin."],
    ["Chaque enclos rapporte des points selon sa règle propre (famille, paire, séries, etc.), +1 point par enclos qui contient au moins un T-Rex."],
    ["Le plus de points après les 2 manches gagne."]);
  A("just-one", "Just One", "☝️", "Coopératif", 3, 7, 5,
    ["But du jeu : en équipe, faire deviner un maximum de mots mystère. Chacun écrit un indice sur son chevalet ; les indices identiques sont annulés.", "Le devineur doit trouver le mot avec les indices restants."],
    ["Chaque mot deviné vaut 1 point pour l'équipe (13 cartes jouées)."], ["Score sur 13 : 13 = parfait, 11-12 = génial, 8-10 = très bien."],
    { coop: true, target: 13, quick: [["Mot trouvé +1", 1]] });
  A("loto", "Loto / Bingo", "🎱", "Familial", 2, 20, 6,
    ["But du jeu : remplir ses cartons au fur et à mesure du tirage des numéros.", "On coche chaque numéro annoncé qui est sur son carton."],
    ["Quine (1 ligne) = 1 point, Double quine (2 lignes) = 2 points, Carton plein = 3 points (à adapter selon les lots)."], ["Le plus de points ou de lots gagnés gagne."],
    { quick: [["Quine +1", 1], ["Double quine +2", 2], ["Carton plein +3", 3]] });
  A("overcooked", "Overcooked", "🧑‍🍳", "Jeux vidéo", 1, 4, 3,
    ["But du jeu : en équipe, préparer et servir des plats dans des cuisines pleines de pièges, avant la fin du temps.", "Chacun se répartit les tâches : couper, cuire, assembler, laver, servir."],
    ["Chaque niveau donne un score d'équipe (plats servis, pourboires, moins les plats ratés) et de 0 à 3 étoiles."], ["On compare le score d'équipe d'un niveau à l'autre ; tout le monde gagne ou perd ensemble."],
    { coop: true });
  A("wii-sports", "Wii Sports / Switch Sports", "🎳", "Jeux vidéo", 1, 4, 3,
    ["But du jeu : s'affronter en famille à des sports virtuels (tennis, bowling, golf, boxe…) avec les manettes à détection de mouvement."],
    ["On additionne le score de chaque sport, ou on compte 1 point par épreuve gagnée."], ["Le plus de points après les épreuves choisies gagne."],
    { quick: [["Épreuve +1", 1]] });
})();
