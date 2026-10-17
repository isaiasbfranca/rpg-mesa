/** Compra de pontos no estilo clássico: 27 pontos, valores de 8 a 15. */
export const POINT_BUY_BUDGET = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

const COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

export const pointCost = (score: number): number => COSTS[score] ?? 0;

export const totalCost = (scores: number[]): number => scores.reduce((sum, score) => sum + pointCost(score), 0);

export const pointsLeft = (scores: number[], budget: number = POINT_BUY_BUDGET): number => budget - totalCost(scores);

/** Subir um valor só vale se ele não passar de 15 e o custo extra couber nos pontos que sobram. */
export const canRaise = (scores: number[], index: number, budget: number = POINT_BUY_BUDGET): boolean => {
  const current = scores[index];
  if (current === undefined || current >= POINT_BUY_MAX) return false;
  return pointCost(current + 1) - pointCost(current) <= pointsLeft(scores, budget);
};

export const canLower = (scores: number[], index: number): boolean => (scores[index] ?? POINT_BUY_MIN) > POINT_BUY_MIN;

export const startingScores = (count: number): number[] => Array.from({ length: count }, () => POINT_BUY_MIN);
