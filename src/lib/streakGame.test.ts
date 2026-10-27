import { describe, expect, it } from 'vitest';
import { COUNTRIES } from '../data/countries';
import { AnswerIndex } from './matcher';
import { initStreak, skip, submitAnswer, typeAnswer, type StreakState } from './streakGame';

const index = new AnswerIndex(COUNTRIES, 'country');
const start = (ids: string[]): StreakState => ({ ...initStreak(ids, 0), queue: ids.slice() });

/** Types `text` key by key into the box, like the real input (which the game may clear). */
function typeAll(s: StreakState, text: string, now: number): StreakState {
  for (const ch of text) s = typeAnswer(s, s.input + ch, now, index);
  return s;
}

describe('streak game', () => {
  it('shuffles all ids into the queue', () => {
    const s = initStreak(['A', 'B', 'C', 'D'], 0, () => 0.5);
    expect(s.queue.slice().sort()).toEqual(['A', 'B', 'C', 'D']);
  });

  it('accepts a correct answer instantly and moves on', () => {
    let s = start(['FRA', 'DEU']);
    s = typeAll(s, 'France', 1000);
    expect(s.queue).toEqual(['DEU']);
    expect(s.score).toBe(190); // (100 + 90) * 1.0
    expect(s.streak).toBe(1);
    expect(s.input).toBe('');
    expect(s.shownAt).toBe(1000);
  });

  it('builds the streak multiplier', () => {
    let s = start(['FRA', 'DEU', 'ITA']);
    s = typeAll(s, 'France', 0); // 200
    s = typeAll(s, 'Germany', 0); // 220
    s = typeAll(s, 'Italy', 0); // 240
    expect(s.score).toBe(660);
    expect(s.bestStreak).toBe(3);
  });

  it('wrong answer resets streak, keeps the flag and its clock, never lowers score', () => {
    let s = start(['FRA', 'DEU', 'ITA']);
    s = typeAll(s, 'France', 0);
    s = typeAll(s, 'Germany', 0);
    const before = s.score;
    s = typeAll(s, 'Spain', 2000);
    expect(s.event?.type).toBe('wrong');
    expect(s.streak).toBe(0);
    expect(s.score).toBe(before);
    expect(s.queue[0]).toBe('ITA');
    expect(s.input).toBe('');
    expect(s.shownAt).toBe(0);
    expect(s.bestStreak).toBe(2);
    s = typeAll(s, 'Italy', 4000);
    expect(s.score).toBe(before + 160); // (100 + 60) * 1.0, clock kept running
  });

  it('does not mark prefix pairs wrong, Enter decides', () => {
    let s = start(['NGA']);
    s = typeAll(s, 'Niger', 0);
    expect(s.event).toBeNull();
    expect(s.input).toBe('Niger');
    s = submitAnswer(s, 0, index);
    expect(s.event?.type).toBe('wrong');
    s = typeAll(s, 'Nigeria', 0);
    expect(s.queue).toEqual([]);
  });

  it('typing UK on the way to Ukraine is fine', () => {
    let s = start(['UKR']);
    s = typeAll(s, 'Ukraine', 0);
    expect(s.correctIds).toEqual(['UKR']);
    expect(s.streak).toBe(1);
  });

  it('skip sends the flag to the back and resets the streak', () => {
    let s = start(['FRA', 'DEU', 'ITA']);
    s = typeAll(s, 'France', 0);
    s = skip(s, 500);
    expect(s.queue).toEqual(['ITA', 'DEU']);
    expect(s.streak).toBe(0);
    expect(s.shownAt).toBe(500);
    expect(s.score).toBe(200);
  });

  it('Enter on partial text does nothing', () => {
    let s = start(['FRA']);
    s = typeAll(s, 'Fra', 0);
    const after = submitAnswer(s, 0, index);
    expect(after).toBe(s);
  });

  it('the rest of a longer name does not spill into the next answer', () => {
    let s = start(['ATG', 'FRA']);
    s = typeAll(s, 'Antigua and Barbuda', 0);
    expect(s.correctIds).toEqual(['ATG']);
    expect(s.input).toBe('');
    expect(s.streak).toBe(1);
    s = typeAll(s, 'France', 0);
    expect(s.correctIds).toEqual(['ATG', 'FRA']);
  });

  it('a swallowed letter still starts the next answer (US + Afghanistan)', () => {
    let s = start(['USA', 'AFG']);
    s = typeAll(s, 'USA', 0);
    expect(s.input).toBe('');
    s = typeAll(s, 'fghanistan', 0);
    expect(s.correctIds).toEqual(['USA', 'AFG']);
  });

  it('wrong answers are still caught after a carry', () => {
    let s = start(['USA', 'AFG']);
    s = typeAll(s, 'USA', 0);
    s = typeAll(s, 'Peru', 0);
    expect(s.event?.type).toBe('wrong');
    expect(s.queue[0]).toBe('AFG');
  });
});

