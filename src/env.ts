// All build-time configuration in one place.
export const env = {
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL ?? '').trim(),
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim(),
  adminUsername: (import.meta.env.VITE_ADMIN_USERNAME ?? '').trim(),
  authEmailDomain: (import.meta.env.VITE_AUTH_EMAIL_DOMAIN ?? '').trim() || 'geoquiz.local',
  baseUrl: import.meta.env.BASE_URL ?? './',
};

/** Supabase is used when both values are set; otherwise the app runs in local mode. */
export const useSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

/** Resolve a file in /public relative to the deployed base path. */
export function asset(path: string): string {
  const base = env.baseUrl.endsWith('/') ? env.baseUrl : env.baseUrl + '/';
  return base + path.replace(/^\//, '');
}
