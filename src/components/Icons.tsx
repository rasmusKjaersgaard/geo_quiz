// Small inline icons (no icon font, no network).
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconSun = () => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const IconMoon = () => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);
export const IconPlus = () => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconMinus = () => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden>
    <path d="M5 12h14" />
  </svg>
);
export const IconReset = () => (
  <svg viewBox="0 0 24 24" {...base} aria-hidden>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

/** The logo: a globe with a single answered country. */
export const Logo = () => (
  <svg viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="16" r="14" fill="var(--sea)" stroke="var(--ink)" strokeWidth="2" />
    <path d="M6 12c3-1 5 1 7 0s3-4 6-3 4 3 7 2" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M13 17c2-1 4 0 5 2s0 4-2 5-4-1-4-3 0-3 1-4z" fill="var(--found)" />
  </svg>
);

/** Quiz-card glyphs. */
export const GlyphGlobe = () => (
  <svg viewBox="0 0 44 44" className="glyph" aria-hidden>
    <circle cx="22" cy="22" r="19" fill="var(--sea)" />
    <path d="M9 16c5-2 8 2 12 0s5-6 9-4 5 4 6 3M8 27c4 1 6-2 10 0s4 6 8 5 6-4 10-3" fill="none" stroke="var(--found)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
export const GlyphFlag = () => (
  <svg viewBox="0 0 44 44" className="glyph" aria-hidden>
    <path d="M10 6v34" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
    <path d="M12 8h22l-5 7 5 7H12z" fill="var(--missed)" />
    <path d="M12 8h22l-5 7H12z" fill="var(--accent)" />
  </svg>
);
export const GlyphCapital = () => (
  <svg viewBox="0 0 44 44" className="glyph" aria-hidden>
    <path d="M22 4c-6 0-11 5-11 11 0 9 11 23 11 23s11-14 11-23c0-6-5-11-11-11z" fill="var(--ink)" />
    <path d="M22 9l1.8 3.8 4.2.5-3.1 2.9.8 4.1-3.7-2.1-3.7 2.1.8-4.1-3.1-2.9 4.2-.5z" fill="var(--accent)" />
  </svg>
);
