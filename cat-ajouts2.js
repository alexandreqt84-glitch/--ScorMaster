// Lot 6 : plus de jeux dans TOUTES les catégories + 3 nouvelles catégories (Enfants, Soirée entre potes, Quiz).
// Même format que cat-ajouts.js. Champs facultatifs : amb (fun, tete, fam, coop, air, apero, enfants) et dur (1 rapide, 2 moyen, 3 long)
// utilisés par « Que jouer ce soir ? ». Règles = jeu de base, à vérifier avec la boîte.
(function () {
  const mk = (list) => (id, name, emoji, cat, min, max, dp, rules, scoring, winner, o = {}) =>
    list.push({ id, name, emoji, cat, min, max, dp, low: false, teams: false, quick: [], targets: [], rules, scoring, winner, ...o });
  const C = mk(window.CAT_CARTES), A = mk(window.CAT_AUTRES);
  const P1 = [["Manche +1", 1]], V1 = [["Victoire +1", 1]];

  // =================== CARTES ===================
  // Capture
  C("casino-cartes", "Casino (jeu de cartes)", "🎰", "Capture", 2, 4, 2,
    ["But du jeu : capturer des cartes de la table avec les cartes de sa main. 4 cartes chacun, 4 cartes face visible sur la table.", "On capture une carte de même valeur, ou plusieurs cartes dont la somme fait la valeur de la carte jouée. Sinon la carte reste sur la table."],
    ["Plus de cartes : 3 points. Plus de piques : 1 point. 10 de carreau (Grand Casino) : 2 points. 2 de pique (Petit Casino) : 1 point. Chaque As : 1 point."],
    ["Le premier à 21 points gagne."], { target: 21, dur: 2, amb: "tete", quick: [["Grand Casino +2", 2], ["Petit Casino +1", 1], ["As +1", 1], ["Plus de cartes +3", 3]] });
  C("escoba", "Escoba", "🧹", "Capture", 2, 4, 2,
    ["But du jeu : capturer des cartes en faisant 15 avec sa carte jouée et les cartes de la table. Jeu espagnol de 40 cartes, 3 cartes chacun.", "Valeurs : As = 1, 2 à 7 = leur valeur, Valet = 8, Cavalier = 9, Roi = 10. Vider la table s'appelle faire une « escoba »."],
    ["En fin de manche : 1 point pour le plus de cartes, 1 pour le plus de carreaux, 1 pour le 7 de carreau, 1 pour le plus de 7. Chaque escoba vaut 1 point."],
    ["Le premier à 15 points gagne (21 en version longue)."], { target: 15, targets: [21], dur: 2, amb: "tete", quick: [["Escoba +1", 1]] });
  // Mises
  C("omaha", "Poker Omaha", "🃏", "Mises", 2, 9, 5,
    ["But du jeu : comme au Texas Hold'em, mais chaque joueur reçoit 4 cartes privées et doit en utiliser exactement 2 avec exactement 3 des 5 cartes communes."],
    ["On suit les jetons gagnés ou perdus : positif pour un gain, négatif pour une perte."], ["Le plus de jetons gagnés à la fin de la session gagne."], { dur: 3, amb: "tete" });
  C("baccarat", "Baccarat", "🎴", "Mises", 2, 7, 4,
    ["But du jeu : parier sur la main (Joueur ou Banque) qui sera la plus proche de 9. Les cartes valent leur valeur, 10 et figures valent 0, on ne garde que le chiffre des unités.", "Chaque main reçoit 2 cartes, parfois une troisième selon des règles fixes."],
    ["Pari gagnant sur le Joueur : mise ×1. Sur la Banque : mise ×1 (moins 5 % de commission). Sur l'égalité : ×8."], ["Le joueur qui a gagné le plus de jetons gagne."], { dur: 2, amb: "tete" });
  C("stud-7", "Poker Stud à 7 cartes", "♦️", "Mises", 2, 7, 4,
    ["But du jeu : faire la meilleure main de 5 cartes parmi ses 7 cartes. Pas de cartes communes : 2 cartes cachées et 1 visible, puis 3 visibles et 1 cachée, avec un tour de mise à chaque étape."],
    ["On suit les jetons gagnés ou perdus."], ["Le plus de jetons à la fin de la session gagne."], { dur: 3, amb: "tete" });
  // Combinaisons
  C("besigue", "Bésigue", "👑", "Combinaisons", 2, 4, 2,
    ["But du jeu : marquer des points avec des combinaisons (mariages, carrés, bésigue) et des plis. Jeu de 64 cartes (2 jeux de 32), 8 cartes chacun.", "On pioche à chaque pli, on annonce une combinaison après avoir gagné un pli, puis on la pose devant soi."],
    ["Mariage (Roi + Dame) : 20, à l'atout : 40. Bésigue (Dame de pique + Valet de carreau) : 40. Quatre As : 100, Rois : 80, Dames : 60, Valets : 40.", "Séquence d'atout (As, 10, Roi, Dame, Valet) : 250. Brisques (As et 10 gagnés) : 10 chacune. 7 d'atout : 10. Dix de der : 10."],
    ["Le premier à atteindre 1000 points (ou 1500) gagne."], { target: 1000, targets: [1500], dur: 2, amb: "tete", quick: [["Mariage +20", 20], ["Mariage atout +40", 40], ["Bésigue +40", 40], ["Quatre As +100", 100], ["Brisque +10", 10]] });
  // Pioche et prise de risque
  C("diamant", "Diamant (Incan Gold)", "💎", "Pioche et prise de risque", 3, 8, 5,
    ["But du jeu : ramasser le plus de gemmes en explorant un temple. 5 expéditions.", "À chaque carte retournée, des gemmes sont partagées entre les explorateurs encore là, ou un danger apparaît. Si le même danger sort deux fois, ceux qui sont restés perdent tout ce qu'ils transportent.", "Chacun décide en secret de rester ou de rentrer au camp à chaque carte."],
    ["On additionne les gemmes ramenées au camp à la fin des 5 expéditions (les reliques valent 10 ou 5 si elles sont prises seules)."], ["Le plus de gemmes gagne."], { dur: 2, amb: "fun", quick: [["+5", 5], ["+10", 10], ["Relique +10", 10]] });
  C("pas-merci", "Pas merci ! (No Thanks)", "🙅", "Pioche et prise de risque", 3, 7, 4,
    ["But du jeu : éviter de prendre des cartes. Cartes numérotées de 3 à 35 (9 sont retirées au hasard).", "À son tour, on prend la carte retournée (avec les jetons posés dessus), ou on paie 1 jeton pour la refuser. Quand on n'a plus de jetons, on est obligé de prendre."],
    ["Chaque carte vaut son numéro, mais dans une suite on ne compte que la plus petite. Chaque jeton restant retire 1 point."], ["Le plus petit total gagne."], { low: true, dur: 1, amb: "fun", quick: [["Carte +1", 1]] });
  C("coloretto", "Coloretto", "🦎", "Draft", 2, 5, 4,
    ["But du jeu : collecter des cartes de couleurs, en en gardant 3 couleurs maximum à points positifs. À son tour on pose une carte sur une rangée, ou on prend une rangée entière."],
    ["Pour une couleur : 1 carte = 1, 2 = 3, 3 = 6, 4 = 10, 5 = 15, 6 = 21 points. Les 3 meilleures couleurs comptent en positif, les autres en négatif. Joker +2 : +2 points."], ["Le plus haut total gagne."], { dur: 1, amb: "fam", quick: [["+3", 3], ["+6", 6], ["+10", 10]] });
  // Coopératif
  C("the-crew", "The Crew", "🚀", "Coopératif", 2, 5, 4,
    ["But du jeu : en équipe, réussir des missions en gagnant des plis précis, sans pouvoir parler de sa main. 40 cartes (4 couleurs et les fusées).", "On joue sans communiquer, avec seulement de rares indices donnés avec une carte."],
    ["On compte le nombre de missions réussies : à chaque mission, l'équipe gagne ou perd ensemble."], ["Tout le monde gagne si la mission est réussie."], { coop: true, dur: 1, amb: "coop", quick: [["Mission +1", 1]] });
  // Chaos
  C("fluxx", "Fluxx", "🌀", "Chaos", 2, 6, 4,
    ["But du jeu : réunir les cartes demandées par le but affiché. Les règles changent à chaque tour : on joue des cartes Nouvelle règle, Action, But et Objets.", "Au départ, on pioche 1 carte et on en joue 1."],
    ["On compte 1 point par manche gagnée."], ["Le premier à atteindre le nombre de victoires décidé gagne."], { target: 3, dur: 1, amb: "fun", quick: P1 });
  // Rapidité
  C("speed-cartes", "Speed (Spit)", "⚡", "Rapidité", 2, 2, 2,
    ["But du jeu : se débarrasser de toutes ses cartes avant l'autre. Chacun a 5 cartes de réserve et 4 piles de départ.", "Les deux joueurs jouent en même temps : on pose une carte qui est juste au-dessus ou en dessous de la carte du centre."],
    ["Chaque manche gagnée vaut 1 point."], ["Le premier à 3 manches gagne."], { target: 3, dur: 1, amb: "fun", quick: P1 });
  C("halli-galli", "Halli Galli", "🔔", "Rapidité", 2, 6, 4,
    ["But du jeu : sonner la cloche le plus vite quand il y a exactement 5 fruits identiques visibles sur les cartes retournées.", "À tour de rôle on retourne une carte devant soi. Si on sonne à tort, on donne une carte à chaque joueur."],
    ["Chaque sonnerie gagnée fait ramasser toutes les cartes retournées."], ["Celui qui ramasse toutes les cartes gagne la manche."], { target: 3, dur: 1, amb: "fun", quick: P1 });
  // Familial
  C("poisson", "Poisson (Go Fish)", "🐟", "Familial", 2, 6, 4,
    ["But du jeu : réunir le plus de séries de 4 cartes de même valeur. On demande à un joueur une valeur qu'on a déjà.", "S'il en a, il les donne et on rejoue. Sinon il répond « Pêche ! » et on pioche."],
    ["Chaque série complète de 4 cartes vaut 1 point."], ["Le plus de séries gagne."], { dur: 1, amb: "fam", quick: [["Série +1", 1]] });
  C("uno-flip", "Uno Flip", "🔄", "Familial", 2, 10, 4,
    ["But du jeu : comme au Uno, mais avec des cartes recto-verso. La carte Flip retourne tout le jeu sur son côté sombre, plus dur (+5, passe tout le monde, couleur au choix…)."],
    ["Le gagnant de la manche marque les points des cartes des autres : chiffres = valeur ; actions du côté clair = 10 à 20 ; actions du côté sombre = 20 à 60 (selon la boîte)."], ["Le premier à 500 points gagne."], { target: 500, targets: [300, 1000], dur: 2, amb: "fam", quick: [["Action +20", 20], ["Action sombre +30", 30], ["Joker +50", 50]] });
  // Duel de cartes
  C("yugioh", "Yu-Gi-Oh!", "🐉", "Duel de cartes", 2, 2, 2,
    ["But du jeu : faire tomber les points de vie de l'adversaire de 8000 à 0, avec ses monstres, magies et pièges (deck de 40 à 60 cartes)."],
    ["On compte les duels gagnés : un match se joue au meilleur des 3."], ["Le premier à 2 duels gagne."], { target: 2, dur: 2, amb: "tete", quick: P1 });
  C("lorcana", "Disney Lorcana", "✨", "Duel de cartes", 2, 2, 2,
    ["But du jeu : être le premier à accumuler 20 points de Savoir (Lore) en envoyant ses personnages à la quête et en les faisant attaquer."],
    ["Chaque personnage qui part en quête fait gagner des points de Savoir égaux à sa valeur de Savoir."], ["Le premier à 20 points de Savoir gagne."], { target: 20, dur: 2, amb: "tete", quick: [["+1", 1], ["+2", 2], ["+3", 3]] });
  C("schotten-totten", "Schotten Totten", "🪨", "Duel de cartes", 2, 2, 2,
    ["But du jeu : s'emparer de 5 bornes (ou de 3 qui se touchent) sur les 9 de la table. Chaque joueur pose 3 cartes de son côté de chaque borne.", "Celui qui fait la meilleure combinaison de 3 cartes (suite couleur, brelan, couleur, suite, somme) gagne la borne."],
    ["Chaque borne gagnée vaut 1 point."], ["Le premier à 5 bornes (ou 3 de suite) gagne."], { target: 5, dur: 1, amb: "tete", quick: [["Borne +1", 1]] });
  // Bluff
  C("coup", "Coup", "🎭", "Bluff", 2, 6, 4,
    ["But du jeu : être le dernier joueur à avoir encore une carte Influence. Chacun a 2 cartes (Duc, Assassin, Capitaine, Ambassadeur, Comtesse) et 2 pièces.", "À son tour on fait une action, vraie ou fausse, en prétendant avoir le personnage correspondant. N'importe qui peut contester : celui qui avait menti perd une carte."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 parties gagne."], { target: 3, dur: 1, amb: "fun", quick: V1 });
  // Soirée entre potes
  C("roi-des-rois", "Roi des rois (Ring of Fire)", "🍻", "Soirée entre potes", 3, 10, 5,
    ["But du jeu : jouer en cercle autour d'un verre au centre. Chacun tire une carte et applique sa règle : As = cascade, 2 = tu choisis qui boit, 3 = moi, 4 = les filles, 5 = les mecs… Roi = on remplit le verre central.", "Les règles de chaque carte varient selon les tables : mettez-vous d'accord au départ. Sans alcool, remplace les gorgées par des gages."],
    ["On compte les gorgées ou les gages : chaque pénalité vaut 1 point."], ["Le moins de pénalités gagne. Le joueur qui tire le 4e Roi perd (il boit le verre central, ou fait un gage)."], { low: true, dur: 2, amb: "apero", quick: [["Gage +1", 1], ["Gorgée +1", 1]] });
  C("le-bus", "Le Bus (Ride the Bus)", "🚌", "Soirée entre potes", 3, 10, 5,
    ["But du jeu : éviter de monter dans le bus. Rangée de 4 questions, une carte par joueur à chaque étape : rouge ou noir ? plus haut ou plus bas ? entre ou dehors ? la couleur ?", "Une mauvaise réponse = un gage ou une gorgée. Le joueur qui a cumulé le plus de pénalités « monte dans le bus » pour la manche finale."],
    ["Chaque mauvaise réponse vaut 1 pénalité."], ["Le joueur avec le moins de pénalités gagne ; celui qui en a le plus fait le gage final."], { low: true, dur: 1, amb: "apero", quick: [["Perdu +1", 1]] });

  // =================== AUTRES JEUX ===================
  // Jeux vidéo
  A("fortnite", "Fortnite / Battle royale", "🪂", "Jeux vidéo", 2, 4, 4,
    ["But du jeu : être le dernier en vie (en solo, duo ou escouade). Entre amis, on compare les victoires et les éliminations."],
    ["Victoire royale : 5 points. Chaque élimination : 1 point (barème maison, à adapter)."], ["Le plus de points après la soirée gagne."], { dur: 3, amb: "fun", quick: [["Victoire +5", 5], ["Élimination +1", 1]] });
  A("splatoon", "Splatoon", "🦑", "Jeux vidéo", 2, 8, 4,
    ["But du jeu : en équipes de 4, recouvrir le plus de sol avec son encre en 3 minutes (bataille de territoire), ou remplir d'autres objectifs."],
    ["Chaque manche gagnée par son équipe vaut 1 point."], ["Le plus de manches gagnées gagne."], { teams: true, dur: 2, amb: "fun", quick: P1 });
  A("tetris", "Tetris (duel)", "🧱", "Jeux vidéo", 2, 4, 2,
    ["But du jeu : survivre le plus longtemps en alignant des tétrominos. En duel, les lignes faites envoient des lignes gênantes à l'adversaire."],
    ["Manche gagnée : 1 point. En mode solo : score ou nombre de lignes."], ["Le premier à 3 manches gagne."], { target: 3, dur: 1, amb: "fun", quick: P1 });
  A("rock-band", "Guitar Hero / Rock Band", "🎸", "Jeux vidéo", 2, 4, 4,
    ["But du jeu : jouer les notes au bon moment sur une guitare, une batterie ou au micro, sur des morceaux connus."],
    ["On note le score de chaque morceau affiché par le jeu."], ["Le plus de points cumulés gagne."], { dur: 2, amb: "fun", quick: [["+10 000", 10000], ["+50 000", 50000]] });
  // Plein air
  A("croquet", "Croquet", "🔨", "Plein air", 2, 6, 4,
    ["But du jeu : faire passer sa balle dans tous les arceaux, dans l'ordre, puis toucher le piquet, à coups de maillet."],
    ["Chaque arceau franchi vaut 1 point, et le piquet final 1 point en plus."], ["Le premier qui a fini le parcours gagne, ou le plus de points au bout du temps décidé."], { dur: 2, amb: "air", quick: [["Arceau +1", 1], ["Piquet +1", 1]] });
  A("chasse-tresor", "Chasse au trésor", "🗺️", "Plein air", 2, 12, 6,
    ["But du jeu : trouver des indices cachés pour arriver au trésor final. On joue en équipes ou chacun pour soi."],
    ["Chaque indice trouvé vaut 1 point, le trésor final 3 points."], ["La première équipe qui trouve le trésor gagne, ou celle qui a le plus de points."], { teams: true, dur: 2, amb: "enfants", quick: [["Indice +1", 1], ["Trésor +3", 3]] });
  A("olympiades", "Olympiades en famille", "🏅", "Plein air", 2, 12, 6,
    ["But du jeu : enchaîner des épreuves rigolotes en équipes ou en solo : course en sac, relais, lancer d'éponge, tir à la corde, etc."],
    ["Par épreuve : 1er 3 points, 2e 2 points, 3e 1 point."], ["Le plus de points à la fin des épreuves gagne."], { teams: true, dur: 3, amb: "air", quick: [["1er +3", 3], ["2e +2", 2], ["3e +1", 1]] });
  A("balle-prisonnier", "Balle au prisonnier", "🏐", "Plein air", 4, 14, 8,
    ["But du jeu : toucher les joueurs de l'autre équipe avec le ballon, sans qu'ils l'attrapent. Un joueur touché devient prisonnier derrière le camp adverse."],
    ["Chaque joueur touché rapporte 1 point à l'équipe qui l'a touché."], ["L'équipe qui a fait prisonniers tous les adversaires gagne la manche."], { teams: true, dur: 2, amb: "air", quick: [["Touché +1", 1]] });
  // Sport
  A("rugby", "Rugby", "🏉", "Sport", 2, 2, 2,
    ["But du jeu : marquer plus de points que l'adversaire en posant le ballon dans l'en-but (essai) ou en tapant entre les poteaux. Entre amis, on peut jouer à toucher."],
    ["Essai : 5 points. Transformation : 2. Pénalité : 3. Drop : 3."], ["Le plus de points à la fin du temps de jeu gagne."], { teams: true, dur: 3, amb: "air", quick: [["Essai +5", 5], ["Transformation +2", 2], ["Pénalité +3", 3], ["Drop +3", 3]] });
  A("foot-potes", "Foot entre potes", "⚽", "Sport", 2, 2, 2,
    ["But du jeu : marquer plus de buts que l'autre équipe sur un terrain, un city-stade ou un petit espace. On joue à 3, 5 ou 7 par équipe."],
    ["Chaque but vaut 1 point."], ["L'équipe qui a marqué le plus de buts gagne (ou la première à 5 ou 10)."], { teams: true, dur: 2, amb: "air", quick: [["But +1", 1]] });
  // Déduction
  A("decrypto", "Décrypto", "🔐", "Déduction", 4, 8, 6,
    ["But du jeu : faire deviner à son équipe un code de 3 chiffres à partir d'indices, sans que l'équipe adverse le comprenne.", "Chaque équipe a 4 mots secrets numérotés. Un joueur donne 3 indices pour les mots du code, son équipe doit trouver le code, et l'adversaire tente de l'intercepter."],
    ["Interception réussie : 1 jeton Interception. Code mal compris par son équipe : 1 jeton Brouillage."], ["La première équipe à 2 jetons Interception gagne, ou perd si elle a 2 jetons Brouillage."], { teams: true, target: 2, dur: 2, amb: "tete", quick: [["Interception +1", 1], ["Brouillage −1", -1]] });
  A("mysterium", "Mysterium", "👻", "Déduction", 2, 7, 5,
    ["But du jeu : un joueur est le fantôme et envoie des visions (cartes illustrées) aux médiums pour leur faire retrouver le meurtrier, le lieu et l'arme.", "Les médiums doivent décoder les visions avant 7 tours."],
    ["Chaque médium qui trouve sa carte personne, lieu et arme avance. Tout le monde gagne si l'équipe trouve le coupable à la fin."], ["Victoire ou défaite en équipe."], { coop: true, dur: 3, amb: "coop", quick: [["Personnage trouvé +1", 1]] });
  A("scotland-yard", "Scotland Yard", "🕵️", "Déduction", 3, 6, 4,
    ["But du jeu : les détectives doivent attraper Mister X qui se déplace en secret dans Londres. Mister X ne se montre que 5 fois sur 24 tours.", "Les détectives dépensent des tickets de bus, de métro ou de taxi pour se déplacer."],
    ["Mister X gagne s'il échappe aux détectives pendant 24 tours. Les détectives gagnent s'ils le capturent."], ["On compte les parties gagnées : on échange les rôles à chaque partie."], { dur: 3, amb: "tete", quick: V1 });
  A("escape-game", "Escape game (Unlock!, Exit)", "🗝️", "Déduction", 1, 6, 4,
    ["But du jeu : en équipe, résoudre des énigmes et des codes pour s'échapper d'une pièce, avec un temps limité (60 minutes en général).", "Les jeux comme Unlock! ou Exit se jouent avec des cartes ou des cahiers à décoder, sans plateau."],
    ["On compte les indices utilisés. À la fin, le jeu attribue de 1 à 5 étoiles."], ["Tout le monde gagne ou perd ensemble."], { coop: true, dur: 3, amb: "coop", quick: [["Étoile +1", 1], ["Indice −1", -1]] });
  A("murder-party", "Murder party", "🔪", "Déduction", 5, 16, 8,
    ["But du jeu : jouer un personnage, enquêter et démasquer le meurtrier lors d'une soirée costumée. Chacun reçoit un rôle, des secrets et des objectifs."],
    ["Le coupable démasqué fait gagner l'équipe des enquêteurs. Un coupable non démasqué gagne seul."], ["On compte 1 point par victoire dans son rôle."], { dur: 3, amb: "apero", quick: V1 });
  // Mots
  A("sutom", "Wordle / Sutom (défi)", "🟩", "Mots", 2, 8, 3,
    ["But du jeu : trouver le mot du jour en 6 essais maximum. Chacun joue sur son téléphone, puis on compare."],
    ["On note le nombre d'essais pour trouver le mot (1 à 6). Non trouvé : 7."], ["Le plus petit nombre d'essais gagne."], { low: true, dur: 1, amb: "tete", quick: [["1 essai", 1], ["2 essais", 2], ["3 essais", 3], ["4 essais", 4], ["Raté 7", 7]] });
  A("mot-de-passe", "Mot de passe (Password)", "🔑", "Mots", 4, 10, 4,
    ["But du jeu : faire deviner un mot secret à son partenaire en ne donnant que des indices d'un seul mot, chacun à son tour."],
    ["Plus le mot est trouvé tôt, plus il rapporte : 10 points au 1er indice, 9 au 2e, et ainsi de suite jusqu'à 1."], ["Le plus de points après les tours gagne."], { teams: true, dur: 2, amb: "fun", quick: [["1er indice +10", 10], ["2e +9", 9], ["3e +8", 8], ["5e +6", 6]] });
  A("scrabble-duplicate", "Scrabble Duplicate", "🔡", "Mots", 2, 20, 4,
    ["But du jeu : tout le monde joue le même tirage de lettres, en même temps. Chacun cherche le meilleur mot possible et l'écrit sur sa feuille.", "On prend le meilleur mot trouvé, on le pose sur la grille, et on passe au tirage suivant."],
    ["Chaque joueur marque la valeur de son mot (au maximum, celle du meilleur coup possible)."], ["Le plus haut total sur toute la partie gagne."], { dur: 3, amb: "tete", quick: [["Top +60", 60], ["Scrabble +80", 80]] });
  // Abstrait
  A("othello", "Othello (Reversi)", "⚫", "Abstrait", 2, 2, 2,
    ["But du jeu : avoir le plus de pions de sa couleur à la fin. Sur un plateau 8×8, on pose un pion de façon à encadrer des pions adverses, qui se retournent."],
    ["À la fin de la partie, on compte les pions de sa couleur (maximum 64)."], ["Le plus de pions gagne."], { dur: 1, amb: "tete", quick: [["+1", 1]] });
  A("go", "Jeu de Go", "⚪", "Abstrait", 2, 2, 2,
    ["But du jeu : entourer le plus de territoire en posant des pierres sur les intersections d'un goban. Noir commence ; une pierre ou un groupe sans libertés est capturé."],
    ["Territoire entouré + pierres capturées. Blanc reçoit une compensation (komi) de 6,5 points (7,5 selon les règles)."], ["Le plus haut total gagne."], { dur: 3, amb: "tete", quick: [["+1", 1]] });
  A("abalone", "Abalone", "🔵", "Abstrait", 2, 2, 2,
    ["But du jeu : pousser 6 billes adverses hors du plateau hexagonal. On déplace 1, 2 ou 3 billes alignées, et on pousse les billes adverses si on est plus nombreux."],
    ["Chaque bille adverse éjectée vaut 1 point."], ["Le premier à 6 billes éjectées gagne."], { target: 6, dur: 2, amb: "tete", quick: [["Bille +1", 1]] });
  A("quarto", "Quarto", "🔲", "Abstrait", 2, 2, 2,
    ["But du jeu : aligner 4 pièces ayant un point commun (taille, couleur, forme ou trou). Le vice : c'est l'adversaire qui choisit la pièce que tu dois poser."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 parties gagne."], { target: 3, dur: 1, amb: "tete", quick: V1 });
  // Duel
  A("awale", "Awalé", "🌰", "Duel", 2, 2, 2,
    ["But du jeu : capturer le plus de graines. 12 trous, 4 graines dans chacun. À son tour, on prend toutes les graines d'un de ses trous et on les sème une par une, dans le sens inverse des aiguilles d'une montre.", "Si la dernière graine tombe chez l'adversaire dans un trou qui contient alors 2 ou 3 graines, on les capture."],
    ["Chaque graine capturée vaut 1 point."], ["Le premier à avoir capturé 25 graines gagne."], { target: 25, dur: 1, amb: "tete", quick: [["+2", 2], ["+3", 3]] });
  A("morpion", "Morpion (Tic-tac-toe)", "❌", "Duel", 2, 2, 2,
    ["But du jeu : aligner 3 de ses symboles (X ou O) sur une grille de 3×3, en jouant à tour de rôle."],
    ["Chaque partie gagnée vaut 1 point (nul : 0)."], ["Le premier à 5 victoires gagne."], { target: 5, dur: 1, amb: "fun", quick: V1 });
  A("hive", "Hive", "🐝", "Duel", 2, 2, 2,
    ["But du jeu : entourer la reine abeille adverse avec ses 6 faces. Pas de plateau : on pose et on déplace des pièces insectes (fourmi, araignée, scarabée…) qui forment la ruche."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 victoires gagne."], { target: 3, dur: 2, amb: "tete", quick: V1 });
  A("santorini", "Santorini", "🏛️", "Duel", 2, 2, 2,
    ["But du jeu : monter un de ses ouvriers sur un bâtiment de niveau 3. À son tour on déplace un ouvrier, puis on construit un étage à côté de lui. Un dôme bloque la case."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 victoires gagne."], { target: 3, dur: 1, amb: "tete", quick: V1 });
  // Adresse
  A("crokinole", "Crokinole", "🎯", "Adresse", 2, 4, 2,
    ["But du jeu : faire glisser des palets d'une chiquenaude sur un plateau circulaire pour viser le trou central ou les zones de points, en éjectant les palets adverses."],
    ["Trou central : 20 points. Zone intérieure : 15 points, puis 10, puis 5. Un palet doit toucher un autre palet quand il y en a sur le plateau."], ["Le premier à 100 points (ou après 4 manches) gagne."], { target: 100, dur: 2, amb: "fun", quick: [["Trou +20", 20], ["+15", 15], ["+10", 10], ["+5", 5]] });
  A("chamboule-tout", "Chamboule-tout", "🥫", "Adresse", 2, 10, 4,
    ["But du jeu : faire tomber des boîtes empilées en lançant une balle. Chacun a 3 lancers par tour."],
    ["Chaque boîte renversée vaut 1 point."], ["Le plus de boîtes en 3 tours gagne."], { dur: 1, amb: "enfants", quick: [["Boîte +1", 1]] });
  A("ricochets", "Concours de ricochets", "🌊", "Adresse", 2, 10, 4,
    ["But du jeu : faire rebondir une pierre plate le plus de fois possible sur l'eau. Chacun a 3 lancers."],
    ["On compte le nombre de rebonds du meilleur lancer."], ["Le plus de rebonds gagne."], { dur: 1, amb: "air", quick: [["Rebond +1", 1]] });
  A("jeu-bouchons", "Lancer de bouchons", "🍾", "Adresse", 2, 8, 4,
    ["But du jeu : lancer un bouchon (ou une pièce) le plus près possible d'une ligne ou dans un gobelet, depuis une distance fixée."],
    ["Dans le gobelet : 3 points. Le plus près de la cible : 1 point."], ["Le premier à 15 points gagne."], { target: 15, dur: 1, amb: "apero", quick: [["Gobelet +3", 3], ["Plus près +1", 1]] });
  // Bluff
  A("avalon", "Avalon / The Resistance", "⚔️", "Bluff", 5, 10, 7,
    ["But du jeu : une équipe de Loyaux doit réussir 3 missions sur 5. Les Espions, cachés parmi eux, essaient de faire échouer 3 missions.", "À chaque tour, le chef propose une équipe, qu'on vote. Les membres choisissent en secret de faire réussir ou échouer la mission."],
    ["Mission réussie : 1 point pour les Loyaux. Mission échouée : 1 point pour les Espions."], ["Le premier camp à 3 missions gagne."], { teams: true, target: 3, dur: 2, amb: "fun", quick: [["Réussie +1", 1], ["Échouée +1", 1]] });
  A("poker-menteur", "Poker menteur (dés)", "🎲", "Bluff", 2, 6, 4,
    ["But du jeu : annoncer plus fort que l'adversaire, sans mentir trop. Chacun a 5 dés sous un gobelet.", "À son tour on annonce une combinaison (par ex. « deux As ») qu'on pense avoir avec ceux de tout le monde, ou on dit « Menteur ! » : on soulève les gobelets pour vérifier."],
    ["Celui qui avait tort perd un dé."], ["Le dernier qui a encore des dés gagne."], { dur: 1, amb: "fun", quick: V1 });
  // Coopératif
  A("ile-interdite", "L'Île interdite", "🏝️", "Coopératif", 2, 4, 4,
    ["But du jeu : en équipe, récupérer les 4 trésors de l'île qui s'enfonce, puis s'échapper en hélicoptère.", "À son tour : 3 actions (se déplacer, assécher, donner une carte, prendre un trésor), puis on pioche et l'île se submerge davantage."],
    ["On compte les trésors récupérés (de 0 à 4)."], ["L'équipe gagne si tout le monde s'échappe avec les 4 trésors."], { coop: true, dur: 2, amb: "coop", quick: [["Trésor +1", 1]] });
  A("magic-maze", "Magic Maze", "🧙", "Coopératif", 1, 8, 4,
    ["But du jeu : en 3 minutes (sablier), voler des objets dans un centre commercial et s'enfuir. Les joueurs jouent tous en même temps, sans parler.", "Chaque joueur n'a le droit de faire qu'un seul type de déplacement pour tous les pions."],
    ["On compte les scénarios réussis."], ["L'équipe gagne ou perd ensemble."], { coop: true, dur: 2, amb: "coop", quick: [["Scénario +1", 1]] });
  // Familial
  A("docteur-maboul", "Docteur Maboul", "🩺", "Familial", 2, 4, 4,
    ["But du jeu : retirer les organes du patient avec une pince, sans toucher les bords (sinon ça sonne). On tire une carte « opération » qui dit quoi retirer."],
    ["Chaque opération réussie rapporte une somme d'argent ou 1 point."], ["Le plus de points gagne."], { dur: 1, amb: "enfants", quick: [["Opération +1", 1]] });
  // Enfants
  A("le-verger", "Le Verger", "🍎", "Enfants", 2, 8, 4,
    ["But du jeu : en équipe, récolter tous les fruits avant que le corbeau n'arrive. On lance le dé : couleur d'un fruit = on le cueille ; corbeau = il avance d'une case."],
    ["Les enfants gagnent ensemble s'ils ont tout cueilli avant que le corbeau soit au bout."], ["On compte 1 point par partie gagnée contre le corbeau."], { coop: true, dur: 1, amb: "enfants", quick: V1 });
  A("chaises-musicales", "Chaises musicales", "🪑", "Enfants", 4, 14, 8,
    ["But du jeu : s'asseoir quand la musique s'arrête. On tourne autour de chaises, une de moins que de joueurs. Celui qui reste debout est éliminé et on enlève une chaise."],
    ["Le dernier joueur resté gagne la manche : 1 point."], ["Le plus de manches gagnées gagne."], { dur: 1, amb: "enfants", quick: P1 });
  A("un-deux-trois-soleil", "1, 2, 3, soleil !", "☀️", "Enfants", 3, 12, 6,
    ["But du jeu : toucher le mur du meneur sans qu'il vous voie bouger. Le meneur, de dos, dit « 1, 2, 3, soleil ! » et se retourne : celui qui bouge retourne au départ."],
    ["Le premier qui touche le meneur gagne la manche : 1 point."], ["Le plus de manches gagnées gagne."], { dur: 1, amb: "enfants", quick: P1 });
  A("jacques-a-dit", "Jacques a dit", "🗣️", "Enfants", 3, 12, 6,
    ["But du jeu : faire seulement ce que « Jacques a dit ». Le meneur donne des ordres : si « Jacques a dit » n'est pas prononcé, il ne faut pas obéir."],
    ["Chaque joueur qui se trompe est éliminé. Le dernier gagne la manche : 1 point."], ["Le plus de manches gagnées gagne."], { dur: 1, amb: "enfants", quick: P1 });
  A("cache-cache", "Cache-cache", "🙈", "Enfants", 3, 12, 6,
    ["But du jeu : se cacher sans être trouvé. Le chercheur compte jusqu'à 20 puis part à la recherche des autres."],
    ["Chaque joueur trouvé en dernier marque 1 point. Le dernier non trouvé fait le chercheur à la manche suivante, ou gagne."], ["Le plus de points après les manches gagne."], { dur: 2, amb: "enfants", quick: P1 });
  A("peche-canards", "Pêche aux canards", "🦆", "Enfants", 2, 10, 4,
    ["But du jeu : attraper avec une canne un canard qui flotte. Au dos de chaque canard, un numéro donne des points ou un lot."],
    ["On additionne les numéros des canards pêchés."], ["Le plus de points gagne."], { dur: 1, amb: "enfants", quick: [["+1", 1], ["+2", 2], ["+3", 3]] });
  A("chasse-oeufs", "Chasse aux œufs", "🥚", "Enfants", 2, 12, 6,
    ["But du jeu : trouver le plus d'œufs cachés dans le jardin ou la maison, en un temps limité."],
    ["Chaque œuf trouvé vaut 1 point. Un œuf spécial (doré) vaut 5 points."], ["Le plus de points gagne."], { dur: 1, amb: "enfants", quick: [["Œuf +1", 1], ["Doré +5", 5]] });
  // Soirée entre potes
  A("jamais-je-nai", "Je n'ai jamais…", "🙊", "Soirée entre potes", 3, 12, 6,
    ["But du jeu : découvrir des secrets sur ses amis. À tour de rôle on dit « Je n'ai jamais… » suivi d'une action. Ceux qui l'ont déjà faite baissent un doigt (ou font un gage).", "On part avec 5 doigts levés. On peut jouer sans alcool."],
    ["Chaque doigt baissé (ou gage) vaut 1 point."], ["Celui qui a perdu le moins de doigts gagne. Celui qui n'en a plus est éliminé."], { low: true, target: 5, dur: 2, amb: "apero", quick: [["Doigt baissé +1", 1]] });
  A("action-verite", "Action ou vérité", "😈", "Soirée entre potes", 3, 12, 6,
    ["But du jeu : répondre sincèrement à une question (vérité) ou réaliser un défi (action). Chacun choisit à son tour. Le groupe vote la question ou le défi.", "Fixez avant de jouer les limites que personne ne dépasse."],
    ["Défi réalisé ou vérité dite : 1 point. Refus : 0."], ["Le plus de points gagne."], { dur: 2, amb: "apero", quick: [["Réalisé +1", 1], ["Refusé 0", 0]] });
  A("flip-cup", "Flip cup", "🥤", "Soirée entre potes", 4, 14, 8,
    ["But du jeu : deux équipes en file se font la course. Chacun doit boire (ou vider) son gobelet puis le retourner sur la table d'une pichenette, avant que le suivant joue. Fonctionne aussi avec de l'eau ou du jus."],
    ["Chaque manche gagnée par l'équipe : 1 point."], ["Le premier à 3 manches gagne."], { teams: true, target: 3, dur: 1, amb: "apero", quick: P1 });
  A("qui-suis-je", "Qui suis-je ? (post-it)", "📝", "Soirée entre potes", 3, 12, 6,
    ["But du jeu : deviner le personnage écrit sur le post-it collé sur son front. On pose des questions auxquelles les autres répondent seulement par oui ou par non."],
    ["Chaque personnage trouvé vaut 1 point, sans dépasser 20 questions."], ["Le plus de points après les manches gagne."], { dur: 2, amb: "fun", quick: [["Trouvé +1", 1]] });
  // Mémoire
  A("jeu-du-kim", "Jeu du Kim", "👀", "Mémoire", 2, 10, 4,
    ["But du jeu : retenir des objets posés sur un plateau. On les montre 30 secondes, puis on les cache. Chacun écrit tout ce dont il se souvient."],
    ["Chaque objet retrouvé vaut 1 point."], ["Le plus d'objets retrouvés gagne."], { dur: 1, amb: "fam", quick: [["Objet +1", 1]] });
  A("ma-valise", "Je prépare ma valise", "🧳", "Mémoire", 3, 12, 6,
    ["But du jeu : répéter une liste qui s'allonge. Le premier dit « Dans ma valise, il y a… » et un objet. Chaque joueur répète toute la liste dans l'ordre, puis en ajoute un."],
    ["Un joueur qui se trompe perd 1 point (ou est éliminé)."], ["Le moins de fautes gagne."], { low: true, dur: 1, amb: "fam", quick: [["Faute +1", 1]] });
  A("simon", "Simon (jeu de mémoire)", "🔴", "Mémoire", 1, 6, 3,
    ["But du jeu : reproduire une suite de sons et de couleurs qui s'allonge à chaque tour, sur le jeu électronique Simon ou une application."],
    ["On note la longueur de la plus longue suite reproduite sans erreur."], ["Le plus long score gagne."], { dur: 1, amb: "fam", quick: [["+1", 1], ["+5", 5]] });
  // Quiz
  A("qpuc", "Questions pour un champion", "🏆", "Quiz", 2, 8, 4,
    ["But du jeu : buzzer et répondre le plus vite possible à des questions de culture générale, en 4 phases (« Neuf points gagnants », « Quatre à la suite », « Face à face »…) comme à la télé."],
    ["Bonne réponse : 1 point. Mauvaise : 0 ou −1 selon la règle choisie."], ["Le premier à 9 points gagne la phase."], { target: 9, dur: 2, amb: "tete", quick: [["Bonne +1", 1], ["Mauvaise −1", -1]] });
  A("burger-quiz", "Burger Quiz (maison)", "🍔", "Quiz", 4, 12, 6,
    ["But du jeu : deux équipes s'affrontent en manches fantaisistes : Nuggets (questions rapides), Sel ou poivre (choisir entre 2), Menu, Addition, puis le Burger de la mort pour trancher.", "À jouer avec un animateur et des questions préparées ou trouvées sur Internet."],
    ["Chaque bonne réponse vaut 1 point. Certaines manches valent plus."], ["L'équipe avec le plus de points gagne (ou perd le Burger de la mort)."], { teams: true, dur: 3, amb: "fun", quick: [["Bonne +1", 1], ["+2", 2], ["+3", 3]] });
  A("millions", "Qui veut gagner des millions ? (maison)", "💰", "Quiz", 2, 8, 4,
    ["But du jeu : répondre à 15 questions de plus en plus difficiles sans se tromper. À chaque question on peut s'arrêter ou continuer. Il y a des paliers protégés et trois jokers (50/50, avis du public, appel à un ami)."],
    ["On note le numéro de la dernière question réussie (de 1 à 15)."], ["Le joueur qui va le plus loin gagne."], { dur: 2, amb: "tete", quick: [["Question +1", 1]] });
  A("geoguessr", "GeoGuessr", "🌍", "Quiz", 2, 8, 4,
    ["But du jeu : deviner où on se trouve dans le monde à partir d'une image de rue (Street View), en plaçant un repère sur la carte. 5 manches."],
    ["Chaque manche donne jusqu'à 5 000 points : plus le repère est près du lieu, plus il y en a. Maximum 25 000 points."], ["Le plus de points après 5 manches gagne."], { dur: 2, amb: "tete", quick: [["+1000", 1000], ["+3000", 3000], ["+5000", 5000]] });
  A("quiz-famille", "Quiz de famille", "👨‍👩‍👧", "Quiz", 3, 12, 5,
    ["But du jeu : se poser des questions sur la famille, les souvenirs, les prénoms, les anecdotes. Chacun prépare 3 questions avant de jouer."],
    ["Bonne réponse : 1 point. Un bonus de 1 point à celui qui a posé la question la plus difficile."], ["Le plus de points gagne."], { dur: 2, amb: "fam", quick: [["Bonne +1", 1], ["Bonus +1", 1]] });
})();
