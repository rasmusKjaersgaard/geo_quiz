import type { Country } from '../data/countries';
import { normalize } from './normalize';

export type AnswerKind = 'country' | 'capital';

/** Every accepted spelling for a country (kind = 'country') or its capital (kind = 'capital'). */
export function acceptedAnswers(c: Country, kind: AnswerKind): string[] {
  return kind === 'country' ? [c.name, ...c.aliases] : [...c.capitals, ...c.capitalAliases];
}

/** Lookup between normalized answer keys and country ids for one answer kind. */
export class AnswerIndex {
  private byKey = new Map<string, string[]>();
  private keysById = new Map<string, string[]>();

  constructor(countries: Country[], readonly kind: AnswerKind) {
    for (const c of countries) {
      const keys = [...new Set(acceptedAnswers(c, kind).map(normalize).filter(Boolean))];
      this.keysById.set(c.id, keys);
      for (const k of keys) {
        const ids = this.byKey.get(k) ?? [];
        if (!ids.includes(c.id)) ids.push(c.id);
        this.byKey.set(k, ids);
      }
    }
  }

  /** Countries whose answer exactly matches this normalized key. */
  idsFor(key: string): string[] {
    return this.byKey.get(key) ?? [];
  }

  keysOf(id: string): string[] {
    return this.keysById.get(id) ?? [];
  }

  /** Is `key` the start of (or equal to) any answer? */
  hasPrefix(key: string): boolean {
    for (const k of this.byKey.keys()) if (k.startsWith(key)) return true;
    return false;
  }

  /** Keys that map to more than one country (should be empty; checked by tests). */
  collisions(): [string, string[]][] {
    return [...this.byKey.entries()].filter(([, ids]) => ids.length > 1);
  }
}

/**
 * Countries quiz: the country this input names, ignoring ones already named.
 * Returns null when the text isn't (yet) a complete answer.
 */
export function matchNew(input: string, index: AnswerIndex, named: ReadonlySet<string>): string | null {
  const key = normalize(input);
  if (!key) return null;
  return index.idsFor(key).find((id) => !named.has(id)) ?? null;
}

export interface TypingState {
  /** Key of the answer accepted last, so its longer form can be finished. */
  carry: string;
  /** Text swallowed after an answer (the "A" of "USA"), kept in case it starts the next name. */
  ghost: string;
}

export const EMPTY_TYPING: TypingState = { carry: '', ghost: '' };

export interface TypingResult extends TypingState {
  /** Newly named country, if any. */
  id: string | null;
  /** Clear the input box. */
  clear: boolean;
}

/**
 * Countries quiz with "keep typing" support. A short name is accepted the
 * moment it is complete (Sporcle behaviour) and the box clears - but if you
 * were really typing a longer name, the rest still counts:
 *
 *   "Niger" -> Niger accepted; keep typing "ia" -> Nigeria accepted too
 *   "UK"    -> United Kingdom; keep typing "raine" -> Ukraine
 *   "US"    -> United States; the trailing "A" of "USA" is swallowed, but
 *              still counts if it was the start of "Afghanistan"
 *
 * A complete name of an already-named country just clears the box.
 */
export function matchTyping(input: string, state: TypingState, index: AnswerIndex, named: ReadonlySet<string>): TypingResult {
  const key = normalize(input);
  if (!key) return { ...state, id: null, clear: false };
  const fresh = (k: string) => index.idsFor(k).find((id) => !named.has(id)) ?? null;

  const direct = fresh(key);
  if (direct) return { id: direct, clear: true, carry: key, ghost: '' };
  // Complete name of a country that's already named: clear the box (no credit),
  // but carry it so "Niger" -> "Nigeria" still works.
  if (index.idsFor(key).length) return { id: null, clear: true, carry: key, ghost: '' };

  let ghost = state.ghost;
  if (ghost) {
    const g = normalize(ghost + input);
    const viaGhost = fresh(g);
    if (viaGhost) return { id: viaGhost, clear: true, carry: g, ghost: '' };
    if (!index.hasPrefix(g)) ghost = '';
  }

  let carry = state.carry;
  if (carry) {
    const joined = carry + key;
    const viaCarry = fresh(joined);
    if (viaCarry) return { id: viaCarry, clear: true, carry: joined, ghost: '' };
    if (index.idsFor(joined).length) return { id: null, clear: true, carry: joined, ghost: input };
    if (!index.hasPrefix(joined)) carry = '';
  }
  return { id: null, clear: false, carry, ghost };
}

export type Verdict = 'correct' | 'wrong' | 'none';

/**
 * Flags / capitals quizzes: judge the text typed for the current prompt.
 *
 * - correct: the text is an accepted answer for the current country.
 * - wrong:   the text exactly matches a *different* country's answer and is not
 *            a prefix of any accepted answer for the current one (so "Niger"
 *            while typing "Nigeria" or "UK" while typing "Ukraine" do nothing).
 *            With `submit` (Enter), any other country's full answer is wrong.
 * - none:    anything else (partial text) - keep typing.
 */
export function judge(input: string, currentId: string, index: AnswerIndex, opts: { submit?: boolean } = {}): Verdict {
  const key = normalize(input);
  if (!key) return 'none';
  const current = index.keysOf(currentId);
  if (current.includes(key)) return 'correct';
  const others = index.idsFor(key).filter((id) => id !== currentId);
  if (others.length === 0) return 'none';
  if (opts.submit) return 'wrong';
  if (current.some((k) => k.startsWith(key))) return 'none';
  return 'wrong';
}
