import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { COUNTRY_BY_ID } from '../data/countries';
import { PEOPLE, personAnswers } from '../data/people';
import { QUIZ_BY_ID } from '../data/quizzes';
import { asset } from '../env';
import { formatNumber } from '../lib/format';
import { AnswerIndex } from '../lib/matcher';
import { multiplier } from '../lib/scoring';
import { initStreak, skip, submitAnswer, typeAnswer, type StreakState } from '../lib/streakGame';
import { AnswerInput, Countdown, GameButton, useGameClock, type GameProps } from '../components/gameKit';
import { Silhouette } from '../components/Silhouette';
import { MapView, type MapStatus } from '../components/MapView';
import { useApp } from '../state';

const flagUrl = (id: string) => asset(`flags/${COUNTRY_BY_ID[id].flag}.svg`);

// Every listed person's name counts as an answer (so typing someone without a
// photo yet is still marked wrong), but only people with photos are asked.
const PEOPLE_INDEX = new AnswerIndex(PEOPLE.map((p) => ({ id: p.id, answers: personAnswers(p) })));

/** Flags, Capitals and Danish Actors quizzes. */
export function StreakGame({ quizId, itemIds, photos, limitSec, finished, onFinish }: GameProps) {
  const quiz = QUIZ_BY_ID[quizId];
  const mode = quiz.mode ?? 'flags';
  const [ids] = useState(() => itemIds ?? quiz.itemIds);
  const index = useMemo(
    () => (mode === 'people' ? PEOPLE_INDEX : new AnswerIndex(quiz.itemIds.map((id) => COUNTRY_BY_ID[id]), mode === 'flags' ? 'country' : 'capital')),
    [quiz, mode],
  );
  const { start, elapsed } = useGameClock(limitSec);
  const [state, setState] = useState<StreakState>(() => initStreak(ids, performance.now()));
  const stateRef = useRef(state);
  stateRef.current = state;
  const doneRef = useRef(false);
  const total = ids.length;
  const current = state.queue[0];
  // Capitals can show the country on a map instead of its outline (admin setting,
  // read once when the game starts).
  const { settings } = useApp();
  const [mapPrompt] = useState(() => mode === 'capitals' && settings.capitalsPrompt === 'map');
  const activeMapIds = useMemo(() => new Set(mapPrompt ? ids.map((id) => COUNTRY_BY_ID[id].mapId) : []), [mapPrompt, ids]);
  const missedAtEnd = finished ? state.queue : null;
  const mapStatus = useMemo(() => {
    const st: Record<string, MapStatus> = {};
    if (!mapPrompt) return st;
    for (const id of state.correctIds) st[COUNTRY_BY_ID[id].mapId] = 'found';
    for (const id of missedAtEnd ?? []) st[COUNTRY_BY_ID[id].mapId] = 'missed';
    return st;
  }, [mapPrompt, state.correctIds, missedAtEnd]);

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

  // Preload the next few flags/photos so they appear instantly.
  useEffect(() => {
    if (mode !== 'flags' && mode !== 'people') return;
    for (const id of state.queue.slice(1, 4)) {
      const src = mode === 'flags' ? flagUrl(id) : photos?.[id];
      if (!src) continue;
      const img = new Image();
      img.src = src;
    }
  }, [mode, state.queue, photos]);

  const ev = state.event;
  const nextMult = multiplier(state.streak + 1);

  const answerBar = (
    <div className="gamebar">
      <AnswerInput
        value={state.input}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={finished}
        placeholder={finished ? 'Game over' : mode === 'flags' ? 'Which country?' : mode === 'people' ? 'Who is this?' : 'Capital city…'}
        label={mode === 'flags' ? 'Country for this flag' : mode === 'people' ? 'Name of the person in the photo' : 'Capital of this country'}
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
  );

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

      {/* Map mode: the answer box goes above the map so it stays on screen. */}
      {mapPrompt && answerBar}
      {mapPrompt && (
        <div className="prompt map-prompt">
          {!finished && current && (
            <h2 className="prompt-enter" key={`${current}-${ev?.type === 'skip' ? ev.seq : ''}`}>
              {COUNTRY_BY_ID[current].name}
            </h2>
          )}
          <MapView
            view={quiz.continent ?? 'world'}
            status={mapStatus}
            activeMapIds={activeMapIds}
            currentMapId={!finished && current ? COUNTRY_BY_ID[current].mapId : null}
            flashMapId={ev?.type === 'correct' ? COUNTRY_BY_ID[ev.id].mapId : null}
          />
        </div>
      )}

      {!mapPrompt && !finished && current && (
        <div className="prompt" key={`${current}-${ev?.type === 'skip' ? ev.seq : ''}`}>
          {mode === 'flags' ? (
            <img className="flag prompt-enter" src={flagUrl(current)} alt="Flag to identify" draggable={false} />
          ) : mode === 'people' ? (
            <img className="person prompt-enter" src={photos?.[current]} alt="Who is this?" draggable={false} />
          ) : (
            <div className="country prompt-enter">
              <Silhouette mapId={COUNTRY_BY_ID[current].mapId} label={COUNTRY_BY_ID[current].name} />
              <h2>{COUNTRY_BY_ID[current].name}</h2>
            </div>
          )}
        </div>
      )}

      {!mapPrompt && answerBar}
      {!finished && (
        <p className="keys">
          Answers are checked as you type. <kbd>Enter</kbd> checks a short answer{mode === 'flags' ? ' (Niger vs Nigeria)' : ''}. <kbd>Tab</kbd> skips.
        </p>
      )}
    </div>
  );
}
