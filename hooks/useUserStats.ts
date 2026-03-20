import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export type UserStats = {
  username: string;
  email: string;
  streak: number;
  topicsDone: number;
  avgScore: number;
  recentActivity: { icon: string; colorKey: 'accent' | 'blue' | 'danger'; text: string }[];
};

export function useUserStats(): UserStats {
  const { user } = useAuth();

  const meta = user?.user_metadata ?? {};

  const username =
    meta.username ??
    meta.user_name ??
    meta.full_name ??
    user?.email?.split('@')[0] ??
    'Student';

  const email = user?.email ?? '';
  const streak: number = meta.streak ?? 0;
  const topicsDone: number = meta.topics_done ?? 0;
  const avgScore: number = meta.avg_score ?? 0;
  const recentActivity: UserStats['recentActivity'] = meta.recent_activity ?? [];

  return { username, email, streak, topicsDone, avgScore, recentActivity };
}

/** Call this after a CBT session completes to persist updated stats */
export async function saveUserStats(updates: {
  streak?: number;
  topics_done?: number;
  avg_score?: number;
  recent_activity?: UserStats['recentActivity'];
}) {
  await supabase.auth.updateUser({ data: updates });
}
