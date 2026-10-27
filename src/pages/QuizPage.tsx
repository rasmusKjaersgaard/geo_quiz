import { useEffect, useState } from 'react';
import { backend, type ScoreRow } from '../backend';
import { COUNTRY_BY_ID } from '../data/countries';
import { QUIZ_BY_ID } from '../data/quizzes';
import { asset } from '../env';
import { durationText, formatNumber, formatTime } from '../lib/format';
import { timeLimitOf, useApp } from '../state';
import { CountriesGame } from '../games/CountriesGame';
import { StreakGame } from '../games/StreakGame';
import { Leaderboard } from '../components/Leaderboard';
import type { GameResult } from '../components/gameKit';

type Phase = 'ready' | 'playing' | 'done';

export function QuizPage({ quizId }: { quizId: string }) {
  const quiz = QUIZ_BY_ID[quizId];
  const { settings } = useApp();
  const [phase, setPhase] = useState<Phase>('ready');
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [saved, setSaved] = useState<ScoreRow | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [boardKey, setBoardKey] = useState(0);

  // Reset when navigating between quizzes.
  useEffect(() => {
    setPhase('ready');
    setResult(null);
    setSaved(null);
    setRank(null);
  }, [quizId]);

  if (!quiz) {
    return (
      <div className="card">
        <p>That quiz doesn't exist.</p>
        <a href="#/">Back to all quizzes</a>
      </div>
    );
  }

  const limitSec = timeLimitOf(settings, quizId);

  const start = () => {
    setResult(null);
    setSaved(null);
    setRank(null);
    setSaveError(null);
    setRun((n) => n + 1);
    setPhase('playing');
    window.scrollTo({ top: 0 });
  };

  const save = async (r: GameResult) => {
    setSaveError(null);
    if (r.score.correct === 0) return; // nothing worth a leaderboard row
    try {
      const row = await backend.submitScore(r.score);
      setSaved(row);
      setBoardKey((k) => k + 1);
      setRank(await backend.getRank(row));
    } catch (e) {
      setSaveError((e as Error).message);
    }
  };

  const onFinish = (r: GameResult) => {
    setResult(r);
    setPhase('done');
    save(r);
  };

  const Game = quiz.kind === 'countries' ? CountriesGame : StreakGame;

  return (
    <div>
      <div className="quiz-title">
        <h1>{quiz.title}</h1>
        <a href="#/">All quizzes</a>
      </div>
      <div className="quiz-layout">
        <div>
          {phase === 'ready' && (
            <div className="card start">
              <h2>{quiz.countryIds.length} {quiz.mode === 'capitals' ? 'capitals' : quiz.mode === 'flags' ? 'flags' : 'countries'}</h2>
              <p>{quiz.blurb}</p>
              <button className="btn primary big" onClick={start} autoFocus>
                Start quiz
              </button>
              <div className="limit num">Time limit {durationText(limitSec)}</div>
            </div>
          )}

          {phase === 'done' && result && (
            <Results quizId={quizId} result={result} saved={saved} rank={rank} saveError={saveError} onRetrySave={() => save(result)} onPlayAgain={start} />
          )}

          {phase !== 'ready' && <Game key={run} quizId={quizId} limitSec={limitSec} finished={phase === 'done'} onFinish={onFinish} />}
        </div>
        <Leaderboard quizId={quizId} refreshKey={boardKey} highlightId={saved?.id} />
      </div>
    </div>
  );
}

function Results(props: {
  quizId: string;
  result: GameResult;
  saved: ScoreRow | null;
  rank: number | null;
  saveError: string | null;
  onRetrySave: () => void;
  onPlayAgain: () => void;
}) {
  const { result, saved, rank, saveError } = props;
  const quiz = QUIZ_BY_ID[props.quizId];
  const s = result.score;
  const isCountries = quiz.kind === 'countries';

  return (
    <section className="card results" aria-live="polite">
      <div className="results-head">
        <div>
          <div className="headline num">{isCountries ? `${s.correct}/${s.total}` : formatNumber(s.score)}</div>
          <div style={{ color: 'var(--muted)' }}>
            {isCountries ? (s.completedAll ? 'Every country named' : 'countries named') : s.completedAll ? 'points, everything answered' : 'points'}
          </div>
        </div>
        <div className="facts">
          <div>
            Rank<b className="num">{rank ? `#${rank}` : s.correct === 0 ? '–' : saved ? '…' : '–'}</b>
          </div>
          {!isCountries && (
            <>
              <div>
                Correct<b className="num">{s.correct}/{s.total}</b>
              </div>
              <div>
                Best streak<b className="num">{s.bestStreak}</b>
              </div>
            </>
          )}
          <div>
            Time<b className="num">{formatTime(s.timeMs, s.completedAll)}</b>
          </div>
        </div>
        <div className="actions">
          <button className="btn primary big" onClick={props.onPlayAgain} autoFocus>
            Play again
          </button>
        </div>
      </div>

      {s.correct === 0 && <p className="hint" style={{ color: 'var(--muted)' }}>Scores of zero aren't saved.</p>}
      {saveError && (
        <p className="error">
          Your score wasn't saved: {saveError}{' '}
          <button className="btn" onClick={props.onRetrySave}>
            Try again
          </button>
        </p>
      )}

      {result.missed.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: 18 }}>
            Missed ({result.missed.length}){isCountries ? ', shown in red below' : ''}
          </h3>
          {!isCountries && (
            <div className="missed-list">
              {result.missed.map((id) => {
                const c = COUNTRY_BY_ID[id];
                return (
                  <div className="missed-item" key={id}>
                    {quiz.mode === 'flags' ? (
                      <>
                        <img src={asset(`flags/${c.flag}.svg`)} alt="" loading="lazy" />
                        <span className="cap">{c.name}</span>
                      </>
                    ) : (
                      <span>
                        {c.name}: <span className="cap">{c.capitals.join(' / ')}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
