import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STREAK:      'naija_streak',
  LAST_DATE:   'naija_last_study_date',
  TOPICS_DONE: 'naija_topics_done',
  COMPLETED:   'naija_completed_topics',
  AVG_SCORE:   'naija_avg_score',
  SCORE_COUNT: 'naija_score_count',
  RECENT:      'naija_recent_activity',
};

export type Activity = {
  icon: string;
  colorKey: 'accent' | 'blue' | 'danger';
  text: string;
};

export type StudyStats = {
  streak: number;
  topicsDone: number;
  avgScore: number;
  recentActivity: Activity[];
  completedTopics: string[];
};

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

async function getOrSet<T>(key: string, defaultVal: T): Promise<T> {
  const val = await AsyncStorage.getItem(key);
  if (val === null) return defaultVal;
  try { return JSON.parse(val) as T; } catch { return defaultVal; }
}

async function updateStreak(): Promise<number> {
  const today     = todayStr();
  const lastDate  = await AsyncStorage.getItem(KEYS.LAST_DATE);
  let streak      = await getOrSet<number>(KEYS.STREAK, 0);

  if (lastDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastDate === yesterdayStr) {
    streak += 1;
  } else if (lastDate === null) {
    streak = 1;
  } else {
    streak = 1;
  }

  await AsyncStorage.multiSet([
    [KEYS.LAST_DATE, today],
    [KEYS.STREAK, JSON.stringify(streak)],
  ]);
  return streak;
}

export async function recordLessonView(
  subject: string,
  slug: string,
  topicName: string,
): Promise<void> {
  await updateStreak();

  const completed = await getOrSet<string[]>(KEYS.COMPLETED, []);
  const key = `${subject}:${slug}`;
  if (!completed.includes(key)) {
    completed.push(key);
    await AsyncStorage.multiSet([
      [KEYS.COMPLETED, JSON.stringify(completed)],
      [KEYS.TOPICS_DONE, JSON.stringify(completed.length)],
    ]);
  }

  const recent = await getOrSet<Activity[]>(KEYS.RECENT, []);
  const entry: Activity = {
    icon: 'book-outline',
    colorKey: 'blue',
    text: `Studied: ${topicName}`,
  };
  const updated = [entry, ...recent.filter(a => a.text !== entry.text)].slice(0, 10);
  await AsyncStorage.setItem(KEYS.RECENT, JSON.stringify(updated));
}

export async function recordCBTScore(
  correct: number,
  total: number,
  label: string,
): Promise<void> {
  await updateStreak();

  const pct      = Math.round((correct / total) * 100);
  const count    = await getOrSet<number>(KEYS.SCORE_COUNT, 0);
  const prevAvg  = await getOrSet<number>(KEYS.AVG_SCORE, 0);
  const newAvg   = count === 0 ? pct : Math.round((prevAvg * count + pct) / (count + 1));

  await AsyncStorage.multiSet([
    [KEYS.SCORE_COUNT, JSON.stringify(count + 1)],
    [KEYS.AVG_SCORE, JSON.stringify(newAvg)],
  ]);

  const recent = await getOrSet<Activity[]>(KEYS.RECENT, []);
  const entry: Activity = {
    icon: 'document-text-outline',
    colorKey: pct >= 70 ? 'accent' : pct >= 50 ? 'blue' : 'danger',
    text: `${label}: ${correct}/${total} (${pct}%)`,
  };
  const updated = [entry, ...recent].slice(0, 10);
  await AsyncStorage.setItem(KEYS.RECENT, JSON.stringify(updated));
}

export async function getStudyStats(): Promise<StudyStats> {
  const [streak, topicsDone, avgScore, recentActivity, completedTopics] = await Promise.all([
    getOrSet<number>(KEYS.STREAK, 0),
    getOrSet<number>(KEYS.TOPICS_DONE, 0),
    getOrSet<number>(KEYS.AVG_SCORE, 0),
    getOrSet<Activity[]>(KEYS.RECENT, []),
    getOrSet<string[]>(KEYS.COMPLETED, []),
  ]);
  return { streak, topicsDone, avgScore, recentActivity, completedTopics };
}

export async function isTopicCompleted(subject: string, slug: string): Promise<boolean> {
  const completed = await getOrSet<string[]>(KEYS.COMPLETED, []);
  return completed.includes(`${subject}:${slug}`);
}

export type SubjectProgress = {
  completed: number;
  total: number;
  pct: number;
  completedSlugs: Set<string>;
};

export async function getSubjectProgress(subjectId: string, totalTopics: number): Promise<SubjectProgress> {
  const completed = await getOrSet<string[]>(KEYS.COMPLETED, []);
  const prefix = `${subjectId}:`;
  const completedSlugs = new Set(
    completed.filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length))
  );
  const count = completedSlugs.size;
  return {
    completed: count,
    total: totalTopics,
    pct: totalTopics > 0 ? Math.round((count / totalTopics) * 100) : 0,
    completedSlugs,
  };
}

export async function getAllSubjectsProgress(): Promise<Record<string, SubjectProgress>> {
  const completed = await getOrSet<string[]>(KEYS.COMPLETED, []);
  const map: Record<string, Set<string>> = {};
  for (const key of completed) {
    const colonIdx = key.indexOf(':');
    if (colonIdx === -1) continue;
    const subj = key.slice(0, colonIdx);
    const slug = key.slice(colonIdx + 1);
    if (!map[subj]) map[subj] = new Set();
    map[subj].add(slug);
  }
  const result: Record<string, SubjectProgress> = {};
  for (const [subj, slugs] of Object.entries(map)) {
    result[subj] = { completed: slugs.size, total: 0, pct: 0, completedSlugs: slugs };
  }
  return result;
}
