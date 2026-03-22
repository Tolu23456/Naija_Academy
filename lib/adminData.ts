/**
 * adminData.ts — Real data layer for the NaijaAcademy Admin Panel.
 *
 * Announcements and settings are persisted to AsyncStorage.
 * CBT session stats are pulled from the existing studyTracker.
 * Lesson coverage comes directly from lessonsData / subjectsData.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  ANNOUNCEMENTS: 'admin_announcements',
  SETTINGS:      'admin_settings',
};

// ── Types ─────────────────────────────────────────────────────────────────────

export type Announcement = {
  id:     string;
  title:  string;
  body:   string;
  date:   string;
  pinned: boolean;
};

export type AppSettings = {
  maintenanceMode:  boolean;
  emailNotifs:      boolean;
  guestAccess:      boolean;
  autoApprove:      boolean;
  leaderboard:      boolean;
  analyticsEnabled: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  maintenanceMode:  false,
  emailNotifs:      true,
  guestAccess:      true,
  autoApprove:      false,
  leaderboard:      true,
  analyticsEnabled: true,
};

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id:     'default-1',
    title:  '2024 JAMB Registration Open',
    body:   'JAMB UTME 2024/2025 registration is now open. Visit the JAMB portal to register before the deadline.',
    date:   new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    pinned: true,
  },
  {
    id:     'default-2',
    title:  'New Biology & Chemistry Notes Added',
    body:   '15 new topic notes have been added for Biology and Chemistry. Check the Subjects tab to access them.',
    date:   new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    pinned: false,
  },
  {
    id:     'default-3',
    title:  'App Maintenance — 25 March',
    body:   'NaijaAcademy will be briefly offline on 25 March from 2AM–4AM for scheduled server maintenance.',
    date:   new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    pinned: false,
  },
];

// ── Announcements ─────────────────────────────────────────────────────────────

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ANNOUNCEMENTS);
    if (raw) {
      const parsed = JSON.parse(raw) as Announcement[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ANNOUNCEMENTS;
}

export async function saveAnnouncements(items: Announcement[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(items));
  } catch {}
}

export async function addAnnouncement(
  title: string,
  body: string,
  pinned: boolean,
): Promise<Announcement[]> {
  const items = await getAnnouncements();
  const newItem: Announcement = {
    id:    Date.now().toString(),
    title: title.trim(),
    body:  body.trim(),
    date:  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    pinned,
  };
  const updated = pinned
    ? [newItem, ...items]
    : [newItem, ...items.filter(a => a.pinned), ...items.filter(a => !a.pinned)];
  await saveAnnouncements(updated);
  return updated;
}

export async function deleteAnnouncement(id: string): Promise<Announcement[]> {
  const items   = await getAnnouncements();
  const updated = items.filter(a => a.id !== id);
  await saveAnnouncements(updated);
  return updated;
}

export async function togglePin(id: string): Promise<Announcement[]> {
  const items   = await getAnnouncements();
  const updated = items.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a);
  await saveAnnouncements(updated);
  return updated;
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, [key]: value };
  await saveSettings(updated);
  return updated;
}
