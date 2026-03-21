/**
 * Remote content service — fetches lessons JSON from a hosted URL at runtime.
 * This means content can be updated WITHOUT rebuilding or redeploying the app.
 *
 * Pipeline:
 *   scrape → merge → build_lessons_data.py → upload_content.py → Supabase Storage
 *   App fetches from Storage URL on startup, caches locally for 24 h.
 *
 * If the remote fetch fails, the app falls back to the baked-in lessonsData.ts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LESSONS } from './lessonsData';

const CACHE_KEY   = 'naija_remote_lessons';
const CACHE_TS_KEY = 'naija_remote_lessons_ts';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const REMOTE_URL =
  process.env.EXPO_PUBLIC_LESSONS_URL ??
  (process.env.EXPO_PUBLIC_SUPABASE_URL
    ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/lessonsData.json`
    : null);

export type LessonEntry = {
  subject: string;
  slug: string;
  title: string;
  html: string;
};

let _cache: LessonEntry[] | null = null;

async function loadFromStorage(): Promise<LessonEntry[] | null> {
  try {
    const [raw, tsRaw] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(CACHE_TS_KEY),
    ]);
    if (!raw || !tsRaw) return null;
    const age = Date.now() - Number(tsRaw);
    if (age > CACHE_TTL_MS) return null;
    return JSON.parse(raw) as LessonEntry[];
  } catch {
    return null;
  }
}

async function fetchRemote(): Promise<LessonEntry[] | null> {
  if (!REMOTE_URL) return null;
  try {
    const res = await fetch(REMOTE_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json() as LessonEntry[];
    await AsyncStorage.multiSet([
      [CACHE_KEY, JSON.stringify(data)],
      [CACHE_TS_KEY, String(Date.now())],
    ]);
    return data;
  } catch {
    return null;
  }
}

function builtinLessons(): LessonEntry[] {
  return Object.entries(LESSONS).flatMap(([subject, topics]) =>
    Object.entries(topics).map(([slug, lesson]) => ({
      subject,
      slug,
      title: (lesson as any).title ?? slug,
      html: (lesson as any).html ?? '',
    }))
  );
}

/**
 * Returns the best available lessons:
 *   1. In-memory cache (fastest)
 *   2. AsyncStorage cache if < 24 h old
 *   3. Remote URL fetch (background, result cached)
 *   4. Built-in baked data (always available)
 */
export async function getLessons(): Promise<LessonEntry[]> {
  if (_cache) return _cache;

  const stored = await loadFromStorage();
  if (stored) {
    _cache = stored;
    fetchRemote().then(fresh => { if (fresh) _cache = fresh; });
    return stored;
  }

  const remote = await fetchRemote();
  if (remote) {
    _cache = remote;
    return remote;
  }

  const builtin = builtinLessons();
  _cache = builtin;
  return builtin;
}

export function clearLessonsCache(): void {
  _cache = null;
  AsyncStorage.multiRemove([CACHE_KEY, CACHE_TS_KEY]);
}

export function getLesson(subject: string, slug: string): LessonEntry | null {
  if (!_cache) return null;
  return _cache.find(l => l.subject === subject && l.slug === slug) ?? null;
}
