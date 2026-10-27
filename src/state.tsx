import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { backend, DEFAULT_SETTINGS, type Profile, type Settings } from './backend';
import { QUIZ_BY_ID } from './data/quizzes';

interface AppState {
  profile: Profile | null;
  loading: boolean;
  settings: Settings;
  refreshSettings: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  const refreshProfile = useCallback(async () => {
    try {
      setProfile(await backend.getProfile());
    } catch (e) {
      console.error(e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      setSettings(await backend.getSettings());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
    return backend.onAuthChange(() => {
      refreshProfile();
    });
  }, [refreshProfile]);

  useEffect(() => {
    if (profile) refreshSettings();
  }, [profile, refreshSettings]);

  return <Ctx.Provider value={{ profile, loading, settings, refreshSettings, refreshProfile }}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}

/** Time limit in seconds for a quiz (admin setting, else the quiz default). */
export function timeLimitOf(settings: Settings, quizId: string): number {
  const v = settings.timeLimits[quizId];
  return typeof v === 'number' && v > 0 ? v : QUIZ_BY_ID[quizId]?.defaultTimeSec ?? 600;
}
