import { cryptoRandom, type RandomInt } from "./dice";

const DICE_ROLLED = 4;
const SIDES = 6;

/** 4d6 descartando o menor dado: o método clássico de atributos. */
export const abilityScoreFromDice = (dice: number[]): number =>
  dice.toSorted((a, b) => a - b).slice(1).reduce((sum, value) => sum + value, 0);

export const rollAbilityScore = (random: RandomInt = cryptoRandom): number =>
  abilityScoreFromDice(Array.from({ length: DICE_ROLLED }, () => random(SIDES)));

/** Um valor para cada atributo do modelo, rolados com o gerador seguro. */
export const rollAbilityPool = (count: number, random: RandomInt = cryptoRandom): number[] =>
  Array.from({ length: count }, () => rollAbilityScore(random));
