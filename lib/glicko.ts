const Q = Math.log(10) / 400;

function g(rd: number) {
  return 1 / Math.sqrt(1 + (3 * Q * Q * rd * rd) / (Math.PI * Math.PI));
}

function expectedScore(r: number, rOpp: number, rdOpp: number) {
  return 1 / (1 + Math.pow(10, (-g(rdOpp) * (r - rOpp)) / 400));
}

export function updateGlicko(
  player: { rating: number; rd: number },
  opponent: { rating: number; rd: number },
  score: 0 | 1
) {
  const E = expectedScore(player.rating, opponent.rating, opponent.rd);
  const G = g(opponent.rd);

  const d2 = 1 / (Q * Q * G * G * E * (1 - E));

  const newRating =
    player.rating +
    (Q / (1 / (player.rd * player.rd) + 1 / d2)) * G * (score - E);

  const newRD = Math.sqrt(1 / (1 / (player.rd * player.rd) + 1 / d2));

  return {
    rating: newRating,
    rd: Math.max(50, newRD), // prevent overconfidence
  };
}
