import { describe, expect, it } from 'vitest';
import { AnswerIndex, judge, matchNew } from '../lib/matcher';
import { PEOPLE, PERSON_BY_ID, personAnswers } from './people';

const entries = PEOPLE.map((p) => ({ id: p.id, answers: personAnswers(p) }));
const index = new AnswerIndex(entries);
const who = (input: string) => matchNew(input, index, new Set());

describe('people data', () => {
  it('has 100 people with unique, file-name-safe ids', () => {
    expect(PEOPLE).toHaveLength(100);
    expect(new Set(PEOPLE.map((p) => p.id)).size).toBe(100);
    for (const p of PEOPLE) expect(p.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
  it('has the expected group sizes', () => {
    const count = (c: string) => PEOPLE.filter((p) => p.category === c).length;
    expect(count('International')).toBe(12);
    expect(count('Present men')).toBe(28);
    expect(count('Present women')).toBe(26);
    expect(count('Comedians and revue')).toBe(6);
    expect(count('Classics')).toBe(28);
  });
  it('no accepted answer belongs to two people', () => {
    expect(index.collisions()).toEqual([]);
  });
});

describe('accepted names', () => {
  it('accepts full names', () => {
    expect(who('Mads Mikkelsen')).toBe('mads-mikkelsen');
    expect(who('Lars Mikkelsen')).toBe('lars-mikkelsen');
    expect(who('nikolaj coster waldau')).toBe('nikolaj-coster-waldau');
    expect(who('Zlatko Buric')).toBe('zlatko-buric');
    expect(who('Anders W. Berthelsen')).toBe('anders-w-berthelsen');
  });
  it('never accepts a surname or first name alone', () => {
    for (const s of ['Mikkelsen', 'Dyrholm', 'Passer', 'Mads', 'Kaas', 'Trine', 'Nielsen']) expect(who(s)).toBeNull();
  });
  it('three or more names: first name + any one other name', () => {
    expect(who('Sidse Babett')).toBe('sidse-babett-knudsen');
    expect(who('Sidse Knudsen')).toBe('sidse-babett-knudsen');
    expect(who('Sidse Babett Knudsen')).toBe('sidse-babett-knudsen');
    expect(who('Nikolaj Lie')).toBe('nikolaj-lie-kaas');
    expect(who('Nikolaj Kaas')).toBe('nikolaj-lie-kaas');
    expect(who('Anders Berthelsen')).toBe('anders-w-berthelsen');
    expect(who('Thomas Bo')).toBe('thomas-bo-larsen');
    expect(who('Birgitte Sørensen')).toBe('birgitte-hjort-sorensen');
    expect(who('Mikkel Følsgaard')).toBe('mikkel-boe-folsgaard');
    // ...but not the initial, and not without the first name
    expect(who('Anders W')).toBeNull();
    expect(who('Lie Kaas')).toBeNull();
    expect(who('Babett Knudsen')).toBeNull();
  });
  it('two names must both be typed', () => {
    expect(who('Mads')).toBeNull();
    expect(who('Preben Kaas')).toBe('preben-kaas');
    expect(who('Preben')).toBeNull();
  });
  it('Danish letters can be typed several ways', () => {
    for (const s of ['Søren Malling', 'Soren Malling', 'Soeren Malling']) expect(who(s)).toBe('soren-malling');
    for (const s of ['Sofie Gråbøl', 'Sofie Grabol', 'Sofie Graaboel', 'Sofie Graabol']) expect(who(s)).toBe('sofie-graabol');
    for (const s of ['Pilou Asbæk', 'Pilou Asbaek']) expect(who(s)).toBe('pilou-asbaek');
    for (const s of ['Tammi Øst', 'Tammi Ost', 'Tammi Oest']) expect(who(s)).toBe('tammi-ost');
    expect(who('Ove Sprogoe')).toBe('ove-sprogoe');
    expect(who('Natalie Madueno')).toBe('natalie-madueno');
  });
});

describe('judging in the quiz', () => {
  const j = (input: string, current: string, submit = false) => judge(input, current, index, { submit });
  it('marks another person wrong once their full name is typed', () => {
    expect(j('Lars Mikkelsen', 'mads-mikkelsen')).toBe('wrong');
    expect(j('Preben Kaas', 'nikolaj-lie-kaas')).toBe('wrong');
  });
  it('waits while a name could still become another one', () => {
    // "Nikolaj Lie" is a full answer for Nikolaj Lie Kaas, but also the start of
    // "Nikolaj Lie Kaas" - typing it for another photo isn't judged yet.
    expect(j('Nikolaj Lie', 'preben-kaas')).toBe('none');
    expect(j('Nikolaj Lie', 'preben-kaas', true)).toBe('wrong');
    expect(j('Nikolaj Lie', 'nikolaj-lie-kaas')).toBe('correct');
  });
  it('partial names do nothing', () => {
    expect(j('Mads Mikkel', 'mads-mikkelsen')).toBe('none');
    expect(j('Lars', 'mads-mikkelsen')).toBe('none');
  });
  it('display names are unchanged', () => {
    expect(PERSON_BY_ID['soren-malling'].name).toBe('Søren Malling');
  });
});
