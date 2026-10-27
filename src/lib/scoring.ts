// Streak scoring for the Flags and Capitals quizzes. Tweak the numbers here.
export const SCORING = {
  /** Points for every correct answer. */
  base: 100,
  /** Speed bonus right when the prompt appears... */
  speedBonusMax: 100,
  /** ...minus this much per second, never below 0 (0 after 10 s). */
  speedBonusPerSecond: 10,
  /** Each answer in a streak adds this to the multiplier (1.0, 1.1, 1.2, ...). */
  streakStep: 0.1,
  /** Multiplier cap. */
  maxMultiplier: 2.0,
};

export function speedBonus(secondsSinceShown: number): number {
  return Math.max(0, SCORING.speedBonusMax - SCORING.speedBonusPerSecond * Math.max(0, secondsSinceShown));
}

/** Multiplier for an answer that brings the streak to `streak` (1 = first in a row). */
export function multiplier(streak: number): number {
  if (streak <= 1) return 1;
  return Math.min(SCORING.maxMultiplier, 1 + SCORING.streakStep * (streak - 1));
}

/** Points for a correct answer; `streak` includes this answer. */
export function pointsFor(secondsSinceShown: number, streak: number): number {
  return Math.round((SCORING.base + speedBonus(secondsSinceShown)) * multiplier(streak));
}
