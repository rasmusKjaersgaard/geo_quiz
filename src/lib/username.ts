import { env } from '../env';

export const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export function validateUsername(username: string): string | null {
  if (username.length < 3) return 'Use at least 3 characters.';
  if (username.length > 20) return 'Use at most 20 characters.';
  if (!USERNAME_RE.test(username)) return 'Use only letters, numbers and underscores.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'Use at least 6 characters.';
  return null;
}

/** Hidden email used for Supabase auth. Usernames are case-insensitive. */
export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${env.authEmailDomain}`;
}

export function isAdminName(username: string): boolean {
  return !!env.adminUsername && username.toLowerCase() === env.adminUsername.toLowerCase();
}
