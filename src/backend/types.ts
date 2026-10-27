export interface Profile {
  id: string;
  username: string;
  isAdmin: boolean;
}

export type LeaderboardMode = 'best' | 'all';

export interface Settings {
  /** Seconds per quiz id. Missing entries fall back to the quiz default. */
  timeLimits: Record<string, number>;
  leaderboardSize: number;
  leaderboardMode: LeaderboardMode;
}

export interface ScoreInput {
  quizId: string;
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  completedAll: boolean;
  timeMs: number;
}

export interface ScoreRow extends ScoreInput {
  id: string;
  userId: string;
  username: string;
  createdAt: string;
}

export interface Backend {
  readonly mode: 'supabase' | 'local';
  getProfile(): Promise<Profile | null>;
  onAuthChange(cb: () => void): () => void;
  signUp(username: string, password: string, inviteCode: string): Promise<void>;
  signIn(username: string, password: string): Promise<void>;
  signOut(): Promise<void>;

  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<void>;
  getInviteCode(): Promise<string>;
  setInviteCode(code: string): Promise<void>;

  submitScore(input: ScoreInput): Promise<ScoreRow>;
  /** Ranked, deduplicated (in "best" mode) and cut to the leaderboard size. */
  getLeaderboard(quizId: string): Promise<ScoreRow[]>;
  /** 1-based position this attempt holds on the leaderboard. */
  getRank(row: ScoreRow): Promise<number>;
  /** The signed-in user's best attempt per quiz id. */
  getMyBests(): Promise<Record<string, ScoreRow>>;
  deleteScore(id: string): Promise<void>;
}

export const DEFAULT_SETTINGS: Settings = {
  timeLimits: {},
  leaderboardSize: 25,
  leaderboardMode: 'best',
};

export class UserError extends Error {}
