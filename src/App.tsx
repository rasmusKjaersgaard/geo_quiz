import { backend } from './backend';
import { Logo, IconMoon, IconSun } from './components/Icons';
import { navigate, parseRoute, useRoute } from './router';
import { useApp } from './state';
import { useTheme } from './theme';
import { AdminPage } from './pages/AdminPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { QuizPage } from './pages/QuizPage';

export function App() {
  const { profile, loading } = useApp();
  const route = parseRoute(useRoute());
  const [theme, toggleTheme] = useTheme();

  let page;
  if (loading) page = null;
  else if (!profile) page = <LoginPage />;
  else if (route.name === 'quiz') page = <QuizPage quizId={route.quizId} />;
  else if (route.name === 'admin') page = <AdminPage />;
  else page = <HomePage />;

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">
          <Logo />
          Geo Quiz
        </a>
        <span className="spacer" />
        {profile && (
          <>
            <span className="who">{profile.username}</span>
            {profile.isAdmin && (
              <a className="btn ghost" href="#/admin">
                Settings
              </a>
            )}
            <button className="btn ghost" onClick={() => {
                navigate('/');
                backend.signOut();
              }}>
              Log out
            </button>
          </>
        )}
        <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
      </header>
      <main>
        {backend.mode === 'local' && (
          <div className="banner">
            Local mode: accounts and scores are saved in this browser only. Add your Supabase keys to share leaderboards (see README).
          </div>
        )}
        {page}
      </main>
    </div>
  );
}
