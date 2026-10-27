import { useState, type FormEvent } from 'react';
import { backend } from '../backend';
import { LOCAL_INVITE_DEFAULT } from '../backend/local';
import { validatePassword, validateUsername } from '../lib/username';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = username.trim();
    if (mode === 'signup') {
      const problem = validateUsername(name) ?? validatePassword(password);
      if (problem) return setError(problem);
      if (!invite.trim()) return setError('Enter the invite code you were given.');
    }
    setBusy(true);
    try {
      if (mode === 'login') await backend.signIn(name, password);
      else await backend.signUp(name, password, invite);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <h1>Geo Quiz</h1>
      <p className="lede">Countries, flags and capitals against the clock, with a leaderboard for the group.</p>
      <div className="card">
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')}>
            Log in
          </button>
          <button role="tab" aria-selected={mode === 'signup'} onClick={() => setMode('signup')}>
            Create account
          </button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="u">Username</label>
            <input
              id="u"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              required
            />
            {mode === 'signup' && <span className="hint">3–20 letters, numbers or underscores.</span>}
          </div>
          <div className="field">
            <label htmlFor="p">Password</label>
            <input
              id="p"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="i">Invite code</label>
              <input
                id="i"
                className="input"
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {backend.mode === 'local' && <span className="hint">Local mode: the invite code is “{LOCAL_INVITE_DEFAULT}” unless the admin changed it.</span>}
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit" disabled={busy} style={{ width: '100%', marginTop: 4 }}>
            {busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
