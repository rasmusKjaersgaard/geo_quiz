// Declared by hand (instead of `vite/client`) so the app type-checks on its own.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_ADMIN_USERNAME?: string;
  readonly VITE_AUTH_EMAIL_DOMAIN?: string;
  readonly BASE_URL?: string;
  readonly DEV?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css';
