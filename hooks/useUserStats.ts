import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStudyStats, recordCBTScore, Activity } from '@/lib/studyTracker';
import { supabase } from '@/lib/supabase';

export type UserStats = {
  username: string;
  email: string;
  streak: number;
  topicsDone: number;
  avgScore: number;
  recentActivity: Activity[];
};

export function useUserStats(): UserStats {
  const { user } = useAuth();

  const [localStats, setLocalStats] = useState<Omit<UserStats, 'username' | 'email'>>({
    streak: 0,
    topicsDone: 0,
    avgScore: 0,
    recentActivity: [],
  });

  useEffect(() => {
    getStudyStats().then(stats => {
      setLocalStats({
        streak:         stats.streak,
        topicsDone:     stats.topicsDone,
        avgScore:       stats.avgScore,
        recentActivity: stats.recentActivity,
      });
    });
  }, [user]);

  const meta     = user?.user_metadata ?? {};
  const username =
    meta.username ?? meta.user_name ?? meta.full_name ??
    user?.email?.split('@')[0] ?? 'Student';
  const email = user?.email ?? '';

  return {
    username,
    email,
    streak:         localStats.streak     || (meta.streak       ?? 0),
    topicsDone:     localStats.topicsDone || (meta.topics_done  ?? 0),
    avgScore:       localStats.avgScore   || (meta.avg_score    ?? 0),
    recentActivity: localStats.recentActivity.length > 0
      ? localStats.recentActivity
      : (meta.recent_activity ?? []),
  };
}

/** Cloud sync: call after a CBT session or lesson to persist to Supabase */
export async function saveUserStats(updates: {
  streak?:          number;
  topics_done?:     number;
  avg_score?:       number;
  recent_activity?: Activity[];
}) {
  try {
    await supabase.auth.updateUser({ data: updates });
  } catch {}
}

/** Save a CBT result to local AsyncStorage + Supabase */
export async function saveCBTResult(
  correct: number,
  total:   number,
  label:   string,
) {
  await recordCBTScore(correct, total, label);
  const pct = Math.round((correct / total) * 100);
  await saveUserStats({
    avg_score: pct,
    recent_activity: [{
      icon:     'document-text-outline',
      colorKey: pct >= 70 ? 'accent' : pct >= 50 ? 'blue' : 'danger',
      text:     `${label}: ${correct}/${total} (${pct}%)`,
    }],
  });
}
