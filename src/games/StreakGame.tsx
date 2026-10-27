import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { COUNTRY_BY_ID } from '../data/countries';
import { QUIZ_BY_ID } from '../data/quizzes';
import { asset } from '../env';
import { formatNumber } from '../lib/format';
import { AnswerIndex } from '../lib/matcher';
import { multiplier } from '../lib/scoring';
import { initStreak, skip, submitAnswer, typeAnswer, type StreakState } from '../lib/streakGame';
import { AnswerInput, Countdown, GameButton, useGameClock, type GameProps } from '../components/gameKit';
import { Silhouette } from '../components/Silhouette';

const flagUrl = (id: string) => asset(`flags/${COUNTRY_BY_ID[id].flag}.svg`);

/** Flags and Capitals quizzes. */
export function StreakGame({ quizId, limitSec, finished, onFinish }: GameProps) {
  const quiz = QUIZ_BY_ID[quizId];
  const mode = quiz.mode ?? 'flags';
  const index = useMemo(
    () => new AnswerIndex(quiz.countryIds.map((id) => COUNTRY_BY_ID[id]), mode === 'flags' ? 'country' : 'capital'),
    [quiz, mode],
  );
  const { start, elapsed } = useGameClock(limitSec);
  const [state, setState] = useState<StreakState>(() => initStreak(quiz.countryIds, performance.now()));
  const stateRef = useRef(state);
  stateRef.current = state;
  const doneRef = useRef(false);
  const total = quiz.countryIds.length;
  const current = state.queue[0];

  const finish = (s: StreakState) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onFinish({
      score: {
        quizId,
        score: s.score,
        correct: s.correctIds.length,
        total,
        bestStreak: s.bestStreak,
        completedAll: s.queue.length === 0,
        timeMs: Math.round(elapsed()),
      },
      missed: s.queue.slice(),
    });
  };

  const update = (next: StreakState) => {
    setState(next);
    stateRef.current = next;
    if (next.queue.length === 0) finish(next);
  };

  const onChange = (text: string) => {
    if (finished) return;
    update(typeAnswer(stateRef.current, text, performance.now(), index));
  };

  const doSkip = () => {
    if (finished) return;
    update(skip(stateRef.current, performance.now()));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (finished) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      update(submitAnswer(stateRef.current, performance.now(), index));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      doSkip();
    }
  };

  // Preload the next few flags so they appear instantly.
  useEffect(() => {
    if (mode !== 'flags') return;
    for (const id of state.queue.slice(1, 4)) {
      const img = new Image();
      img.src = flagUrl(id);
    }
  }, [mode, state.queue]);

  const ev = state.event;
  const nextMult = multiplier(state.streak + 1);

  return (
    <div>
      <div className="hud">
        <div className="stat score">
          <div className="label">Score</div>
          <div className="value num">{formatNumber(state.score)}</div>
          {ev?.type === 'correct' && (
            <div className="pop num" key={ev.seq}>
              +{ev.points}
            </div>
          )}
        </div>
        <div className="stat">
          <div className="label">Streak</div>
          <div className="value num">
            {state.streak}
            <span className={`mult ${nextMult > 1 ? 'hot' : ''}`} title="Multiplier for your next answer">
              ×{nextMult.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="stat">
          <div className="label">Best</div>
          <div className="value num">{state.bestStreak}</div>
        </div>
        <div className="stat">
          <div className="label">Correct</div>
          <div className="value num">
            {state.correctIds.length}
            <small style={{ fontSize: 16, color: 'var(--muted)' }}>/{total}</small>
          </div>
        </div>
      </div>

      {!finished && current && (
        <div className="prompt" key={`${current}-${ev?.type === 'skip' ? ev.seq : ''}`}>
          {mode === 'flags' ? (
            <img className="flag prompt-enter" src={flagUrl(current)} alt="Flag to identify" draggable={false} />
          ) : (
            <div className="country prompt-enter">
              <Silhouette mapId={COUNTRY_BY_ID[current].mapId} label={COUNTRY_BY_ID[current].name} />
              <h2>{COUNTRY_BY_ID[current].name}</h2>
            </div>
          )}
        </div>
      )}

      <div className="gamebar">
        <AnswerInput
          value={state.input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={finished}
          placeholder={finished ? 'Game over' : mode === 'flags' ? 'Which country?' : 'Capital city…'}
          label={mode === 'flags' ? 'Country for this flag' : 'Capital of this country'}
          flash={ev?.type === 'wrong' ? 'wrong' : ev?.type === 'correct' ? 'right' : null}
          flashSeq={ev?.seq}
        />
        <Countdown start={start} limitSec={limitSec} running={!finished} onExpire={() => finish(stateRef.current)} />
        {!finished && (
          <>
            <GameButton onClick={doSkip}>Skip</GameButton>
            <GameButton onClick={() => finish(stateRef.current)}>Give up</GameButton>
          </>
        )}
      </div>
      {!finished && (
        <p className="keys">
          Answers are checked as you type. <kbd>Enter</kbd> checks a short answer{mode === 'flags' ? ' (Niger vs Nigeria)' : ''}. <kbd>Tab</kbd> skips.
        </p>
      )}
    </div>
  );
}
