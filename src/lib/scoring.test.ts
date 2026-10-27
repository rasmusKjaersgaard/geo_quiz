import { describe, expect, it } from 'vitest';
import { multiplier, pointsFor, speedBonus } from './scoring';

describe('scoring', () => {
  it('speed bonus drops 10 per second and stops at 0', () => {
    expect(speedBonus(0)).toBe(100);
    expect(speedBonus(2.5)).toBe(75);
    expect(speedBonus(10)).toBe(0);
    expect(speedBonus(30)).toBe(0);
  });
  it('multiplier grows 0.1 per streak step and caps at 2.0', () => {
    expect(multiplier(0)).toBe(1);
    expect(multiplier(1)).toBe(1);
    expect(multiplier(2)).toBeCloseTo(1.1);
    expect(multiplier(5)).toBeCloseTo(1.4);
    expect(multiplier(11)).toBeCloseTo(2);
    expect(multiplier(50)).toBe(2);
  });
  it('combines base, speed and streak', () => {
    expect(pointsFor(0, 1)).toBe(200);
    expect(pointsFor(10, 1)).toBe(100);
    expect(pointsFor(2, 5)).toBe(252); // (100 + 80) * 1.4
    expect(pointsFor(3, 6)).toBe(255); // (100 + 70) * 1.5
    expect(pointsFor(0, 20)).toBe(400);
  });
});
