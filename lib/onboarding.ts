import { Platform } from 'react-native';

export const ONBOARDING_KEY = 'naija_academy_onboarding_done';
export const APP_MODE_KEY = 'naija_academy_app_mode';

export function isOnboardingDone(): boolean {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(ONBOARDING_KEY) === '1';
    }
  } catch {}
  return false;
}

export function markOnboardingDone() {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, '1');
    }
  } catch {}
}

export function getAppMode(): 'study' | 'practice' {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const mode = localStorage.getItem(APP_MODE_KEY);
      if (mode === 'study' || mode === 'practice') return mode;
    }
  } catch {}
  return 'study';
}

export function saveAppMode(mode: 'study' | 'practice') {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(APP_MODE_KEY, mode);
    }
  } catch {}
}
