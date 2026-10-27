import { useEffect, useState } from 'react';
import { backend, type LeaderboardMode } from '../backend';
import { QUIZZES } from '../data/quizzes';
import { durationText, parseDuration } from '../lib/format';
import { timeLimitOf, useApp } from '../state';

const SIZES = [10, 25, 50, 100];

export function AdminPage() {
  const { profile, settings, refreshSettings } = useApp();
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [size, setSize] = useState(settings.leaderboardSize);
  const [mode, setMode] = useState<LeaderboardMode>(settings.leaderboardMode);
  const [invite, setInvite] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [inviteMsg, setInviteMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setLimits(Object.fromEntries(QUIZZES.map((q) => [q.id, durationText(timeLimitOf(settings, q.id))])));
    setSize(settings.leaderboardSize);
    setMode(settings.leaderboardMode);
  }, [settings]);

  useEffect(() => {
    if (profile?.isAdmin) backend.getInviteCode().then(setInvite).catch((e: Error) => setInviteMsg({ ok: false, text: e.message }));
  }, [profile]);

  if (!profile?.isAdmin) {
    return (
      <div className="card">
        <p>Only the admin can open settings.</p>
        <a href="#/">Back to all quizzes</a>
      </div>
    );
  }

  const save = async () => {
    setMsg(null);
    const timeLimits: Record<string, number> = {};
    for (const q of QUIZZES) {
      const sec = parseDuration(limits[q.id] ?? '');
      if (sec === null || sec < 10) return setMsg({ ok: false, text: `“${q.title}” needs a time like 12:30 (at least 0:10).` });
      timeLimits[q.id] = sec;
    }
    try {
      await backend.updateSettings({ timeLimits, leaderboardSize: size, leaderboardMode: mode });
      await refreshSettings();
      setMsg({ ok: true, text: 'Settings saved.' });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  };

  const saveInvite = async () => {
    setInviteMsg(null);
    if (invite.trim().length < 3) return setInviteMsg({ ok: false, text: 'Use at least 3 characters.' });
    try {
      await backend.setInviteCode(invite);
      setInviteMsg({ ok: true, text: 'Invite code saved.' });
    } catch (e) {
      setInviteMsg({ ok: false, text: (e as Error).message });
    }
  };

  return (
    <div className="admin">
      <h1>Settings</h1>

      <section className="card">
        <h2>Time limits</h2>
        <p className="desc">Minutes and seconds per quiz, e.g. 12:30.</p>
        <div className="limits">
          {QUIZZES.map((q) => (
            <label key={q.id} style={{ display: 'contents' }}>
              <span>{q.title}</span>
              <input className="input" value={limits[q.id] ?? ''} onChange={(e) => setLimits({ ...limits, [q.id]: e.target.value })} inputMode="numeric" />
            </label>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Leaderboards</h2>
        <p className="desc">Applies to every quiz.</p>
        <div className="field">
          <label htmlFor="size">Entries shown</label>
          <select id="size" className="input" value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ maxWidth: 160 }}>
            {SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Show</label>
          <div className="radio-row">
            <label>
              <input type="radio" name="mode" checked={mode === 'best'} onChange={() => setMode('best')} /> Best score per player
            </label>
            <label>
              <input type="radio" name="mode" checked={mode === 'all'} onChange={() => setMode('all')} /> All attempts
            </label>
          </div>
        </div>
        <div className="save-row">
          <button className="btn primary" onClick={save}>
            Save settings
          </button>
          {msg && <span className={msg.ok ? 'ok' : 'error'}>{msg.text}</span>}
        </div>
      </section>

      <section className="card">
        <h2>Invite code</h2>
        <p className="desc">New players need this code to create an account. Changing it doesn't affect existing accounts.</p>
        <div className="field">
          <label htmlFor="invite">Code</label>
          <input id="invite" className="input" value={invite} onChange={(e) => setInvite(e.target.value)} autoComplete="off" style={{ maxWidth: 320 }} />
        </div>
        <div className="save-row">
          <button className="btn primary" onClick={saveInvite}>
            Save invite code
          </button>
          {inviteMsg && <span className={inviteMsg.ok ? 'ok' : 'error'}>{inviteMsg.text}</span>}
        </div>
      </section>
    </div>
  );
}
