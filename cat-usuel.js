// Seuil « score inhabituel » par manche, calculé par outils/simulation.js (500 parties par jeu).
// Au-dessus : l'appli demande confirmation avant de valider (sans bloquer). Plus bas que la limite, qui elle bloque.
// Non généré à la main : relance « node outils/simulation.js » pour le recalculer.
window.USUEL = {
  cochon: 60,
  fifa: 12,
  "ping-pong": 30,
  sixQuiPrend: 80,
  smash: 12,
  volley: 50,
  badminton: ({ v }) => /11/.test(v) ? 25 : 0
};
