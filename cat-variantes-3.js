// Variantes de quelques jeux de cat-ajouts3.js. Même format que cat-variantes.js : [nom, règle, { target?, low? }]
(function () {
  const T = n => ({ target: n });
  const V = {
    gomoku: [["Partie à 2 victoires", "Le premier à gagner 2 parties l'emporte.", T(2)], ["Partie à 5 victoires", "Le premier à gagner 5 parties l'emporte.", T(5)]],
    pentago: [["Partie à 2 victoires", "Le premier à gagner 2 parties l'emporte.", T(2)], ["Partie à 5 victoires", "Le premier à gagner 5 parties l'emporte.", T(5)]],
    stratego: [["Partie à 2 victoires", "Le premier à gagner 2 parties l'emporte.", T(2)]],
    quoridor: [["Partie à 2 victoires", "Le premier à gagner 2 parties l'emporte.", T(2)], ["Partie à 5 victoires", "Le premier à gagner 5 parties l'emporte.", T(5)]],
    nim: [["Partie à 5 victoires", "Le premier à gagner 5 parties l'emporte.", T(5)]],
    "tape-main": [["Partie à 5 victoires", "Le premier à gagner 5 parties l'emporte.", T(5)]],
    "poker-dice": [["Partie courte (3 manches)", "Le premier à gagner 3 manches l'emporte.", T(3)], ["Partie longue (8 manches)", "Le premier à gagner 8 manches l'emporte.", T(8)]],
    ecarte: [["Partie en 3 points", "Le premier à 3 points gagne.", T(3)], ["Partie en 7 points", "Le premier à 7 points gagne.", T(7)]],
    "air-hockey": [["Premier à 5 buts", "Le premier à 5 buts gagne.", T(5)], ["Premier à 10 buts", "Le premier à 10 buts gagne.", T(10)]],
    squash: [["Jeu à 15 points", "Le premier à 15 points gagne le jeu.", T(15)]],
    "beach-volley": [["Set de 15 points", "Le premier à 15 points avec 2 points d'écart gagne le set.", T(15)]],
    "basket-3x3": [["Premier à 11", "Le premier à 11 points gagne.", T(11)]],
    pinochle: [["Partie courte (150)", "Le premier à 150 points gagne.", T(150)], ["Partie longue (1000)", "On joue jusqu'à 1000 points.", T(1000)]],
    "rami-51": [["Limite à 100", "Éliminé au-delà de 100 points.", { target: 100, low: true }], ["Limite à 200", "Éliminé au-delà de 200 points.", { target: 200, low: true }]]
  };
  [window.CAT_CARTES, window.CAT_AUTRES].forEach(l => (l || []).forEach(g => { if (V[g.id] && !g.variants) g.variants = V[g.id]; }));
})();
