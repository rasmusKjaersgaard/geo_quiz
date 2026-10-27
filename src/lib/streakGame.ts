// Pure game logic for the streak quizzes (Flags, Capitals). The React
// component only feeds it keystrokes and timestamps.
import { judge, type AnswerIndex } from './matcher';
import { normalize } from './normalize';
import { pointsFor } from './scoring';

export interface StreakState {
  queue: string[]; // country ids, current prompt first
  shownAt: number; // ms timestamp when the current prompt appeared
  input: string;
  score: number;
  streak: number;
  bestStreak: number;
  correctIds: string[];
  /**
   * "Keep typing" support (see matchTyping): `carry` is the key that was just
   * accepted, so the rest of a longer name ("Antigua" + " and Barbuda") is
   * swallowed instead of landing in the next answer. `ghost` is swallowed text
   * that still counts if it turns out to start the next answer.
   */
  carry: string;
  prevId: string | null;
  ghost: string;
  /** Last thing that happened, for UI effects (points pop, red flash). */
  event: { type: 'correct'; id: string; points: number; seq: number } | { type: 'wrong' | 'skip'; seq: number } | null;
}

export function initStreak(ids: string[], now: number, random: () => number = Math.random): StreakState {
  const queue = ids.slice();
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return { queue, shownAt: now, input: '', score: 0, streak: 0, bestStreak: 0, correctIds: [], carry: '', prevId: null, ghost: '', event: null };
}

const nextSeq = (s: StreakState) => (s.event?.seq ?? 0) + 1;

function correct(s: StreakState, now: number, acceptedKey: string): StreakState {
  const id = s.queue[0];
  const streak = s.streak + 1;
  const points = pointsFor((now - s.shownAt) / 1000, streak);
  return {
    ...s,
    queue: s.queue.slice(1),
    shownAt: now,
    input: '',
    score: s.score + points,
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    correctIds: [...s.correctIds, id],
    carry: acceptedKey,
    prevId: id,
    ghost: '',
    event: { type: 'correct', id, points, seq: nextSeq(s) },
  };
}

// A wrong answer resets the streak and clears the input; the prompt and its
// speed clock stay as they are.
function wrong(s: StreakState): StreakState {
  return { ...s, input: '', streak: 0, carry: '', ghost: '', event: { type: 'wrong', seq: nextSeq(s) } };
}

export function typeAnswer(s: StreakState, text: string, now: number, index: AnswerIndex): StreakState {
  if (!s.queue.length) return s;
  const current = s.queue[0];
  const key = normalize(text);
  const verdict = judge(text, current, index);
  if (verdict === 'correct') return correct(s, now, key);

  // Swallowed text from the previous answer may be the start of this one.
  let ghost = s.ghost;
  if (ghost) {
    const viaGhost = ghost + text;
    if (judge(viaGhost, current, index) === 'correct') return correct(s, now, normalize(viaGhost));
    if (!index.hasPrefix(normalize(viaGhost))) ghost = '';
  }

  // Still finishing the previous answer's longer form?
  let carry = s.carry;
  if (carry && s.prevId && key) {
    const joined = carry + key;
    const prevKeys = index.keysOf(s.prevId);
    if (prevKeys.includes(joined)) return { ...s, input: '', carry: joined, ghost: text, event: s.event };
    if (prevKeys.some((k) => k.startsWith(joined))) return { ...s, input: text, ghost };
    carry = '';
  }

  if (verdict === 'wrong') return wrong(s);
  return { ...s, input: text, carry, ghost };
}

/** Enter: decide prefix cases like "Niger" vs "Nigeria". */
export function submitAnswer(s: StreakState, now: number, index: AnswerIndex): StreakState {
  if (!s.queue.length) return s;
  const verdict = judge(s.input, s.queue[0], index, { submit: true });
  if (verdict === 'correct') return correct(s, now, normalize(s.input));
  if (verdict === 'wrong') return wrong(s);
  return s;
}

/** Skip: streak resets, no points, the prompt goes to the back of the queue. */
export function skip(s: StreakState, now: number): StreakState {
  if (!s.queue.length) return s;
  return { ...s, queue: [...s.queue.slice(1), s.queue[0]], shownAt: now, input: '', streak: 0, carry: '', prevId: null, ghost: '', event: { type: 'skip', seq: nextSeq(s) } };
}
