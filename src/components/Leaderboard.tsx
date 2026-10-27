import { useEffect, useState } from 'react';
import { backend, type ScoreRow } from '../backend';
import { QUIZ_BY_ID } from '../data/quizzes';
import { formatDate, formatNumber, formatTime } from '../lib/format';
import { useApp } from '../state';

export function Leaderboard({ quizId, refreshKey, highlightId }: { quizId: string; refreshKey: number; highlightId?: string | null }) {
  const { profile, settings } = useApp();
  const [rows, setRows] = useState<ScoreRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const quiz = QUIZ_BY_ID[quizId];
  const isCountries = quiz.kind === 'countries';

  useEffect(() => {
    let alive = true;
    setError(null);
    backend
      .getLeaderboard(quizId)
      .then((r) => alive && setRows(r))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [quizId, refreshKey, reload, settings]);

  const remove = async (row: ScoreRow) => {
    if (!window.confirm(`Delete ${row.username}'s score from ${formatDate(row.createdAt)}?`)) return;
    try {
      await backend.deleteScore(row.id);
      setReload((n) => n + 1);
    } catch (e) {
      window.alert((e as Error).message);
    }
  };

  return (
    <aside className="board" aria-label="Leaderboard">
      <h2>Leaderboard</h2>
      <div className="sub">
        {settings.leaderboardMode === 'best' ? 'Best score per player' : 'All attempts'} · top {settings.leaderboardSize}
      </div>
      {error && <p className="error">Couldn't load the leaderboard: {error}</p>}
      {!error && rows === null && <p className="empty">Loading…</p>}
      {rows && rows.length === 0 && <p className="empty">No scores yet. Be the first.</p>}
      {rows && rows.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th className="rank">#</th>
                <th>Player</th>
                {isCountries ? (
                  <>
                    <th className="r">Named</th>
                    <th className="r">Time</th>
                  </>
                ) : (
                  <>
                    <th className="r">Score</th>
                    <th className="r">Correct</th>
                    <th className="r" title="Best streak">Strk</th>
                    <th className="r" title="Time to answer everything">Done in</th>
                  </>
                )}
                <th className="r">Date</th>
                {profile?.isAdmin && <th aria-label="Delete" />}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={[r.userId === profile?.id ? 'me' : '', r.id === highlightId ? 'new' : ''].join(' ')}>
                  <td className="rank">
                    <span className="medal num">{i + 1}</span>
                  </td>
                  <td>{r.username}</td>
                  {isCountries ? (
                    <>
                      <td className={`r num ${r.completedAll ? 'done' : ''}`}>
                        {r.correct}/{r.total}
                      </td>
                      <td className="r num">{formatTime(r.timeMs, r.completedAll)}</td>
                    </>
                  ) : (
                    <>
                      <td className="r num">{formatNumber(r.score)}</td>
                      <td className={`r num ${r.completedAll ? 'done' : ''}`}>
                        {r.correct}/{r.total}
                      </td>
                      <td className="r num">{r.bestStreak}</td>
                      <td className="r num">{r.completedAll ? formatTime(r.timeMs) : '–'}</td>
                    </>
                  )}
                  <td className="r date">{formatDate(r.createdAt)}</td>
                  {profile?.isAdmin && (
                    <td>
                      <button className="del" onClick={() => remove(r)} aria-label={`Delete ${r.username}'s score`} title="Delete score">
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </aside>
  );
}
