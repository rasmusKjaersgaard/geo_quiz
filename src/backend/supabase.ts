import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env';
import { bestPerUser } from '../lib/ranking';
import { usernameToEmail, validatePassword, validateUsername } from '../lib/username';
import { DEFAULT_SETTINGS, UserError, type Backend, type Profile, type ScoreInput, type ScoreRow, type Settings } from './types';

interface DbScore {
  id: string;
  user_id: string;
  username?: string | null;
  quiz_id: string;
  score: number;
  correct: number;
  total: number;
  best_streak: number;
  completed_all: boolean;
  time_ms: number;
  created_at: string;
}

const SCORE_COLUMNS = 'id, user_id, quiz_id, score, correct, total, best_streak, completed_all, time_ms, created_at';

function toRow(r: DbScore, username = ''): ScoreRow {
  return {
    id: r.id,
    userId: r.user_id,
    username: r.username ?? username,
    quizId: r.quiz_id,
    score: r.score,
    correct: r.correct,
    total: r.total,
    bestStreak: r.best_streak,
    completedAll: r.completed_all,
    timeMs: r.time_ms,
    createdAt: r.created_at,
  };
}

function fail(error: { message: string } | null, fallback = 'Something went wrong. Try again.'): void {
  if (!error) return;
  console.error(error);
  throw new UserError(error.message || fallback);
}

export class SupabaseBackend implements Backend {
  readonly mode = 'supabase' as const;
  private sb: SupabaseClient;
  private profile: Profile | null = null;
  private profileFor: string | null = null;

  constructor() {
    this.sb = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'geoquiz-auth' },
    });
  }

  private async userId(): Promise<string | null> {
    const { data } = await this.sb.auth.getSession();
    return data.session?.user.id ?? null;
  }

  async getProfile(): Promise<Profile | null> {
    const id = await this.userId();
    if (!id) {
      this.profile = this.profileFor = null;
      return null;
    }
    if (this.profile && this.profileFor === id) return this.profile;
    const { data, error } = await this.sb.from('profiles').select('id, username, is_admin').eq('id', id).maybeSingle();
    fail(error);
    if (!data) return null;
    this.profile = { id: data.id, username: data.username, isAdmin: data.is_admin };
    this.profileFor = id;
    return this.profile;
  }

  onAuthChange(cb: () => void) {
    // Defer: calling Supabase from inside this callback can deadlock the auth lock.
    const { data } = this.sb.auth.onAuthStateChange(() => setTimeout(cb, 0));
    return () => data.subscription.unsubscribe();
  }

  async signUp(username: string, password: string, inviteCode: string) {
    username = username.trim();
    const invalid = validateUsername(username) ?? validatePassword(password);
    if (invalid) throw new UserError(invalid);

    const { data: check, error: checkError } = await this.sb.rpc('check_signup', {
      p_username: username,
      p_invite_code: inviteCode.trim(),
    });
    fail(checkError);
    if (check === 'bad_invite') throw new UserError('That invite code is not right.');
    if (check === 'username_taken') throw new UserError('That username is taken.');
    if (check === 'invalid_username') throw new UserError('Use 3–20 letters, numbers or underscores.');

    const { data, error } = await this.sb.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: { data: { username, invite_code: inviteCode.trim() } },
    });
    if (error) {
      if (/already registered|already exists/i.test(error.message)) throw new UserError('That username is taken.');
      if (/database error/i.test(error.message)) throw new UserError('Sign-up was rejected. Check the invite code and username.');
      fail(error);
    }
    if (!data.session) {
      throw new UserError('Account created, but no session was returned. In Supabase, turn off "Confirm email" (see README).');
    }
  }

  async signIn(username: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email: usernameToEmail(username), password });
    if (error) {
      if (/invalid login credentials/i.test(error.message)) throw new UserError('Wrong username or password.');
      fail(error);
    }
  }

  async signOut() {
    await this.sb.auth.signOut({ scope: 'local' }); // keep other devices logged in
    this.profile = this.profileFor = null;
  }

  async getSettings(): Promise<Settings> {
    const { data, error } = await this.sb
      .from('settings')
      .select('time_limits, leaderboard_size, leaderboard_mode')
      .eq('id', 1)
      .maybeSingle();
    fail(error);
    if (!data) return DEFAULT_SETTINGS;
    return {
      timeLimits: (data.time_limits ?? {}) as Record<string, number>,
      leaderboardSize: data.leaderboard_size ?? DEFAULT_SETTINGS.leaderboardSize,
      leaderboardMode: data.leaderboard_mode === 'all' ? 'all' : 'best',
    };
  }

  async updateSettings(s: Settings) {
    const { data, error } = await this.sb
      .from('settings')
      .update({ time_limits: s.timeLimits, leaderboard_size: s.leaderboardSize, leaderboard_mode: s.leaderboardMode })
      .eq('id', 1)
      .select('id');
    fail(error);
    if (!data?.length) throw new UserError('Only the admin can change settings.');
  }

  async getInviteCode() {
    const { data, error } = await this.sb.from('settings_private').select('invite_code').eq('id', 1).maybeSingle();
    fail(error);
    return data?.invite_code ?? '';
  }

  async setInviteCode(code: string) {
    const { data, error } = await this.sb.from('settings_private').update({ invite_code: code.trim() }).eq('id', 1).select('id');
    fail(error);
    if (!data?.length) throw new UserError('Only the admin can change the invite code.');
  }

  async submitScore(input: ScoreInput): Promise<ScoreRow> {
    const profile = await this.getProfile();
    if (!profile) throw new UserError('Log in to save your score.');
    const { data, error } = await this.sb
      .from('scores')
      .insert({
        user_id: profile.id,
        quiz_id: input.quizId,
        score: input.score,
        correct: input.correct,
        total: input.total,
        best_streak: input.bestStreak,
        completed_all: input.completedAll,
        time_ms: Math.round(input.timeMs),
      })
      .select(SCORE_COLUMNS)
      .single();
    fail(error);
    return toRow(data as DbScore, profile.username);
  }

  async getLeaderboard(quizId: string) {
    const { data, error } = await this.sb.rpc('get_leaderboard', { p_quiz_id: quizId });
    fail(error);
    return ((data ?? []) as DbScore[]).map((r) => toRow(r));
  }

  async getRank(row: ScoreRow) {
    const { data, error } = await this.sb.rpc('get_rank', { p_score_id: row.id });
    fail(error);
    return Number(data ?? 0);
  }

  async getMyBests() {
    const id = await this.userId();
    const out: Record<string, ScoreRow> = {};
    if (!id) return out;
    const { data, error } = await this.sb.from('scores').select(SCORE_COLUMNS).eq('user_id', id).limit(5000);
    fail(error);
    const rows = ((data ?? []) as DbScore[]).map((r) => toRow(r));
    for (const q of new Set(rows.map((r) => r.quizId))) out[q] = bestPerUser(rows.filter((r) => r.quizId === q))[0];
    return out;
  }

  async deleteScore(id: string) {
    const { data, error } = await this.sb.from('scores').delete().eq('id', id).select('id');
    fail(error);
    if (!data?.length) throw new UserError('Only the admin can delete scores.');
  }
}
