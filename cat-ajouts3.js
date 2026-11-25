// Lot 7 : encore plus de jeux (cartes, plateau, dés, mots, abstrait, duel, adresse, enfants, quiz, potes, jeux vidéo, plein air, sport…).
// Même format que cat-ajouts2.js (champs facultatifs amb / dur). Règles de base, à vérifier avec la boîte.
(function () {
  const mk = (list) => (id, name, emoji, cat, min, max, dp, rules, scoring, winner, o = {}) =>
    list.push({ id, name, emoji, cat, min, max, dp, low: false, teams: false, quick: [], targets: [], rules, scoring, winner, ...o });
  const C = mk(window.CAT_CARTES), A = mk(window.CAT_AUTRES);
  const P1 = [["Manche +1", 1]], V1 = [["Victoire +1", 1]], B1 = [["Bonne +1", 1]];

  // =================== CARTES ===================
  C("pinochle", "Pinochle", "🂫", "Combinaisons", 2, 4, 4,
    ["But du jeu : marquer des points avec des combinaisons (« melds ») et des plis. Jeu de 48 cartes (9 à As, deux fois chacune). On annonce ses combinaisons après avoir gagné un pli.", "On joue d'abord à des enchères pour choisir l'atout, puis les plis se jouent avec obligation de fournir et de monter."],
    ["Mariage (Roi + Dame) : 20, à l'atout : 40. Pinochle (Dame de pique + Valet de carreau) : 40, double : 300. Suite d'atout : 150. Quatre As : 100, Rois : 80, Dames : 60, Valets : 40. Neuf d'atout : 10.", "Plis : chaque As, 10 et Roi gagnés vaut 1 point, et le dernier pli 1 point."],
    ["Le premier à atteindre l'objectif choisi (150, 500 ou 1000 points selon les tables) gagne."], { target: 150, targets: [500, 1000], dur: 3, amb: "tete", quick: [["Mariage +20", 20], ["Atout +40", 40], ["Pinochle +40", 40], ["Suite +150", 150], ["Quatre As +100", 100]] });
  C("point-salad", "Point Salad", "🥗", "Draft", 2, 6, 4,
    ["But du jeu : réunir des légumes pour remplir ses cartes de points. Chaque carte a un côté légume et un côté points (à scorer).", "À son tour on prend soit 2 légumes du marché, soit 1 carte de points. On peut retourner une carte de points pour la transformer en légume."],
    ["Chaque carte de points se compte selon son critère (ex. « 5 points par paire de carottes », « −2 par poivron »)."], ["La partie s'arrête quand le marché de légumes ne peut plus se remplir. Le plus de points gagne."], { dur: 1, amb: "fam", quick: [["+5", 5], ["+10", 10], ["−2", -2]] });
  C("fantasy-realms", "Fantasy Realms", "🧝", "Draft", 2, 6, 4,
    ["But du jeu : construire la meilleure main de 7 cartes. À son tour on pioche une carte (talon ou défausse) puis on en défausse une.", "Chaque carte a une force de base, et des bonus ou des malus qui dépendent des autres cartes de la main."],
    ["On additionne la force de ses 7 cartes plus les bonus, moins les malus."], ["La partie s'arrête quand il y a 10 cartes en défausse. Le plus haut total gagne."], { dur: 1, amb: "tete", quick: [["+10", 10], ["+25", 25], ["−10", -10]] });
  C("skull-king", "Skull King", "🏴☠", "Plis", 2, 8, 5,
    ["But du jeu : annoncer exactement le nombre de plis qu'on va gagner. 10 manches : à la manche n, chacun reçoit n cartes.", "Les Pirates battent les couleurs, les Sirènes battent les Pirates, le Skull King bat les Pirates mais perd contre les Sirènes. Le Fuyard (flag) perd toujours."],
    ["Annonce réussie : 20 points par pli annoncé. Annonce de 0 réussie : 10 × le numéro de la manche. Annonce ratée : −10 par pli d'écart (annonce de 0 ratée : −10 × le numéro de la manche).", "Bonus si l'annonce est réussie : 10 par 14 gagné (20 pour le 14 noir), 20 par Sirène prise par un Pirate, 30 par Pirate pris par le Skull King, 40 pour le Skull King pris par une Sirène."],
    ["Après la 10e manche, le plus haut total gagne."], { dur: 2, amb: "fun", quick: [["Pli annoncé +20", 20], ["14 +10", 10], ["14 noir +20", 20], ["Pirate +30", 30]] });
  C("ecarte", "Écarté", "🎴", "Plis", 2, 2, 2,
    ["But du jeu : à deux, faire plus de plis que l'adversaire. 32 cartes, 5 cartes chacun, la carte retournée donne l'atout.", "On peut proposer d'écarter des cartes pour en piocher d'autres. Il faut fournir la couleur, et monter si possible."],
    ["Roi d'atout annoncé : 1 point. Majorité des plis (3 sur 5) : 1 point. Les 5 plis (« vole ») : 2 points."], ["Le premier à 5 points gagne la partie."], { target: 5, dur: 1, amb: "tete", quick: [["Roi +1", 1], ["Plis +1", 1], ["Vole +2", 2]] });
  C("dutch-blitz", "Dutch Blitz (Nertz)", "🟥", "Rapidité", 2, 4, 3,
    ["But du jeu : se débarrasser le plus vite possible de son tas « Blitz » en posant ses cartes en suites croissantes au centre, tous en même temps. Chacun a ses piles de bois.", "Dès qu'un joueur a vidé son Blitz, il crie « Blitz ! » et la manche s'arrête."],
    ["Chaque carte posée au centre vaut 1 point. Chaque carte restant dans sa pile Blitz coûte 2 points."], ["Le premier à 75 points gagne la partie."], { target: 75, dur: 1, amb: "fun", quick: [["Carte +1", 1], ["Blitz restante −2", -2]] });
  C("cuilleres", "Cuillères (Spoons)", "🥄", "Rapidité", 3, 12, 6,
    ["But du jeu : réunir 4 cartes identiques avant les autres et saisir une cuillère. Il y a une cuillère de moins que de joueurs au centre.", "Chacun passe une carte à son voisin en même temps. Dès qu'un joueur a 4 cartes pareilles, il prend une cuillère, et tout le monde se précipite pour en prendre une."],
    ["Celui qui n'a pas de cuillère reçoit une lettre du mot S-P-O-O-N (1 point de pénalité)."], ["Un joueur qui a les 5 lettres est éliminé. Le dernier joueur gagne."], { low: true, target: 5, dur: 1, amb: "fun", quick: [["Lettre +1", 1]] });
  C("tape-main", "Tape-main (Slapjack)", "✋", "Rapidité", 2, 6, 3,
    ["But du jeu : ramasser toutes les cartes. À tour de rôle, on pose une carte au centre. Quand un Valet apparaît, le premier à taper dessus ramasse le tas."],
    ["Taper sur autre chose qu'un Valet : on donne une carte au tas. On marque 1 point par partie gagnée."], ["Le premier à 3 parties gagne."], { target: 3, dur: 1, amb: "fam", quick: V1 });
  C("bazar-bizarre", "Bazar Bizarre", "👻", "Rapidité", 2, 8, 4,
    ["But du jeu : attraper le bon objet le plus vite possible. 5 figurines de couleurs (livre, souris, chaise, bouteille, fantôme) sont posées au centre.", "On retourne une carte. Si elle montre un objet avec sa vraie couleur, on le saisit. Sinon, on saisit l'objet dont ni la forme ni la couleur n'apparaissent sur la carte."],
    ["Celui qui attrape la bonne figurine gagne la carte (1 point)."], ["Le plus de cartes gagnées gagne."], { dur: 1, amb: "fun", quick: [["Carte +1", 1]] });
  C("sept-et-demi", "Sept et demi", "🔟", "Mises", 2, 8, 4,
    ["But du jeu : s'approcher de 7,5 sans dépasser. Jeu de 40 cartes (sans 8, 9 et 10). Les cartes de 1 à 7 valent leur valeur, les figures valent 0,5.", "Un joueur est banquier. Chacun mise, puis demande des cartes ou reste. Si on dépasse 7,5, on perd sa mise."],
    ["Main gagnante : on gagne sa mise. Un 7,5 avec seulement 2 cartes (figure + 7) fait gagner double."], ["Le joueur qui a gagné le plus de jetons gagne."], { dur: 1, amb: "tete" });
  C("poker-draw", "Poker fermé (5 cartes)", "🂡", "Mises", 2, 6, 4,
    ["But du jeu : faire la meilleure main de 5 cartes. Chacun reçoit 5 cartes cachées, un tour de mise, puis on peut changer jusqu'à 3 cartes (parfois 4) et on remise avant l'abattage."],
    ["On suit les jetons gagnés ou perdus."], ["Le plus de jetons gagnés à la fin de la session gagne."], { dur: 2, amb: "tete" });
  C("scopone", "Scopone scientifico", "🇮🇹", "Capture", 4, 4, 4,
    ["But du jeu : en 2 équipes de 2, capturer des cartes comme à la scopa. Jeu italien de 40 cartes, 10 cartes chacun, la table est vide au départ."],
    ["Comme à la scopa : plus de cartes, plus de carreaux, 7 de carreau (settebello), meilleure primiera : 1 point chacun. Plus 1 point par scopa."], ["Le premier à 11 points gagne (21 en version longue)."], { teams: true, target: 11, targets: [21], dur: 2, amb: "tete", quick: [["Scopa +1", 1]] });
  C("pisti", "Pişti", "🇹🇷", "Capture", 2, 4, 2,
    ["But du jeu : capturer des cartes de la table. 52 cartes, 4 cartes chacun et 4 cartes au centre. On pose une carte de même valeur que celle du dessus pour ramasser le tas ; le Valet ramasse tout."],
    ["Pişti (capturer une seule carte avec la même valeur) : 10 points. Pişti avec un Valet : 20. 2 de trèfle : 2. 10 de carreau : 3. Chaque As et Valet : 1. Plus de cartes : 3."], ["Le plus haut total gagne (règles courantes, à adapter)."], { dur: 2, amb: "fam", quick: [["Pişti +10", 10], ["Pişti Valet +20", 20], ["10♦ +3", 3], ["2♣ +2", 2]] });
  C("joking-hazard", "Joking Hazard", "🤣", "Chaos", 3, 10, 5,
    ["But du jeu : faire le strip de BD le plus drôle. Un joueur « juge » pose la première case, les autres complètent avec les cartes de leur main pour une fin déjantée.", "Le juge choisit le strip qui le fait le plus rire (le plus drôle, pas le plus propre)."],
    ["Chaque strip gagné vaut 1 point."], ["Le premier à 5 points gagne."], { target: 5, dur: 2, amb: "apero", quick: [["Strip +1", 1]] });
  C("time-bomb", "Time Bomb", "💣", "Bluff", 4, 8, 6,
    ["But du jeu : deux camps secrets, les Sherlock (qui veulent désamorcer) et les Moriarty (qui veulent faire exploser). Chacun a des fils cachés : neutres, désamorçage ou bombe.", "À tour de rôle on coupe un fil chez un autre joueur. Les Sherlock gagnent s'ils coupent tous les fils de désamorçage, les Moriarty si la bombe est coupée ou si le temps passe."],
    ["On compte 1 point par manche gagnée par son camp. Il y a 4 manches."], ["Le camp qui gagne le plus de manches gagne."], { teams: true, target: 3, dur: 2, amb: "fun", quick: P1 });
  C("rami-51", "Rami 51", "🂱", "Rami", 2, 6, 4,
    ["But du jeu : se débarrasser de toutes ses cartes. Pour ouvrir, il faut poser des combinaisons qui totalisent au moins 51 points. On pioche une carte, on pose, puis on défausse.", "On peut ensuite compléter les combinaisons de tout le monde."],
    ["Celui qui ferme marque 0. Les autres comptent les cartes qui leur restent (figures 10, As 11, autres = valeur, joker souvent 25)."], ["On joue jusqu'à une limite (100 ou 200 points). Le plus petit total gagne."], { low: true, target: 100, targets: [200], dur: 2, amb: "tete", quick: [["Joker +25", 25], ["Fermé 0", 0]] });

  // =================== AUTRES JEUX ===================
  // Dés
  A("poker-dice", "Poker dice", "🎲", "Combinaisons", 2, 8, 4,
    ["But du jeu : faire la meilleure combinaison de poker avec 5 dés. On lance jusqu'à 3 fois, en gardant les dés de son choix. Du plus fort au plus faible : cinq identiques, carré, full, grande suite, brelan, double paire, paire."],
    ["Le meilleur tour de chaque manche marque 1 point."], ["Le premier à 5 manches gagne."], { target: 5, dur: 1, amb: "fun", quick: P1 });
  A("deep-sea", "Plongée sous-marine (Deep Sea Adventure)", "🤿", "Pioche et prise de risque", 2, 6, 4,
    ["But du jeu : ramasser des trésors au fond de la mer, puis remonter au sous-marin avant d'être à court d'oxygène. Tout le monde partage la même réserve d'air (25).", "À son tour on lance 2 dés (moins 1 par trésor porté), on avance, puis on peut prendre un trésor ou en reposer un. Chaque trésor porté consomme de l'air."],
    ["Les trésors remontés valent leur valeur (1 à 3 selon l'ancienneté de la tuile). Un joueur qui n'est pas remonté perd ses trésors."], ["Après 3 manches, le plus de points gagne."], { dur: 2, amb: "fun", quick: [["+1", 1], ["+3", 3], ["+6", 6]] });
  A("cash-n-guns", "Cash'n Guns", "💰", "Chaos", 4, 8, 6,
    ["But du jeu : finir la partie avec le plus d'argent. Chacun a des pistolets en mousse et des cartes Bang ou Clic. À « 3, 2, 1 », tout le monde pointe son pistolet sur quelqu'un.", "Chacun choisit en secret entre Bang (chargé) ou Clic (vide). Celui qui se couche garde sa mise, les autres se tirent dessus et se partagent le butin."],
    ["On additionne les billets gagnés pendant les 8 manches. Trois blessures = éliminé."], ["Le plus riche à la fin gagne."], { dur: 2, amb: "apero", quick: [["+10 000", 10000], ["+20 000", 20000], ["+30 000", 30000]] });
  A("pickomino", "Pickomino (Heckmeck)", "🐛", "Dés", 2, 7, 4,
    ["But du jeu : ramasser des briquettes numérotées de 21 à 36 qui portent des vers de terre (de 1 à 4). On lance 8 dés, on met de côté tous les dés d'une même valeur, on relance le reste.", "On prend la briquette égale à sa somme (les vers valent 5) si on a au moins un ver."],
    ["Chaque ver visible sur le dessus de sa pile vaut 1 point."], ["Le plus de vers gagne."], { dur: 1, amb: "fun", quick: [["Ver +1", 1], ["Briquette +2", 2]] });
  A("roll-for-it", "Roll for It!", "🎯", "Dés", 2, 4, 4,
    ["But du jeu : réussir des cartes en obtenant leurs combinaisons de dés. 3 cartes sont posées au centre, chacune demande une combinaison (par ex. 2 dés de 1)."],
    ["Chaque carte réussie vaut le nombre de points indiqué dessus."], ["Le premier à 40 points gagne."], { target: 40, dur: 1, amb: "fam", quick: [["+10", 10], ["+15", 15], ["+20", 20]] });
  // Mots
  A("dictionnaire", "Dictionnaire (Balderdash)", "📖", "Mots", 3, 8, 5,
    ["But du jeu : deviner la vraie définition d'un mot rare. Un joueur lit le mot, les autres inventent une fausse définition, on les lit toutes avec la vraie (écrite par le lecteur) et chacun vote."],
    ["Trouver la vraie définition : 1 point. Faire voter les autres pour sa fausse définition : 1 point par vote."], ["Le plus de points après le tour de table gagne."], { dur: 2, amb: "fun", quick: [["Vraie +1", 1], ["Vote +1", 1]] });
  A("motus", "Motus", "🟥", "Mots", 2, 6, 2,
    ["But du jeu : trouver un mot de 5 à 8 lettres, dont la première est donnée. On propose des mots en 5 essais, et on voit quelles lettres sont bien ou mal placées."],
    ["Chaque mot trouvé vaut 1 point (2 s'il est trouvé en 3 essais ou moins)."], ["Le plus de points gagne."], { dur: 1, amb: "tete", quick: [["Trouvé +1", 1], ["En 3 essais +2", 2]] });
  // Abstrait / Duel
  A("gomoku", "Gomoku (5 en ligne)", "⚫", "Abstrait", 2, 2, 2,
    ["But du jeu : aligner 5 pions (horizontalement, verticalement ou en diagonale) sur un plateau de 15 × 15. Noir commence, on pose un pion à tour de rôle."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 parties gagne."], { target: 3, dur: 1, amb: "tete", quick: V1 });
  A("pentago", "Pentago", "🔄", "Abstrait", 2, 2, 2,
    ["But du jeu : aligner 5 billes sur un plateau de 6 × 6 divisé en 4 quadrants. À chaque tour : on pose une bille, puis on fait pivoter un quadrant d'un quart de tour."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 parties gagne."], { target: 3, dur: 1, amb: "tete", quick: V1 });
  A("sudoku-course", "Sudoku (course)", "🔢", "Abstrait", 2, 8, 2,
    ["But du jeu : remplir le sudoku le plus vite possible. Tout le monde a la même grille, sur papier ou sur téléphone."],
    ["On note le temps en minutes."], ["Le plus petit temps gagne."], { low: true, dur: 1, amb: "tete", quick: [["5 min", 5], ["10 min", 10], ["15 min", 15]] });
  A("stratego", "Stratego", "🚩", "Duel", 2, 2, 2,
    ["But du jeu : capturer le drapeau de l'adversaire. Chacun place ses 40 pièces face cachée sur un plateau de 10 × 10 (Maréchal, Général… jusqu'aux bombes).", "À son tour on déplace une pièce. En cas de contact, la plus forte gagne. Les Éclaireurs courent loin, les Démineurs désamorcent les bombes."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 parties gagne."], { target: 3, dur: 3, amb: "tete", quick: V1 });
  A("quoridor", "Quoridor", "🧱", "Duel", 2, 4, 2,
    ["But du jeu : être le premier à atteindre le côté opposé du plateau avec son pion. À son tour on avance d'une case, ou on pose une barrière pour gêner l'adversaire (sans jamais bloquer complètement le chemin)."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 parties gagne."], { target: 3, dur: 1, amb: "tete", quick: V1 });
  A("nim", "Jeu de Nim (allumettes)", "🔥", "Duel", 2, 2, 2,
    ["But du jeu : ne pas prendre la dernière allumette (ou la prendre, selon la version choisie). On aligne 16 allumettes en rangées, et à tour de rôle on en retire autant qu'on veut dans une seule rangée."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier à 3 parties gagne."], { target: 3, dur: 1, amb: "fun", quick: V1 });
  A("dames-chinoises", "Dames chinoises", "⭐", "Plateau", 2, 6, 2,
    ["But du jeu : amener ses 10 billes d'une pointe de l'étoile à la pointe opposée. À son tour on avance d'une case ou on saute par-dessus une bille (plusieurs sauts possibles)."],
    ["Chaque partie gagnée vaut 1 point."], ["Le premier qui a rempli la pointe opposée gagne."], { dur: 2, amb: "fam", quick: V1 });
  A("jeu-de-la-vie", "Le Jeu de la vie", "🏠", "Plateau", 2, 6, 4,
    ["But du jeu : finir la partie avec le plus de fortune. On avance sur la route de la vie (études, travail, mariage, enfants, maison…) en tournant la roue."],
    ["À la fin, on additionne son argent, ses maisons et ses actions, moins ses dettes."], ["Le plus riche gagne."], { dur: 3, amb: "fam", quick: [["+10 000", 10000], ["+50 000", 50000], ["Dette −10 000", -10000]] });
  // Adresse
  A("air-hockey", "Air hockey", "🏒", "Adresse", 2, 2, 2,
    ["But du jeu : envoyer le palet dans le but adverse. Le palet glisse sur un coussin d'air et on le frappe avec un maillet."],
    ["Chaque but vaut 1 point."], ["Le premier à 7 buts gagne."], { target: 7, dur: 1, amb: "fun", quick: [["But +1", 1]] });
  A("bilboquet", "Bilboquet", "🪀", "Adresse", 2, 8, 4,
    ["But du jeu : faire entrer la boule dans le cône ou sur la pique, sans toucher la boule avec la main. Chacun a 10 essais."],
    ["Chaque réussite vaut 1 point."], ["Le plus de réussites sur 10 essais gagne."], { dur: 1, amb: "enfants", quick: [["Réussi +1", 1]] });
  A("cartes-chapeau", "Cartes dans un chapeau", "🎩", "Adresse", 2, 10, 4,
    ["But du jeu : lancer le plus de cartes à jouer dans un chapeau posé à 2 mètres. Chacun lance une dizaine de cartes."],
    ["Chaque carte dans le chapeau vaut 1 point."], ["Le plus de cartes dans le chapeau gagne."], { dur: 1, amb: "fun", quick: [["Dans le chapeau +1", 1]] });
  // Coopératif
  A("desert-interdit", "Le Désert interdit", "🏜", "Coopératif", 2, 5, 4,
    ["But du jeu : retrouver les 4 pièces d'une machine volante enfouie dans le sable, avant que la tempête ou la soif n'ait raison de l'équipe.", "À son tour on a 4 actions (se déplacer, déblayer, creuser, ramasser), puis on subit la tempête."],
    ["On compte les pièces de machine retrouvées (0 à 4)."], ["L'équipe gagne si tout le monde décolle ensemble."], { coop: true, dur: 3, amb: "coop", quick: [["Pièce +1", 1]] });
  // Ambiance
  A("twister", "Twister", "🌀", "Ambiance", 2, 6, 4,
    ["But du jeu : rester debout sur le tapis le plus longtemps. À chaque tour on tourne la roue : « main gauche sur le rouge ! », et chacun place la bonne partie du corps sur la bonne couleur."],
    ["Celui qui tombe (genou ou coude au sol) est éliminé. Le dernier debout marque 1 point."], ["Le plus de manches gagnées gagne."], { dur: 1, amb: "fun", quick: P1 });
  A("bingo-musical", "Bingo musical", "🎶", "Ambiance", 3, 20, 6,
    ["But du jeu : cocher les chansons sur sa grille au fur et à mesure qu'elles passent. Chacun a une grille de 9 ou 16 titres, et le DJ lance des extraits."],
    ["Ligne : 1 point. Carton plein : 3 points."], ["Le plus de points gagne."], { dur: 2, amb: "fun", quick: [["Ligne +1", 1], ["Carton +3", 3]] });
  A("concours-cuisine", "Concours de cuisine", "👩🍳", "Ambiance", 2, 10, 4,
    ["But du jeu : cuisiner le meilleur plat (ou gâteau) avec les mêmes ingrédients ou un thème imposé. Un jury noté (ou tout le monde) goûte à l'aveugle."],
    ["Chaque juge note sur 10 : goût, présentation, originalité. On additionne."], ["Le plus haut total gagne."], { dur: 3, amb: "fam", quick: [["+5", 5], ["+8", 8], ["+10", 10]] });
  A("photos-enfance", "Photos d'enfance (qui est-ce ?)", "👶", "Ambiance", 3, 15, 6,
    ["But du jeu : retrouver qui est sur chaque photo d'enfance. Chacun apporte une photo de lui petit, on les mélange, puis on les montre une par une."],
    ["Chaque bonne réponse vaut 1 point."], ["Le plus de bonnes réponses gagne."], { dur: 2, amb: "fam", quick: B1 });
  // Enfants
  A("colin-maillard", "Colin-maillard", "🙈", "Enfants", 4, 12, 6,
    ["But du jeu : attraper un joueur les yeux bandés, et deviner qui c'est en le touchant. Les autres bougent en silence autour."],
    ["Chaque joueur bien deviné devient le prochain colin-maillard et fait gagner 1 point à celui qui l'a attrapé."], ["Le plus de joueurs devinés gagne."], { dur: 1, amb: "enfants", quick: [["Deviné +1", 1]] });
  A("chat-perche", "Chat perché", "🐱", "Enfants", 4, 15, 8,
    ["But du jeu : échapper au chat. Un joueur est le chat et court après les autres : s'il touche quelqu'un, celui-ci devient le chat. On est protégé quand on est « perché » (au-dessus du sol, sur un banc, par exemple)."],
    ["Chaque joueur qui n'a jamais été chat à la fin de la manche marque 1 point."], ["Le plus de points gagne."], { dur: 1, amb: "enfants", quick: P1 });
  A("marelle", "Marelle", "🔢", "Enfants", 2, 8, 4,
    ["But du jeu : lancer son palet sur une case numérotée tracée à la craie, puis sauter à cloche-pied de case en case et le ramasser au retour, sans marcher sur les lignes."],
    ["Chaque tour réussi vaut 1 point. Un tour est raté si on pose les deux pieds, ou si on touche une ligne."], ["Le premier qui a terminé les 10 cases gagne."], { target: 10, dur: 1, amb: "enfants", quick: [["Case +1", 1]] });
  A("corde-a-sauter", "Concours de corde à sauter", "🪢", "Enfants", 2, 10, 4,
    ["But du jeu : sauter le plus longtemps à la corde sans rater. Chacun a 3 essais."],
    ["On compte le nombre de sauts de son meilleur essai."], ["Le plus de sauts gagne."], { dur: 1, amb: "enfants", quick: [["+10", 10], ["+25", 25], ["+50", 50]] });
  A("concours-dessin", "Concours de dessin", "🖍", "Enfants", 2, 12, 4,
    ["But du jeu : faire le plus beau dessin sur un thème imposé (un animal, la mer, ma maison…) en 10 minutes."],
    ["Chaque joueur (sauf l'auteur) donne une note de 1 à 5 à chaque dessin."], ["Le plus haut total gagne."], { dur: 1, amb: "enfants", quick: [["+1", 1], ["+3", 3], ["+5", 5]] });
  A("pirate-popup", "Pirate Pop-up (tonneau)", "🏴☠", "Familial", 2, 8, 4,
    ["But du jeu : planter des épées dans un tonneau sans faire sauter le pirate. À tour de rôle, chacun enfonce une épée dans une fente. Celui qui fait sauter le pirate perd la manche."],
    ["Chaque manche où on ne fait pas sauter le pirate : 1 point."], ["Le plus de points gagne."], { dur: 1, amb: "fam", quick: P1 });
  A("gloutons", "Gloutons gloutons (Hungry Hippos)", "🦛", "Familial", 2, 4, 4,
    ["But du jeu : manger le plus de billes avec son hippopotame, en appuyant sur le bouton plus vite que les autres."],
    ["Chaque bille mangée vaut 1 point."], ["Celui qui a mangé le plus de billes gagne."], { dur: 1, amb: "enfants", quick: [["Bille +1", 1]] });
  // Quiz
  A("maillon-faible", "Le Maillon faible (maison)", "🔗", "Quiz", 4, 10, 6,
    ["But du jeu : répondre à des questions en chaîne et mettre l'argent en banque avant qu'une erreur ne casse la chaîne. À la fin de chaque manche, on vote pour éliminer le « maillon faible »."],
    ["Chaque bonne réponse d'affilée augmente la chaîne (par exemple 20, 50, 100, 200…). « Banque ! » sécurise le montant."], ["Le dernier joueur resté, ou celui qui a mis le plus en banque, gagne."], { dur: 2, amb: "tete", quick: [["Banque +20", 20], ["+50", 50], ["+100", 100]] });
  A("juste-prix", "Le Juste Prix (maison)", "🛒", "Quiz", 2, 8, 4,
    ["But du jeu : deviner le prix d'un objet sans le dépasser. Chacun note le prix qu'il pense, puis on dévoile le vrai prix : le plus près sans le dépasser gagne."],
    ["Le plus près du vrai prix sans le dépasser : 1 point."], ["Le plus de points gagne."], { dur: 1, amb: "fun", quick: [["Plus près +1", 1]] });
  A("peril", "Péril (Jeopardy!)", "❓", "Quiz", 2, 6, 3,
    ["But du jeu : choisir une catégorie et une valeur (100 à 500). On lit la réponse, le premier qui trouve la bonne question gagne la valeur. Une mauvaise réponse la fait perdre."],
    ["Bonne réponse : +valeur. Mauvaise réponse : −valeur."], ["Le plus haut total gagne."], { dur: 2, amb: "tete", quick: [["+100", 100], ["+200", 200], ["+300", 300], ["+500", 500], ["−200", -200]] });
  A("drapeaux-capitales", "Drapeaux et capitales", "🏳", "Quiz", 2, 10, 4,
    ["But du jeu : reconnaître le plus de drapeaux ou de capitales. Un animateur montre un drapeau (ou nomme un pays) et on répond le plus vite possible."],
    ["Bonne réponse : 1 point (2 pour un pays difficile)."], ["Le plus de points gagne."], { target: 15, dur: 1, amb: "tete", quick: [["Bonne +1", 1], ["Difficile +2", 2]] });
  A("quiz-cinema", "Quiz cinéma et séries", "🎬", "Quiz", 2, 10, 4,
    ["But du jeu : retrouver des films, des acteurs ou des séries à partir d'une réplique, d'une image floutée ou d'une bande-son."],
    ["Bonne réponse : 1 point. Bonus de 1 point pour une réponse donnée avant l'indice 2."], ["Le plus de points gagne."], { dur: 2, amb: "fun", quick: [["Bonne +1", 1], ["Bonus +1", 1]] });
  // Soirée entre potes
  A("mots-interdits", "Le jeu du mot interdit", "🤐", "Soirée entre potes", 4, 12, 6,
    ["But du jeu : ne pas prononcer son mot interdit pendant toute la soirée. Chacun tire en secret un mot (« donc », « du coup », un prénom…) à ne pas dire."],
    ["Chaque fois qu'on dit son mot, un autre joueur peut le signaler : 1 point de pénalité (ou un gage)."], ["Le moins de pénalités gagne."], { low: true, dur: 3, amb: "apero", quick: [["Pénalité +1", 1]] });
  A("plus-susceptible", "Qui est le plus susceptible de… ?", "☝", "Soirée entre potes", 3, 12, 6,
    ["But du jeu : désigner, tous en même temps (en pointant du doigt), la personne la plus susceptible de faire quelque chose (« oublier son anniversaire », « partir en voyage sur un coup de tête »…)."],
    ["Chaque doigt pointé sur toi : 1 point (c'est toi le plus susceptible)."], ["Le plus de votes à la fin du tour de table gagne (ou perd : à toi de choisir)."], { dur: 2, amb: "apero", quick: [["Vote +1", 1]] });
  A("diner-parfait", "Le Dîner presque parfait (maison)", "🍷", "Soirée entre potes", 4, 8, 4,
    ["But du jeu : recevoir ses amis à tour de rôle. Chacun prépare un repas, avec un thème et une ambiance. Les invités notent l'accueil, le repas et la déco."],
    ["Chaque invité note sur 10 le repas de l'hôte."], ["Le plus haut total de notes gagne le titre du dîner presque parfait."], { dur: 3, amb: "fam", quick: [["+5", 5], ["+7", 7], ["+9", 9], ["+10", 10]] });
  // Jeux vidéo
  A("minecraft", "Minecraft (mini-jeux)", "⛏", "Jeux vidéo", 2, 8, 4,
    ["But du jeu : gagner des mini-jeux entre amis (Bed Wars, Hunger Games, course de bateaux…) sur un serveur ou en réseau local."],
    ["Chaque mini-jeu gagné vaut 1 point."], ["Le plus de victoires gagne."], { dur: 3, amb: "fun", quick: V1 });
  A("nba2k", "Jeu de basket vidéo (NBA 2K)", "🏀", "Jeux vidéo", 2, 4, 2,
    ["But du jeu : gagner le match en marquant plus que l'adversaire. Chaque joueur contrôle une équipe, ou s'allie avec un ami contre la console."],
    ["On note le score final du match, ou 1 point par match gagné."], ["Le plus de victoires gagne."], { dur: 2, amb: "fun", quick: V1 });
  A("call-of-duty", "Call of Duty / jeux de tir", "🎯", "Jeux vidéo", 2, 8, 4,
    ["But du jeu : gagner les parties en équipe ou en solo, en éliminant les adversaires et en remplissant les objectifs."],
    ["Victoire d'équipe : 3 points. Chaque élimination : 1 point (barème maison)."], ["Le plus de points gagne."], { teams: true, dur: 3, amb: "fun", quick: [["Victoire +3", 3], ["Élimination +1", 1]] });
  A("mario-tennis", "Mario Tennis / Mario Golf", "🎾", "Jeux vidéo", 2, 4, 2,
    ["But du jeu : s'affronter dans des sports Nintendo à plusieurs manettes. En tennis on joue en sets, au golf on compte les coups."],
    ["Tennis : 1 point par set gagné. Golf : on additionne ses coups (le moins est le mieux)."], ["Le plus de sets gagnés gagne."], { dur: 2, amb: "fun", quick: V1 });
  A("pokemon-video", "Pokémon (combats en ligne)", "🎮", "Jeux vidéo", 2, 8, 2,
    ["But du jeu : gagner des combats Pokémon entre amis, en équipes de 6 Pokémon."],
    ["Chaque combat gagné vaut 1 point."], ["Le plus de victoires gagne."], { dur: 2, amb: "tete", quick: V1 });
  // Plein air
  A("disc-golf", "Disc golf (frisbee golf)", "🥏", "Plein air", 1, 8, 3,
    ["But du jeu : mettre un frisbee dans le panier de chaque trou en un minimum de lancers. Comme le golf, mais avec un disque."],
    ["Chaque lancer compte 1. On additionne les coups de tous les trous."], ["Le plus petit total gagne."], { low: true, dur: 2, amb: "air", quick: [["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5", 5]] });
  A("course-orientation", "Course d'orientation", "🧭", "Plein air", 2, 12, 6,
    ["But du jeu : retrouver des balises cachées avec une carte et une boussole le plus vite possible. On joue en solo ou en équipes."],
    ["On note le temps d'arrivée, plus 5 minutes de pénalité par balise manquée."], ["Le plus petit temps gagne."], { low: true, teams: true, dur: 3, amb: "air", quick: [["Pénalité +5", 5]] });
  A("rallye-photo", "Rallye photo", "📸", "Plein air", 2, 12, 6,
    ["But du jeu : prendre en photo des lieux ou des défis de la liste (« un chat », « une statue », « un selfie à l'envers ») le plus vite possible."],
    ["Chaque photo validée vaut 1 point (2 pour un défi difficile)."], ["Le plus de points gagne."], { teams: true, dur: 3, amb: "air", quick: [["Photo +1", 1], ["Difficile +2", 2]] });
  A("tir-corde", "Tir à la corde", "🪢", "Plein air", 4, 20, 8,
    ["But du jeu : tirer la corde pour amener l'équipe adverse au-delà de la ligne centrale. Deux équipes de même nombre de joueurs."],
    ["Chaque manche gagnée vaut 1 point."], ["La première équipe à 3 manches gagne."], { teams: true, target: 3, dur: 1, amb: "air", quick: P1 });
  A("bataille-eau", "Bataille d'eau", "💦", "Plein air", 4, 14, 6,
    ["But du jeu : toucher les autres avec de l'eau (pistolets, ballons, seaux) sans être touché. Une zone de repos sert de base."],
    ["Chaque joueur touché : 1 point pour celui qui l'a touché."], ["Le plus de touches gagne."], { teams: true, dur: 2, amb: "air", quick: [["Touché +1", 1]] });
  // Sport
  A("basket-3x3", "Basket 3x3", "🏀", "Sport", 2, 2, 2,
    ["But du jeu : marquer plus que l'autre équipe de 3 joueurs sur un demi-terrain avec un seul panier."],
    ["Panier à l'intérieur de l'arc : 1 point. Panier derrière l'arc : 2 points."], ["Le premier à 21 points (ou le plus de points au bout de 10 minutes) gagne."], { teams: true, target: 21, dur: 2, amb: "air", quick: [["Panier +1", 1], ["Trois points +2", 2]] });
  A("handball", "Handball", "🤾", "Sport", 2, 2, 2,
    ["But du jeu : marquer des buts avec les mains. Deux équipes de 7 joueurs. On ne peut pas marcher avec le ballon plus de 3 pas."],
    ["Chaque but vaut 1 point."], ["Le plus de buts à la fin gagne."], { teams: true, dur: 3, amb: "air", quick: [["But +1", 1]] });
  A("squash", "Squash", "🎾", "Sport", 2, 2, 2,
    ["But du jeu : renvoyer la balle contre le mur du fond avant qu'elle ne rebondisse deux fois. On joue à tour de rôle."],
    ["Chaque échange gagné vaut 1 point (que l'on ait servi ou non)."], ["Le premier à 11 points avec 2 points d'écart gagne le jeu. Un match se joue en 3 jeux gagnants."], { target: 11, dur: 2, amb: "air", quick: [["+1", 1]] });
  A("beach-volley", "Beach-volley", "🏖", "Sport", 2, 2, 2,
    ["But du jeu : faire tomber le ballon dans le camp adverse. Deux équipes de 2 sur du sable. 3 touches maximum."],
    ["Chaque échange gagné vaut 1 point."], ["Le premier à 21 points avec 2 points d'écart gagne le set (15 en troisième set)."], { teams: true, target: 21, targets: [15], dur: 2, amb: "air", quick: [["+1", 1]] });
  A("challenge-sportif", "Challenge sportif (pompes, gainage…)", "💪", "Sport", 2, 10, 4,
    ["But du jeu : réaliser le plus de répétitions ou tenir le plus longtemps. Épreuves possibles : pompes, squats, gainage, traction, saut en longueur."],
    ["On note le nombre de répétitions (ou la durée en secondes) de chaque épreuve."], ["Le plus haut total gagne."], { dur: 1, amb: "air", quick: [["+10", 10], ["+20", 20], ["+30", 30]] });
})();
