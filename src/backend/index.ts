import { useSupabase } from '../env';
import { LocalBackend } from './local';
import { SupabaseBackend } from './supabase';
import type { Backend } from './types';

export const backend: Backend = useSupabase ? new SupabaseBackend() : new LocalBackend();
export * from './types';
