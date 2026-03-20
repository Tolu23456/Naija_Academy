#!/usr/bin/env node
/**
 * Validates that required Supabase environment variables are set.
 * In Replit, set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 * via the Secrets tab (the padlock icon in the sidebar).
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('\n  [Setup] Supabase environment variables are not configured.');
  console.warn('  The app will run in demo mode without authentication.');
  console.warn('  To enable auth, add these secrets in the Replit Secrets tab:');
  console.warn('    - EXPO_PUBLIC_SUPABASE_URL');
  console.warn('    - EXPO_PUBLIC_SUPABASE_ANON_KEY\n');
} else {
  console.log('  [Setup] Supabase environment variables are configured.');
}
