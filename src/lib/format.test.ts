import { describe, expect, it } from 'vitest';
import { durationText, formatCountdown, formatTime, parseDuration } from './format';

describe('format', () => {
  it('formats times', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(754_300)).toBe('12:34');
    expect(formatTime(754_300, true)).toBe('12:34.3');
    expect(formatTime(3_725_000)).toBe('1:02:05');
    expect(formatCountdown(59_001)).toBe('1:00');
    expect(formatCountdown(0)).toBe('0:00');
  });
  it('parses durations as m:ss or minutes', () => {
    expect(parseDuration('12:30')).toBe(750);
    expect(parseDuration('0:45')).toBe(45);
    expect(parseDuration('15')).toBe(900);
    expect(parseDuration('1:75')).toBeNull();
    expect(parseDuration('abc')).toBeNull();
    expect(durationText(750)).toBe('12:30');
  });
});
