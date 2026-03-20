import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import supabaseConfig from './supabase.config.json';

const supabaseUrl =
  supabaseConfig.url ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  supabaseConfig.anonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!isSupabaseConfigured) {
    console.warn('[Supabase] Not configured — running in guest mode. Add credentials via GitHub Actions or environment variables.');
    _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    return _supabase;
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  });
  return _supabase;
}

export const supabase = getSupabaseClient();

export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];
