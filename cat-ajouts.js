// Jeux entre potes et en famille (lot 5). Même format que cat-famille.js : C = jeu de cartes, A = autre jeu.
// Les règles sont celles du jeu de base ; beaucoup ont des variantes « maison », à adapter avec la boîte de jeu.
(function () {
  const mk = (list) => (id, name, emoji, cat, min, max, dp, rules, scoring, winner, o = {}) =>
    list.push({ id, name, emoji, cat, min, max, dp, low: false, teams: false, quick: [], targets: [], rules, scoring, winner, ...o });
  const C = mk(window.CAT_CARTES), A = mk(window.CAT_AUTRES);

  // =================== JEUX DE CARTES ===================
  C("rummy-500", "Rummy 500", "🔢", "Rami", 2, 6, 4,
    ["But du jeu : poser des combinaisons (suites de 3 cartes ou plus de la même couleur, brelans et carrés) pour marquer plus de points que les autres.", "À son tour on pioche (talon, ou une ou plusieurs cartes de la défausse si on peut poser la plus profonde), on pose des combinaisons, puis on défausse."],
    ["Cartes posées : As = 15 (ou 1 dans A-2-3), figures et 10 = 10, autres cartes = leur valeur.", "À la fin de la manche, on retire de son total la valeur des cartes qui restent en main (le score d'une manche peut être négatif)."],
    ["Le premier à atteindre 500 points gagne. Si plusieurs joueurs dépassent 500 à la même manche, le plus haut score l'emporte."],
    { target: 500, targets: [300, 1000], quick: [["Pose +15", 15], ["Pose +10", 10]] });
  C("monopoly-deal", "Monopoly Deal", "💳", "Cartes", 2, 5, 4,
    ["But du jeu : être le premier à réunir 3 ensembles de propriétés complets, de couleurs différentes.", "À son tour on pioche 2 cartes, puis on joue jusqu'à 3 cartes : propriétés, argent (banque) ou cartes d'action (loyer, voler une propriété, « Pas de ça ! »…)."],
    ["On compte 1 point par manche gagnée."], ["On joue plusieurs manches : le premier qui atteint le nombre de victoires décidé gagne."],
    { target: 3, targets: [2, 5], quick: [["Manche gagnée +1", 1]] });
  C("unstable-unicorns", "Unstable Unicorns", "🦄", "Chaos", 2, 8, 4,
    ["But du jeu : être le premier à avoir 7 licornes dans son écurie (6 à partir de 6 joueurs).", "À son tour on pioche, on peut jouer une carte (licorne, amélioration, handicap, magie ou instantané), puis on défausse si on a trop de cartes. Les cartes d'action permettent de saboter les autres."],
    ["On compte 1 point par manche gagnée."], ["Le premier à atteindre le nombre de manches décidé gagne."],
    { target: 3, targets: [2, 5], quick: [["Manche gagnée +1", 1]] });
  C("munchkin", "Munchkin", "🗡️", "Chaos", 3, 6, 4,
    ["But du jeu : être le premier à atteindre le niveau 10. Tout le monde commence au niveau 1.", "À son tour on ouvre une porte : monstre à combattre, malédiction ou carte à garder. On peut demander de l'aide (contre un trésor), et les autres joueurs ont le droit de saboter le combat.", "Le niveau 10 doit être atteint en tuant un monstre (sauf mention contraire sur une carte)."],
    ["Monstre tué : +1 niveau (ou plus selon le monstre), et on pioche ses trésors.", "On peut aussi monter de niveau en vendant des objets (1000 pièces d'or = 1 niveau) ou avec certaines cartes."],
    ["Le premier joueur qui atteint le niveau 10 gagne."],
    { target: 10, quick: [["Niveau +1", 1], ["Niveau +2", 2], ["Niveau −1", -1]] });
  C("pokemon-jcc", "Pokémon (jeu de cartes)", "⚡", "Duel de cartes", 2, 2, 2,
    ["But du jeu : prendre toutes ses cartes Récompense (6 en général) en mettant K.O. les Pokémon de l'adversaire.", "À son tour on pioche, on peut attacher une énergie, jouer des Dresseurs, faire évoluer ses Pokémon, battre en retraite, puis attaquer."],
    ["Un Pokémon K.O. fait prendre 1 carte Récompense. Les Pokémon-ex et assimilés en font prendre 2 (3 pour certains très gros)."],
    ["Gagne celui qui prend sa dernière carte Récompense, met K.O. le dernier Pokémon adverse en jeu, ou dont l'adversaire ne peut plus piocher."],
    { target: 6, quick: [["Récompense +1", 1], ["Pokémon-ex +2", 2], ["Gros Pokémon +3", 3]] });
  C("magic", "Magic : l'Assemblée (MTG)", "🪄", "Duel de cartes", 2, 6, 2,
    ["But du jeu : faire tomber les points de vie de l'adversaire à 0 (20 PV en duel, 40 PV en Commander).", "Chacun joue avec son propre deck. On pose des terrains pour produire du mana, on lance des sorts et on attaque avec ses créatures."],
    ["Pour garder les points de vie pendant la partie, utilise le compteur de vie de la boîte à outils.", "Ici on compte les parties gagnées : 1 point par partie remportée."],
    ["Un match se joue en général au meilleur des 3 parties : le premier à 2 victoires gagne."],
    { target: 2, targets: [3], quick: [["Partie gagnée +1", 1]] });
  C("tarot-africain", "Tarot africain", "🌍", "Plis", 3, 8, 4,
    ["But du jeu : annoncer exactement le nombre de plis qu'on va faire. Se joue avec un jeu de tarot ; le nombre de cartes distribuées diminue à chaque manche (souvent de 5 jusqu'à 1).", "Chacun annonce son nombre de plis, à tour de rôle. Le dernier à annoncer n'a pas le droit de faire un total égal au nombre de plis de la manche : au moins un joueur sera donc déçu."],
    ["On perd autant de points que l'écart entre le nombre de plis annoncés et le nombre de plis faits (annonce réussie : 0)."],
    ["Le plus petit total de points perdus gagne. Variante : on joue jusqu'à ce qu'un joueur atteigne la limite fixée."],
    { low: true });
  C("trente-et-un", "31 (Schwimmen)", "🏊", "Familial", 2, 9, 4,
    ["But du jeu : avoir en main la meilleure somme de cartes d'une même couleur, le plus près possible de 31. Jeu de 32 cartes, 3 cartes par joueur et 3 cartes au centre.", "À son tour on échange une carte avec le centre, ou les trois, ou on passe, ou on « frappe » (les autres jouent encore un tour). Valeurs : As = 11, figures = 10, autres cartes = leur valeur.", "31 immédiat termine la manche. Trois cartes de même valeur comptent 30,5."],
    ["Le joueur avec la plus petite main perd la manche et reçoit 1 point de pénalité (3 « vies » en général)."],
    ["Un joueur qui atteint 3 pénalités est éliminé : le moins pénalisé gagne."],
    { low: true, target: 3, quick: [["Perdu +1", 1]] });
  C("parlement", "Le Parlement (Sevens)", "🏛️", "Défausse", 3, 8, 4,
    ["But du jeu : se débarrasser de toutes ses cartes en les alignant sur la table. Jeu de 52 cartes, toutes distribuées.", "Celui qui a le 7 de carreau commence. On pose ensuite les 7 des autres couleurs, puis on construit vers le haut et vers le bas de chaque couleur (6, 8, 5, 9…). Si on ne peut pas jouer, on passe (ou on paie un gage)."],
    ["Quand quelqu'un a fini, les autres comptent 1 point de pénalité par carte restante en main."],
    ["On joue plusieurs manches : le plus petit total gagne."],
    { low: true, target: 100, targets: [50, 150] });
  C("taco-chat", "Taco Chat Bouc Cheese Pizza", "🌮", "Rapidité", 3, 8, 5,
    ["But du jeu : être le premier à poser toutes ses cartes. Chacun a son tas face cachée.", "À tour de rôle on retourne une carte au centre en disant un mot de la suite : « Taco, Chat, Bouc, Cheese, Pizza », puis on recommence.", "Si la carte retournée correspond au mot prononcé, tout le monde tape sur le tas : le dernier à taper ramasse le tas. Les cartes spéciales (gorille, marmotte, narval…) demandent un geste particulier."],
    ["On marque 1 point à chaque manche gagnée."], ["Le premier à vider son tas gagne la manche ; le plus de manches gagnées gagne la partie."],
    { target: 3, quick: [["Manche +1", 1]] });
  C("bataille-corse", "Bataille corse", "🏴", "Rapidité", 2, 6, 3,
    ["But du jeu : ramasser toutes les cartes. Chacun a un tas face cachée et pose une carte au centre à tour de rôle.", "On tape sur le tas quand deux cartes de même valeur se suivent (ou avec une carte entre les deux). Le plus rapide ramasse tout le tas.", "Une figure oblige l'adversaire à payer : Valet 1 carte, Dame 2, Roi 3, As 4. S'il paie sans figure, l'autre ramasse le tas."],
    ["On marque 1 point par partie gagnée."], ["Le joueur qui a le plus de victoires gagne."],
    { target: 3, quick: [["Partie +1", 1]] });
  C("dominion", "Dominion", "🏰", "Cartes", 2, 4, 4,
    ["But du jeu : construire son deck pour acheter des cartes Victoire. Chacun commence avec 10 cartes (7 Cuivres et 3 Domaines).", "À son tour : phase Action (jouer une action), phase Achat (acheter une carte avec ses pièces), puis on défausse tout et on repioche 5 cartes.", "La partie se termine quand la pile des Provinces est vide, ou que 3 piles sont vides."],
    ["Domaine = 1 point, Duché = 3 points, Province = 6 points, Malédiction = −1 point. Certaines cartes Royaume rapportent des points en plus."],
    ["Le plus de points de victoire gagne. En cas d'égalité, celui qui a joué le moins de tours l'emporte."],
    { quick: [["Domaine +1", 1], ["Duché +3", 3], ["Province +6", 6], ["Malédiction −1", -1]] });

  // =================== AUTRES JEUX ===================
  A("quatre-vingt-vingt-un", "421", "🎲", "Dés", 2, 8, 4,
    ["But du jeu : se débarrasser de ses jetons en faisant de meilleures combinaisons que les autres. On lance 3 dés, jusqu'à 3 fois en gardant les dés de son choix.", "Combinaisons, de la plus forte à la plus faible : 421, 111, 666 puis les autres « as » (11x), les brelans, les suites, et le reste (nénette)."],
    ["Valeur des combinaisons en jetons (courantes, à adapter) : 421 = 10, 111 = 7, 666 = 6, as + as + x = x, brelan = valeur du dé, suite = 2, nénette = 1.", "Le perdant de la manche prend les jetons du gagnant dans le pot (21 jetons au départ)."],
    ["Version simplifiée ici : on compte les jetons ramassés, le moins possible est le mieux."],
    { low: true, target: 21, quick: [["421 : 10", 10], ["111 : 7", 7], ["666 : 6", 6], ["Suite : 2", 2], ["Nénette : 1", 1]] });
  A("bunco", "Bunco", "🎲", "Dés", 4, 12, 4,
    ["But du jeu : marquer le plus de points en 6 manches avec 3 dés. Au tour n, le nombre cible est n (1, 2, … 6).", "On lance les 3 dés : chaque dé qui montre le nombre cible rapporte 1 point et on rejoue. On s'arrête quand un lancer ne rapporte rien."],
    ["Chaque dé du nombre cible : 1 point.", "Trois dés du nombre cible : « Bunco » = 21 points. Trois dés identiques d'un autre nombre : 5 points."],
    ["Après les 6 manches, le plus haut total gagne."],
    { quick: [["Dé +1", 1], ["Brelan +5", 5], ["Bunco +21", 21]] });
  A("shut-the-box", "Shut the box", "📦", "Dés", 1, 6, 3,
    ["But du jeu : fermer toutes les tuiles numérotées de 1 à 9. On lance les 2 dés et on rabat les tuiles dont la somme égale le résultat (par exemple 8 : tuile 8, ou 5 + 3, ou 6 + 2…).", "Quand les tuiles 7, 8 et 9 sont fermées, on peut lancer un seul dé. Le tour s'arrête quand on ne peut plus rabattre de tuiles."],
    ["Le total de son tour est la somme des tuiles encore ouvertes. Fermer toutes les tuiles vaut 0 (« shut the box »)."],
    ["Après un nombre de tours décidé (ou un score limite), le plus petit total gagne."],
    { low: true, quick: [["Boîte fermée 0", 0]] });
  A("chiffres-lettres", "Des chiffres et des lettres", "🔠", "Mots", 2, 6, 2,
    ["But du jeu : trouver le plus long mot avec 9 lettres tirées au sort, ou le « compte est bon » avec 6 nombres.", "Manche des lettres : on tire 9 lettres et chacun cherche le plus long mot possible. Manche des chiffres : on tire 6 nombres et un total à atteindre avec les 4 opérations."],
    ["Lettres : 1 point par lettre du mot (un mot de 9 lettres vaut 18 points).", "Chiffres : total exact = 10 points, à 5 près = 7 points, à 10 près = 5 points."],
    ["Après le nombre de manches choisi, le plus haut total gagne."],
    { quick: [["Compte exact 10", 10], ["À 5 près 7", 7], ["À 10 près 5", 5], ["Mot de 9 lettres 18", 18]] });
  A("pierre-feuille-ciseaux", "Pierre-feuille-ciseaux", "✌️", "Duel", 2, 8, 2,
    ["But du jeu : battre l'adversaire. À trois, on montre en même temps pierre, feuille ou ciseaux.", "La pierre bat les ciseaux, les ciseaux battent la feuille et la feuille bat la pierre. Si les deux montrent la même chose, on recommence."],
    ["Chaque manche gagnée vaut 1 point."], ["Le premier à 3 manches (ou à l'objectif choisi) gagne."],
    { target: 3, targets: [2, 5], quick: [["Manche +1", 1]] });
  A("karaoke", "Karaoké / SingStar", "🎤", "Ambiance", 2, 8, 4,
    ["But du jeu : chanter le plus juste possible. Chacun chante à tour de rôle (ou en duel) une chanson de son choix.", "Le score est donné par le jeu (SingStar, Just Sing, karaoké sur console), ou par un vote du groupe."],
    ["On note le score de chaque chanson (souvent sur 10 000, ou sur 10 avec un vote)."], ["Le plus haut total sur toutes les chansons gagne."],
    { quick: [["+1000", 1000], ["+5000", 5000], ["+9000", 9000]] });
  A("jackbox", "Jackbox Party Pack", "📱", "Jeux vidéo", 3, 8, 5,
    ["But du jeu : gagner le plus de points sur une série de mini-jeux (Quiplash, Fibbage, Drawful…). Un seul écran est affiché et chacun joue avec son téléphone comme manette.", "Chaque mini-jeu donne des points selon les votes ou les bonnes réponses."],
    ["On additionne les points affichés par le jeu à la fin de chaque partie."], ["Le plus de points cumulés à la fin de la soirée gagne."],
    { quick: [["+500", 500], ["+1000", 1000]] });
  A("among-us", "Among Us", "🚀", "Jeux vidéo", 4, 15, 6,
    ["But du jeu : les équipiers terminent leurs tâches ou démasquent les imposteurs ; les imposteurs éliminent les équipiers sans se faire repérer.", "Après chaque découverte d'un corps ou alerte, on se réunit pour discuter et voter."],
    ["On compte 1 point par partie gagnée par ton camp (équipiers ou imposteurs)."], ["Le joueur qui a gagné le plus de parties gagne."],
    { quick: [["Victoire +1", 1]] });
  A("fall-guys", "Fall Guys", "👑", "Jeux vidéo", 2, 8, 4,
    ["But du jeu : franchir des parcours déjantés et survivre aux manches jusqu'à la finale pour gagner la couronne.", "En partie entre amis, chaque manche gagnée ou chaque couronne gagnée donne des points."],
    ["Couronne = 3 points, finale atteinte = 1 point, manche gagnée = 1 point (barème maison, à adapter)."], ["Le plus de points après la soirée gagne."],
    { quick: [["Couronne +3", 3], ["Finale +1", 1], ["Manche +1", 1]] });
  A("jeux-combat", "Jeux de combat (Street Fighter, Tekken…)", "🥊", "Jeux vidéo", 2, 8, 2,
    ["But du jeu : vaincre l'adversaire en vidant sa barre de vie. Un match se joue au meilleur des 3 manches (rounds).", "Entre plusieurs amis, on joue en tournoi ou en « roi de la colline » : le gagnant reste, le perdant passe la manette."],
    ["Match gagné : 1 point. Option : 3 points pour un match gagné sans perdre de round."], ["Le plus de points à la fin de la soirée gagne."],
    { quick: [["Match +1", 1], ["Parfait +3", 3]] });
  A("karting", "Karting (grand prix)", "🏁", "Sport", 2, 10, 4,
    ["But du jeu : finir chaque course le mieux placé possible. Entre amis on organise un grand prix de plusieurs courses.", "Chaque course donne des points selon la place d'arrivée."],
    ["Barème Formule 1 : 1er 25, 2e 18, 3e 15, 4e 12, 5e 10, 6e 8, 7e 6, 8e 4, 9e 2, 10e 1.", "Option : 1 point pour le meilleur tour en course."],
    ["Après toutes les courses, le plus de points gagne."],
    { quick: [["1er 25", 25], ["2e 18", 18], ["3e 15", 15], ["4e 12", 12], ["5e 10", 10], ["Meilleur tour +1", 1]] });
  A("spikeball", "Spikeball", "🟡", "Sport", 2, 4, 4,
    ["But du jeu : en équipes de 2 autour d'un petit trampoline posé au sol, faire rebondir la balle de façon que l'adversaire ne puisse pas la reprendre.", "Chaque équipe a 3 touches maximum, la balle doit toucher le filet avant d'être renvoyée. On joue sans limites, sur tout le terrain."],
    ["Chaque échange gagné rapporte 1 point (que l'on ait servi ou non)."], ["Le premier à 21 points avec 2 points d'écart gagne."],
    { teams: true, target: 21, targets: [11, 15], quick: [["+1", 1]] });
  A("pickleball", "Pickleball", "🥒", "Sport", 2, 4, 4,
    ["But du jeu : jouer une balle perforée avec une raquette en bois ou composite, sur un terrain plus petit qu'au tennis. Au service, la balle doit rebondir une fois de chaque côté avant de pouvoir être jouée en volée.", "On joue en simple ou en double. Il y a une « zone de non-volée » devant le filet."],
    ["Seule l'équipe qui sert peut marquer un point."], ["Le premier à 11 points avec 2 points d'écart gagne (15 ou 21 en variante)."],
    { teams: true, target: 11, targets: [15, 21], quick: [["+1", 1]] });
  A("ultimate", "Ultimate frisbee", "🥏", "Sport", 2, 2, 2,
    ["But du jeu : attraper le disque dans la zone d'en-but adverse. On ne court pas avec le disque : on le passe à un partenaire.", "Quand le disque tombe ou est intercepté, l'autre équipe prend l'attaque."],
    ["Chaque point (disque attrapé dans la zone d'en-but) vaut 1 point."], ["La première équipe à 15 points gagne (ou le plus de points au bout du temps décidé)."],
    { teams: true, target: 15, targets: [7, 11], quick: [["Point +1", 1]] });
  A("fer-a-cheval", "Fer à cheval (Horseshoes)", "🐴", "Plein air", 2, 4, 2,
    ["But du jeu : lancer des fers à cheval pour les poser autour d'un piquet planté dans le sol, à environ 10 m.", "Chaque joueur lance ses 2 fers, puis l'autre. On compte les points à la fin de chaque manche."],
    ["Fer qui entoure le piquet (« ringer ») : 3 points. Fer le plus proche du piquet (à une longueur de fer) : 1 point.", "Les points s'annulent entre joueurs si leurs fers sont aussi bien placés."],
    ["Le premier à 21 points gagne."],
    { target: 21, quick: [["Ringer +3", 3], ["Plus proche +1", 1]] });
  A("tirs-au-but", "Tirs au but", "🥅", "Sport", 2, 6, 2,
    ["But du jeu : marquer plus de buts que l'adversaire en une série de tirs au but. Chacun tire à tour de rôle, face à un gardien.", "On joue en général 5 tirs chacun. En cas d'égalité, on continue tir par tir jusqu'à la différence."],
    ["Chaque but marqué vaut 1 point."], ["Celui qui a marqué le plus de buts gagne."],
    { quick: [["But +1", 1]] });
  A("tir-arc", "Tir à l'arc / carabine", "🏹", "Sport", 2, 8, 3,
    ["But du jeu : placer ses flèches (ou ses plombs) le plus près possible du centre de la cible.", "Chaque joueur tire une volée de 3 flèches à chaque tour, pour un nombre de volées décidé à l'avance."],
    ["La cible a des cercles de 1 (extérieur) à 10 points (centre). Une flèche hors cible vaut 0."], ["Après toutes les volées, le plus haut total gagne."],
    { quick: [["10", 10], ["9", 9], ["8", 8], ["7", 7], ["Raté 0", 0]] });
  A("snooker", "Snooker", "🎱", "Sport", 2, 2, 2,
    ["But du jeu : marquer plus de points que l'adversaire en empochant des billes sur une grande table, avec 15 billes rouges et 6 billes de couleur.", "On empoche d'abord une rouge, puis une couleur (qui est remise), et ainsi de suite. Quand il n'y a plus de rouges, on empoche les couleurs dans l'ordre."],
    ["Valeurs : rouge 1, jaune 2, verte 3, marron 4, bleue 5, rose 6, noire 7.", "Une faute donne au moins 4 points à l'adversaire."],
    ["Le plus de points à la fin de la manche (« frame ») la gagne. Un match se joue en plusieurs frames."],
    { quick: [["Rouge +1", 1], ["Jaune +2", 2], ["Verte +3", 3], ["Marron +4", 4], ["Bleue +5", 5], ["Rose +6", 6], ["Noire +7", 7], ["Faute +4", 4]] });
  A("machi-koro", "Machi Koro", "🏙️", "Plateau", 2, 4, 4,
    ["But du jeu : être le premier à construire ses 4 monuments (Gare, Centre commercial, Parc d'attractions, Tour radio).", "À son tour on lance 1 ou 2 dés : les bâtiments dont le numéro est tiré rapportent des pièces. Puis on peut acheter un bâtiment ou un monument."],
    ["On compte les monuments construits (1 point chacun)."], ["Le premier qui a construit ses 4 monuments gagne."],
    { target: 4, quick: [["Monument +1", 1]] });
  A("citadelles", "Citadelles", "🏰", "Plateau", 2, 7, 4,
    ["But du jeu : construire la plus belle cité. Chaque tour, on choisit un personnage secret (assassin, voleur, roi, marchand, architecte…) avec un pouvoir spécial.", "On gagne de l'or ou on pioche, puis on construit des quartiers. La partie finit quand un joueur a posé 8 quartiers (7 dans l'édition 2016, vérifie ta boîte)."],
    ["Chaque quartier vaut son coût en pièces d'or.", "Bonus : +3 si ta cité a les 5 couleurs de quartier, +4 pour le premier qui termine sa cité, +2 pour les autres qui l'ont aussi terminée."],
    ["Le plus de points gagne."],
    { quick: [["Cité complète +4", 4], ["5 couleurs +3", 3], ["Autre cité +2", 2]] });
  A("wavelength", "Wavelength", "📡", "Ambiance", 2, 12, 6,
    ["But du jeu : deviner où se situe une cible cachée entre deux extrêmes (ex. « chaud » et « froid »).", "Un joueur voit la cible secrète et donne un indice. Son équipe place alors le curseur à l'endroit qui lui semble correspondre."],
    ["Dans la zone centrale : 4 points. Dans la zone juste à côté : 3 points. Dans la zone de l'extérieur : 2 points. Sinon : 0."],
    ["La première équipe à atteindre 10 points gagne."],
    { teams: true, target: 10, quick: [["Centre +4", 4], ["+3", 3], ["+2", 2], ["Raté 0", 0]] });
  A("charades", "Charades (mime)", "🎭", "Ambiance", 4, 12, 6,
    ["But du jeu : faire deviner un mot ou un titre à son équipe uniquement avec des gestes, sans parler. Le temps est limité (1 minute en général).", "Les équipes jouent à tour de rôle."],
    ["Chaque mot trouvé dans le temps rapporte 1 point à l'équipe."], ["Après le nombre de tours décidé, l'équipe qui a le plus de points gagne."],
    { teams: true, quick: [["Trouvé +1", 1]] });
  A("pronostics", "Pronostics entre potes", "📊", "Ambiance", 2, 20, 6,
    ["But du jeu : prévoir les résultats des matchs (foot, rugby, Coupe du monde…) mieux que ses amis.", "Avant chaque match, chacun note son pronostic de score. On compare ensuite avec le résultat réel."],
    ["Score exact : 3 points. Bon résultat (victoire, nul ou défaite) sans le bon score : 1 point. Sinon : 0.", "Option : +1 pour le bon vainqueur d'un tournoi final."],
    ["Le plus haut total à la fin de la compétition gagne."],
    { quick: [["Score exact +3", 3], ["Bon résultat +1", 1], ["Raté 0", 0]] });
})();
