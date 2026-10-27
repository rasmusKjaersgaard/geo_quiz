import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ButtonHTMLAttributes, type KeyboardEvent } from 'react';
import type { ScoreInput } from '../backend';
import { formatCountdown } from '../lib/format';

export interface GameResult {
  score: ScoreInput;
  /** Country ids that were not answered. */
  missed: string[];
}

export interface GameProps {
  quizId: string;
  limitSec: number;
  finished: boolean;
  onFinish: (result: GameResult) => void;
}

/** Start time of the current game; `elapsed()` gives exact ms, capped at the limit. */
export function useGameClock(limitSec: number) {
  const startRef = useRef(performance.now());
  const elapsed = useCallback(() => Math.min(performance.now() - startRef.current, limitSec * 1000), [limitSec]);
  return { start: startRef.current, elapsed };
}

/** Ticking countdown (re-renders only itself). Calls onExpire once at zero. */
export function Countdown({ start, limitSec, running, onExpire }: { start: number; limitSec: number; running: boolean; onExpire: () => void }) {
  const [now, setNow] = useState(() => performance.now());
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;
  const firedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      const n = performance.now();
      setNow(n);
      if (!firedRef.current && n - start >= limitSec * 1000) {
        firedRef.current = true;
        expireRef.current();
      }
    }, 100);
    return () => window.clearInterval(t);
  }, [running, limitSec, start]);

  const remainingMs = Math.max(0, limitSec * 1000 - (now - start));
  return (
    <div className={`timer num ${remainingMs < 30_000 ? 'low' : ''}`} role="timer" aria-label="Time left">
      {formatCountdown(remainingMs)}
    </div>
  );
}

export interface AnswerInputHandle {
  focus: () => void;
}

interface AnswerInputProps {
  value: string;
  onChange: (text: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  flash?: 'wrong' | 'right' | null;
  flashSeq?: number;
  label: string;
}

/**
 * The answer box: no autocomplete/autocorrect, and it keeps focus while the
 * game runs (taps on the map or buttons don't close the mobile keyboard).
 */
export const AnswerInput = forwardRef<AnswerInputHandle, AnswerInputProps>(function AnswerInput(
  { value, onChange, onKeyDown, disabled, placeholder, flash, flashSeq, label },
  ref,
) {
  const el = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => el.current?.focus({ preventScroll: true }) }), []);

  useEffect(() => {
    if (!disabled) el.current?.focus({ preventScroll: true });
  }, [disabled]);

  // Restart the flash animation on every event.
  const [anim, setAnim] = useState<string>('');
  useEffect(() => {
    if (!flash) return;
    setAnim('');
    const r = requestAnimationFrame(() => setAnim(flash === 'wrong' ? 'flash-wrong' : 'flash-right'));
    return () => cancelAnimationFrame(r);
  }, [flash, flashSeq]);

  return (
    <input
      ref={el}
      className={`answer ${anim}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={() => {
        if (disabled) return;
        window.setTimeout(() => {
          const a = document.activeElement;
          if (a && a !== document.body && a.tagName.match(/INPUT|SELECT|TEXTAREA/)) return;
          el.current?.focus({ preventScroll: true });
        }, 0);
      }}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={label}
      type="text"
      inputMode="text"
      enterKeyHint="go"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      data-lpignore="true"
      data-1p-ignore="true"
    />
  );
});

/** Buttons that don't steal focus from the answer box. */
export function GameButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} onPointerDown={(e) => e.preventDefault()} className={`btn ${props.className ?? ''}`} />;
}
