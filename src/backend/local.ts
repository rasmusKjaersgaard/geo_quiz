// "Local mode": everything lives in this browser's localStorage.
// Used when no Supabase URL/key is configured - handy for development and for
// trying the quizzes before the database is set up. Not for real use.
import { bestPerUser, rankLeaderboard, rankOf } from '../lib/ranking';
import { isAdminName, validatePassword, validateUsername } from '../lib/username';
import { DEFAULT_SETTINGS, UserError, type Backend, type Profile, type ScoreInput, type ScoreRow, type Settings } from './types';

interface LocalUser {
  id: string;
  username: string;
  password: string;
}

export const LOCAL_INVITE_DEFAULT = 'letmein';
const K = {
  users: 'geoquiz.local.users',
  session: 'geoquiz.local.session',
  scores: 'geoquiz.local.scores',
  settings: 'geoquiz.local.settings',
  invite: 'geoquiz.local.invite',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export class LocalBackend implements Backend {
  readonly mode = 'local' as const;
  private listeners = new Set<() => void>();

  private users(): LocalUser[] {
    return read<LocalUser[]>(K.users, []);
  }
  private me(): LocalUser | null {
    const id = read<string | null>(K.session, null);
    return this.users().find((u) => u.id === id) ?? null;
  }
  private emit() {
    this.listeners.forEach((cb) => cb());
  }

  async getProfile(): Promise<Profile | null> {
    const u = this.me();
    return u ? { id: u.id, username: u.username, isAdmin: isAdminName(u.username) } : null;
  }
  onAuthChange(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }
  async signUp(username: string, password: string, inviteCode: string) {
    const err = validateUsername(username) ?? validatePassword(password);
    if (err) throw new UserError(err);
    if (inviteCode.trim() !== (await this.getInviteCode())) throw new UserError('That invite code is not right.');
    const users = this.users();
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) throw new UserError('That username is taken.');
    const user = { id: uid(), username, password };
    write(K.users, [...users, user]);
    write(K.session, user.id);
    this.emit();
  }
  async signIn(username: string, password: string) {
    const user = this.users().find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user || user.password !== password) throw new UserError('Wrong username or password.');
    write(K.session, user.id);
    this.emit();
  }
  async signOut() {
    write(K.session, null);
    this.emit();
  }

  async getSettings(): Promise<Settings> {
    return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(K.settings, {}) };
  }
  async updateSettings(settings: Settings) {
    this.requireAdmin();
    write(K.settings, settings);
  }
  async getInviteCode() {
    return read<string>(K.invite, LOCAL_INVITE_DEFAULT);
  }
  async setInviteCode(code: string) {
    this.requireAdmin();
    write(K.invite, code.trim());
  }
  private requireAdmin() {
    const u = this.me();
    if (!u || !isAdminName(u.username)) throw new UserError('Only the admin can change settings.');
  }

  private scores(): ScoreRow[] {
    return read<ScoreRow[]>(K.scores, []);
  }
  async submitScore(input: ScoreInput): Promise<ScoreRow> {
    const u = this.me();
    if (!u) throw new UserError('Log in to save your score.');
    const row: ScoreRow = { ...input, id: uid(), userId: u.id, username: u.username, createdAt: new Date().toISOString() };
    write(K.scores, [...this.scores(), row]);
    return row;
  }
  async getLeaderboard(quizId: string) {
    const s = await this.getSettings();
    return rankLeaderboard(this.scores().filter((r) => r.quizId === quizId), s.leaderboardMode, s.leaderboardSize);
  }
  async getRank(row: ScoreRow) {
    const s = await this.getSettings();
    return rankOf(row, this.scores().filter((r) => r.quizId === row.quizId), s.leaderboardMode);
  }
  async getMyBests() {
    const u = this.me();
    const out: Record<string, ScoreRow> = {};
    if (!u) return out;
    const mine = this.scores().filter((r) => r.userId === u.id);
    const quizIds = new Set(mine.map((r) => r.quizId));
    for (const q of quizIds) out[q] = bestPerUser(mine.filter((r) => r.quizId === q))[0];
    return out;
  }
  async deleteScore(id: string) {
    this.requireAdmin();
    write(K.scores, this.scores().filter((r) => r.id !== id));
  }
}
