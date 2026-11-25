// Jeux populaires ajoutés (lot 1 : CARTES). Même format que cat-plus.js. Le lot 2 (autres jeux) est dans cat-populaires2.js.
(function () {
  const C = (id, name, emoji, cat, min, max, dp, rules, scoring, winner, o = {}) =>
    window.CAT_CARTES.push({ id, name, emoji, cat, min, max, dp, low: false, teams: false, quick: [], targets: [], rules, scoring, winner, ...o });

  C("trio", "Trio", "3️⃣", "Rapidité", 3, 6, 3,
    ["But du jeu : réunir des trios, c'est-à-dire trois cartes de même valeur (cartes de 1 à 12).", "À son tour, on retourne une carte chez un adversaire (la plus petite ou la plus grande de sa main) ou dans le milieu, jusqu'à trouver trois cartes identiques. Si une carte retournée est différente, on les repose et le tour passe."],
    ["Chaque trio gagné vaut 1 point (compte les trios de chacun)."],
    ["Règle de base : le premier à réunir 3 trios gagne, ou immédiatement avec le trio de 7."],
    { target: 3 });
  C("flip7", "Flip 7", "7️⃣", "Pioche et prise de risque", 3, 18, 4,
    ["But du jeu : piocher des cartes numérotées (0 à 12) sans jamais en piocher deux identiques.", "À son tour on choisit « piocher » ou « rester ». Piocher un doublon = on saute (0 point pour la manche). Réunir 7 cartes différentes met fin à la manche avec +15 points de bonus."],
    ["Points de la manche = somme des cartes numérotées gardées, plus les cartes bonus (+2, +4, ... ×2) et le bonus de 15 pour 7 cartes différentes."],
    ["Le premier joueur à atteindre 200 points (ou plus) à la fin d'une manche gagne ; le plus haut total l'emporte en cas de dépassement."],
    { target: 200, targets: [200] });
  C("hanabi", "Hanabi", "🎆", "Coopératif", 2, 5, 4,
    ["But du jeu (coopératif) : réaliser un feu d'artifice en posant, par couleur, les cartes de 1 à 5 dans l'ordre croissant.", "On ne voit jamais ses propres cartes : à son tour on donne un indice (couleur ou valeur) à un partenaire, on défausse pour récupérer un indice, ou on pose une carte. 3 erreurs terminent la partie."],
    ["Score = somme de la carte la plus haute posée dans chaque couleur (maximum 25)."],
    ["Toute l'équipe gagne ou perd ensemble : 25 points = feu d'artifice parfait ; on compare avec ses scores précédents."],
    { coop: true });
  C("the-mind", "The Mind", "🧠", "Coopératif", 2, 4, 3,
    ["But du jeu (coopératif) : poser toutes les cartes de tous les joueurs dans l'ordre croissant, sans parler ni se faire de signes.", "À chaque niveau, chacun reçoit autant de cartes que le numéro du niveau. Une carte posée trop tôt fait perdre une vie."],
    ["Score = niveau atteint (12 niveaux à 2 joueurs, 10 à 3, 8 à 4)."],
    ["L'équipe gagne si elle termine le dernier niveau avant d'avoir perdu toutes ses vies."],
    { coop: true });
  C("love-letter", "Love Letter", "💌", "Duel de cartes", 2, 4, 3,
    ["But du jeu : faire parvenir sa lettre à la princesse. Chaque manche, on pioche une carte puis on en joue une et on applique son effet (Garde, Prêtre, Baron, Servante, Prince, Roi, Comtesse, Princesse).", "La manche se termine quand il ne reste qu'un joueur, ou à la fin de la pioche : la carte la plus forte gagne."],
    ["Le gagnant de la manche remporte un jeton d'affection."],
    ["Premier à 7 jetons à 2 joueurs, 5 à 3 joueurs, 4 à 4 joueurs."],
    { target: 5 });
  C("cambio", "Cambio (Dutch)", "🔁", "Mémoire", 2, 6, 4,
    ["But du jeu : avoir le moins de points possible dans ses 4 cartes posées face cachée devant soi.", "On connaît seulement 2 de ses cartes au début. À son tour on pioche, puis on échange, on défausse ou on utilise le pouvoir de la carte (regarder, échanger). On peut crier « Cambio » pour arrêter la manche."],
    ["Valeurs : As 1, 2 à 10 = valeur, Valet 11, Dame 12, Roi noir 13, Roi rouge 0, Joker −1."],
    ["On additionne les manches : le plus petit total gagne."],
    { low: true });
  C("rikiki", "Rikiki (Oh Hell)", "🎯", "Plis", 3, 8, 4,
    ["But du jeu : annoncer exactement le nombre de plis que l'on va faire. Le nombre de cartes distribuées change à chaque manche (1, 2, 3, ... puis on redescend).", "Chacun annonce son pari avant de jouer ; le dernier annonceur ne peut pas faire un total égal au nombre de plis."],
    ["Barème courant (à convenir) : pari réussi = 10 points + 2 par pli annoncé ; raté = −2 par pli d'écart."],
    ["Le plus haut total à la fin de la dernière manche gagne."]);
  C("whist", "Whist", "♠️", "Plis", 4, 4, 4,
    ["But du jeu : en équipes de 2, faire plus de plis que l'adversaire. Jeu de 52 cartes, 13 plis ; la dernière carte distribuée donne l'atout.", "Il faut fournir la couleur demandée, sinon on peut couper ou défausser."],
    ["Chaque pli au-delà des 6 premiers rapporte 1 point à l'équipe."],
    ["La première équipe à 5 points (ou au total convenu) gagne la manche ; on joue souvent en 2 manches gagnantes."],
    { teams: true, target: 5 });
  C("bridge", "Bridge", "♣️", "Plis", 4, 4, 4,
    ["But du jeu : en équipes de 2 (face à face), réaliser le contrat annoncé aux enchères (niveau + couleur ou sans-atout).", "Après les enchères, le déclarant joue ses cartes et celles de son partenaire (le mort) contre les deux défenseurs."],
    ["Contrat réussi : points de contrat + surlevées ; primes de manche (100 points ou plus) et de chelem ; contrat chuté : pénalités pour l'adversaire. Noter les points « au-dessus » et « en dessous » de la ligne."],
    ["Une partie se gagne à 100 points de contrat ; le premier camp à 2 parties gagne le robre."],
    { teams: true });
  C("five-crowns", "Five Crowns", "👑", "Rami", 2, 7, 3,
    ["But du jeu : poser toutes ses cartes en suites (3 cartes ou plus de même couleur) et en brelans. 5 couleurs, 11 manches : on commence avec 3 cartes, puis 4, ... jusqu'à 13.", "À chaque manche, les cartes de la valeur de la manche (3 puis 4 ... puis Roi) sont jokers, en plus des jokers."],
    ["On compte les cartes restantes en main : 3 à 10 = valeur, Valet 11, Dame 12, Roi 13, Joker 50, carte joker de la manche 20."],
    ["Le plus petit total après les 11 manches gagne."],
    { low: true });
  C("sushi-go", "Sushi Go!", "🍣", "Draft", 2, 5, 4,
    ["But du jeu : en 3 manches, choisir une carte dans sa main puis passer le reste à son voisin pour composer le meilleur repas de sushis.", "On révèle les cartes en même temps, puis on recommence jusqu'à ce que les mains soient vides."],
    ["Tempura : 5 points par paire ; Sashimi : 10 points par trio ; Raviolis : 1, 3, 6, 10 ou 15 selon le nombre ; Nigiri : 1 à 3 (×3 avec un wasabi) ; Maki : points pour celui qui en a le plus ; Pudding : points à la fin de la partie."],
    ["Le plus haut total après 3 manches gagne."]);
  C("papayoo", "Papayoo", "🎲", "Plis", 3, 8, 4,
    ["But du jeu : éviter de ramasser des cartes qui rapportent des points. Avant chaque manche on lance un dé : la couleur indiquée est la couleur Payoo de la manche.", "On joue 1 pli à la fois en suivant la couleur ; celui qui a posé la plus forte carte ramasse le pli."],
    ["Chaque carte Payoo vaut sa valeur en points, le 7 Payoo vaut 40 points ; les autres cartes valent 0."],
    ["Le plus petit total à la fin de la manche (puis de la partie) gagne."],
    { low: true });
  C("exploding-kittens", "Exploding Kittens", "💣", "Chaos", 2, 5, 4,
    ["But du jeu : être le dernier joueur en vie. À chaque tour on pioche une carte : si c'est un chaton explosif et qu'on n'a pas de désamorçage, on est éliminé.", "Avant de piocher, on peut jouer des cartes d'action (voler, passer son tour, regarder la pioche, mélanger...)."],
    ["Pas de points : on compte 1 victoire par partie gagnée."],
    ["Le dernier joueur non éliminé gagne la partie."],
    { target: 3 });
  C("cah", "Cards Against Humanity", "⬛", "Ambiance", 3, 10, 5,
    ["But du jeu : le joueur juge lit une carte noire à trous, les autres jouent chacun la carte blanche la plus drôle ; le juge choisit sa préférée.", "Le juge change à chaque tour. Jeu pour adultes."],
    ["La carte noire est gagnée par le joueur dont la réponse a été choisie : 1 point."],
    ["Le premier joueur à un nombre de points convenu (souvent 5 à 10) gagne."],
    { target: 7 });
})();
