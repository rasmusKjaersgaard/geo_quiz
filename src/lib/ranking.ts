import { QUIZ_BY_ID } from '../data/quizzes';
import type { LeaderboardMode, ScoreRow } from '../backend/types';

// Leaderboard ordering. The SQL function `get_leaderboard` in
// supabase/migration.sql implements exactly the same rules.
//
// Countries: everyone who named all countries first, fastest first;
//            then by countries named (desc), then time (asc).
// Streak quizzes (flags, capitals): score (desc), then correct (desc),
//            then time (asc).
// Ties: earlier attempt first.

type Comparable = Pick<ScoreRow, 'quizId' | 'score' | 'correct' | 'completedAll' | 'timeMs' | 'createdAt'>;

export function compareScores(a: Comparable, b: Comparable): number {
  const kind = QUIZ_BY_ID[a.quizId]?.kind ?? 'streak';
  if (kind === 'countries') {
    if (a.completedAll !== b.completedAll) return a.completedAll ? -1 : 1;
    if (!a.completedAll && a.correct !== b.correct) return b.correct - a.correct;
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
  } else {
    if (a.score !== b.score) return b.score - a.score;
    if (a.correct !== b.correct) return b.correct - a.correct;
    if (a.timeMs !== b.timeMs) return a.timeMs - b.timeMs;
  }
  return a.createdAt.localeCompare(b.createdAt);
}

/** Each user's best attempt. */
export function bestPerUser<T extends Comparable & { userId: string }>(rows: T[]): T[] {
  const best = new Map<string, T>();
  for (const r of rows) {
    const cur = best.get(r.userId);
    if (!cur || compareScores(r, cur) < 0) best.set(r.userId, r);
  }
  return [...best.values()];
}

export function rankLeaderboard(rows: ScoreRow[], mode: LeaderboardMode, limit: number): ScoreRow[] {
  const pool = mode === 'best' ? bestPerUser(rows) : rows.slice();
  return pool.sort(compareScores).slice(0, limit);
}

/** Position (1-based) of `row` among `rows` for the given mode. */
export function rankOf(row: ScoreRow, rows: ScoreRow[], mode: LeaderboardMode): number {
  const pool = mode === 'best' ? bestPerUser(rows.filter((r) => r.userId !== row.userId)) : rows.filter((r) => r.id !== row.id);
  return 1 + pool.filter((r) => compareScores(r, row) < 0).length;
}
