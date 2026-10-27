/** 754_300 -> "12:34" ; with tenths -> "12:34.3" */
export function formatTime(ms: number, tenths = false): string {
  const totalTenths = Math.max(0, Math.floor(ms / 100));
  const total = Math.floor(totalTenths / 10);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const core = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  return tenths ? `${core}.${totalTenths % 10}` : core;
}

/** Countdown display: rounds up so the clock shows 0:00 only at the very end. */
export function formatCountdown(ms: number): string {
  return formatTime(Math.ceil(Math.max(0, ms) / 1000) * 1000);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' });
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** "12:30" or "750" -> seconds; null when invalid. */
export function parseDuration(text: string): number | null {
  const t = text.trim();
  const m = t.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  if (/^\d{1,5}$/.test(t)) return Number(t) * 60;
  return null;
}

export function durationText(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
