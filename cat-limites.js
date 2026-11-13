// Limite de points par manche, proposée automatiquement d'après les règles du jeu et la variante choisie.
// Une entrée par jeu : un nombre, ou une fonction ({ v: nom de la variante, np: nombre de joueurs }) => nombre.
// C'est le MAXIMUM POSSIBLE d'une saisie (valeur absolue), pas un score habituel : il sert surtout à repérer
// une faute de frappe. Les jeux absents n'ont pas de plafond dans leurs règles (score non borné) : on peut
// quand même en fixer un à la main au moment de créer la partie, ou pendant la partie.
//   [web]  = vérifié sur des sources (règles officielles, statistiques, thèses)
//   [règle] = déduit des règles écrites dans l'appli (valeurs des cartes, nombre de cartes, barèmes)
window.LIM = {
  // ---------- 🃏 Cartes ----------
  belote: ({ v }) => /coinch/i.test(v) ? 1088 : 272,    // [règle] capot 252 + belote-rebelote 20 ; ×4 si surcoinchée
  coinche: 2660,                                        // [règle] générale 500 + 160, ×4 (surcoinche) + 20 de belote
  tarot: ({ np }) => np === 4 ? 3588 : 2392,            // [règle] (25+91)×6 + petit au bout + poignée + chelem = 1196 ; ×3 (à 4) ou ×2 (preneur)
  skyjo: 284,                                           // [web] paquet de 150 cartes : 10×12 + 2×11 = 142, doublé = 284
  uno: 1240,                                            // [règle] valeur de toutes les cartes du jeu de 108 cartes
  phase10: 230,                                         // [règle] main de 10 cartes : 8 jokers (25) + 2 « passe ton tour » (15)
  hearts: 26,                                           // [règle] 13 cœurs + dame de pique
  spades: 400,                                          // [simulation] deux nil aveugles réussis dans la même équipe : 200 + 200
  scopa: 24,                                            // [règle] 4 critères + au plus 20 scopas (40 cartes, 2 par prise)
  briscola: 120,                                        // [règle] total des cartes du jeu
  cribbage: 78,                                         // [web] maximum d'une donne : jeu 20 + crib 29 + pegging 29
  milleBornes: ({ np }) => np === 2 ? 4600 : np === 4 ? 4400 : 5100,   // [web] maximum d'une manche selon le nombre de joueurs
  sixQuiPrend: 171,                                     // [règle] total des têtes de bœuf des 104 cartes
  huitAmericain: 508,                                   // [règle] total des 52 cartes (127 par couleur)
  ginRummy: 131,                                        // [règle] Big Gin : 31 + 10 cartes mortes à 10 points
  wizard: 220,                                          // [règle] manche 20 (3 joueurs) : annonce réussie 20 + 10×20
  euchre: 4,                                            // [règle] preneur seul qui fait les 5 plis
  president: ({ np }) => np >= 6 ? 3 : 2,               // [règle] barème ±2 (±3 à 6 joueurs et plus)
  pouilleux: 1, bataille: 1, menteur: 1,                // [règle] 1 point par manche

  // ---------- 🎲 Autres jeux ----------
  yams: 375,                                            // [règle] feuille parfaite : 105 + 35 de bonus + 235
  rummikub: 788,                                        // [règle] total des 104 tuiles + 2 jokers à 30
  catan: 22,                                            // [règle] 13 en bâtiments + 2 route + 2 armée + 5 cartes « point de victoire »
  dominos: 168,                                         // [règle] total des points d'un jeu double-six
  "trivial-pursuit": 6,                                 // [règle] 6 camemberts
  tournoi: 3,                                           // [règle] victoire = 3 points
  petanque: 6,                                          // [règle] une mène rapporte de 1 à 6 points
  flechettes: 180,                                      // [règle] volée maximum : trois triples 20
  molkky: 12,                                           // [règle] une quille = son numéro (12 au plus)
  cornhole: 12,                                         // [règle] 4 sacs × 3 points
  bowling: 30,                                          // [règle] strike suivi de deux strikes
  golf: 6,                                              // [règle] on limite souvent à 6 coups par trou
  "mario-kart": 15,                                     // [règle] 1er d'une course à 12
  badminton: ({ v }) => /11/.test(v) ? 0 : 30,          // [règle] « à 29-29, le point à 30 gagne » (set de 21)
  babyfoot: ({ v }) => /5/.test(v) ? 5 : 10,            // [règle] premier à 10 buts (5 en partie rapide)
  tennis: 7,                                            // [règle] un set se gagne 6-x ou 7-5 / 7-6
  "times-up": 40,                                       // [règle] 40 cartes par partie
  risk: 48,                                             // [règle] 42 territoires + 6 continents
  azul: 240,                                            // [web] score maximum théorique (95 de bonus compris)
  dixit: ({ np }) => Math.max(3, np + 1),               // [règle] 3 (carte du conteur trouvée) + 1 vote par autre joueur
  codenames: 9,                                         // [règle] 9 agents à trouver
  perudo: 5,                                            // [règle] 5 dés au départ
  dobble: 55,                                           // [règle] 55 cartes dans le jeu
  "jungle-speed": 80,                                   // [règle] 80 cartes dans le jeu
  "tick-tack-bomb": 1,                                  // [règle] 1 point de pénalité par manche
  mikado: 170,                                          // [web] 41 baguettes, 170 points au total
  billard: 15,                                          // [règle] 15 billes à empocher
  "just-dance": ({ v }) => /5/.test(v) ? 66665 : 13333  // [web] 13 333 par chanson (×5 pour une playlist de 5)
};
