import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, TextInput, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { SUBJECTS, getSubjectsByExam } from '@/lib/subjectsData';
import { getTopicSlugs } from '@/lib/lessonsData';
import { getStudyStats } from '@/lib/studyTracker';
import {
  getAnnouncements, addAnnouncement, deleteAnnouncement, togglePin,
  getSettings, updateSetting,
  type Announcement, type AppSettings, DEFAULT_SETTINGS,
} from '@/lib/adminData';
import { SkeletonBox, StatCardSkeleton, ListRowSkeleton } from '@/components/SkeletonLoader';

const ADMIN_EMAIL = 'naijacdm@gmail.com';

type Tab = 'overview' | 'content' | 'cbt' | 'announcements' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview',      label: 'Overview',   icon: 'grid-outline' },
  { id: 'content',       label: 'Content',    icon: 'book-outline' },
  { id: 'cbt',           label: 'CBT',        icon: 'clipboard-outline' },
  { id: 'announcements', label: 'Announce',   icon: 'megaphone-outline' },
  { id: 'settings',      label: 'Settings',   icon: 'settings-outline' },
];

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={[sc.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      <View style={[sc.iconWrap, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[sc.value, { color: colors.text }]}>{value}</Text>
      <Text style={[sc.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  card:     { flex: 1, minWidth: 80, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, gap: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  value:    { fontSize: 20, fontFamily: Fonts.bold },
  label:    { fontSize: 11, fontFamily: Fonts.regular, textAlign: 'center' },
});

function SH({ title }: { title: string }) {
  const { colors } = useTheme();
  return <Text style={[s.sectionTitle, { color: colors.text }]}>{title}</Text>;
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<{ streak: number; topicsDone: number; avgScore: number; recentActivity: any[] } | null>(null);

  const totalLessons = SUBJECTS.reduce((a, s) => a + getTopicSlugs(s.id).length, 0);
  const totalTopics  = SUBJECTS.reduce((a, s) => a + s.topics.length, 0);
  const coverage     = Math.round((totalLessons / totalTopics) * 100);

  useEffect(() => {
    getStudyStats().then(setStats);
  }, []);

  const examColors: Record<string, string> = {
    JAMB: colors.accent, WAEC: colors.blue, NECO: colors.orange,
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <SH title="Platform Stats" />

      {!stats ? (
        <View style={s.statsGrid}>
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </View>
      ) : (
        <View style={s.statsGrid}>
          <StatCard icon="book-outline"       value={totalLessons}     label="Lesson Notes"  color={colors.accent} />
          <StatCard icon="layers-outline"     value={totalTopics}      label="Topics"        color={colors.blue} />
          <StatCard icon="pie-chart-outline"  value={`${coverage}%`}   label="Coverage"      color={colors.orange} />
          <StatCard icon="library-outline"    value={SUBJECTS.length}  label="Subjects"      color={colors.warning} />
        </View>
      )}

      {!stats ? (
        <View style={s.statsGrid}>
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </View>
      ) : (
        <View style={s.statsGrid}>
          <StatCard icon="trending-up"    value={`${stats.avgScore}%`}  label="Your Avg Score"  color={colors.accent} />
          <StatCard icon="checkmark-done" value={stats.topicsDone}       label="Topics Done"     color={colors.blue} />
          <StatCard icon="calendar-outline" value={`${stats.streak}d`}  label="Study Streak"    color={colors.warning} />
          <StatCard icon="trophy-outline" value={stats.avgScore >= 70 ? 'A' : stats.avgScore >= 50 ? 'B' : 'C'} label="Grade" color={colors.orange} />
        </View>
      )}

      <SH title="Exam Distribution" />
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {(['JAMB', 'WAEC', 'NECO'] as const).map((exam, i, arr) => {
          const count = getSubjectsByExam(exam).length;
          const pct   = Math.round((count / SUBJECTS.length) * 100);
          const col   = examColors[exam];
          return (
            <View key={exam} style={[s.rowItem, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
              <View style={[s.examBadge, { backgroundColor: `${col}22` }]}>
                <Text style={[s.examBadgeText, { color: col }]}>{exam}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[s.progressBg, { backgroundColor: colors.surfaceBorder }]}>
                  <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: col }]} />
                </View>
              </View>
              <Text style={[s.rowValue, { color: colors.text }]}>{count} subjects</Text>
            </View>
          );
        })}
      </View>

      <SH title="Recent Study Activity" />
      {!stats ? (
        <ListRowSkeleton rows={4} />
      ) : stats.recentActivity.length === 0 ? (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={s.emptyState}>
            <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>No activity yet — start studying!</Text>
          </View>
        </View>
      ) : (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {stats.recentActivity.slice(0, 8).map((item: any, i: number) => {
            const iconColor = item.colorKey === 'accent' ? colors.accent : item.colorKey === 'blue' ? colors.blue : colors.danger;
            return (
              <View key={i} style={[s.activityRow, i < Math.min(stats.recentActivity.length, 8) - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
                <View style={[s.activityIcon, { backgroundColor: `${iconColor}22` }]}>
                  <Ionicons name={item.icon as any} size={16} color={iconColor} />
                </View>
                <Text style={[s.activityMsg, { color: colors.text }]}>{item.text}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

// ── Content Tab ───────────────────────────────────────────────────────────────

function ContentTab() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const subjectStats = SUBJECTS.map(s => ({
    name:     s.name,
    icon:     s.icon,
    colorKey: s.colorKey,
    notes:    getTopicSlugs(s.id).length,
    total:    s.topics.length,
    exams:    s.examTypes.join(' · '),
  }));
  const totalLessons = subjectStats.reduce((a, s) => a + s.notes, 0);
  const totalTopics  = subjectStats.reduce((a, s) => a + s.total, 0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <SH title="Lesson Coverage" />
      {loading ? (
        <View style={s.statsGrid}><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></View>
      ) : (
        <View style={s.statsGrid}>
          <StatCard icon="book-outline"      value={totalLessons}  label="Ready"      color={colors.accent} />
          <StatCard icon="layers-outline"    value={totalTopics}   label="Topics"     color={colors.blue} />
          <StatCard icon="pie-chart-outline" value={`${Math.round(totalLessons/totalTopics*100)}%`} label="Coverage" color={colors.orange} />
          <StatCard icon="library-outline"   value={SUBJECTS.length} label="Subjects" color={colors.warning} />
        </View>
      )}

      <SH title="Subject Breakdown" />
      {loading ? (
        <ListRowSkeleton rows={6} />
      ) : (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {subjectStats.map((sub, i) => {
            const col = (colors as any)[sub.colorKey] as string ?? colors.accent;
            const pct = sub.total > 0 ? Math.round((sub.notes / sub.total) * 100) : 0;
            return (
              <View key={sub.name} style={[s.subjectRow, i < subjectStats.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
                <View style={[s.subjectIcon, { backgroundColor: `${col}22` }]}>
                  <Ionicons name={sub.icon as any} size={16} color={col} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.subjectMeta}>
                    <View>
                      <Text style={[s.subjectName, { color: colors.text }]}>{sub.name}</Text>
                      <Text style={[s.subjectExam, { color: colors.textSecondary }]}>{sub.exams}</Text>
                    </View>
                    <Text style={[s.subjectPct, { color: pct === 100 ? colors.accent : pct > 0 ? colors.warning : colors.danger }]}>
                      {sub.notes}/{sub.total}
                    </Text>
                  </View>
                  <View style={[s.progressBg, { backgroundColor: colors.surfaceBorder }]}>
                    <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: col }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <SH title="Missing Content" />
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {subjectStats.filter(s => s.notes === 0).length === 0 ? (
          <View style={[s.emptyState, { paddingVertical: Spacing.md }]}>
            <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>All subjects have at least some content</Text>
          </View>
        ) : (
          subjectStats.filter(s => s.notes === 0).map((sub, i, arr) => (
            <View key={sub.name} style={[s.rowItem, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
              <Ionicons name="warning-outline" size={16} color={colors.orange} />
              <Text style={[s.rowLabel, { color: colors.text, flex: 1 }]}>{sub.name}</Text>
              <Text style={[s.rowValue, { color: colors.textSecondary }]}>0/{sub.total} topics</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ── CBT Tab ───────────────────────────────────────────────────────────────────

function CBTTab() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<{ avgScore: number; topicsDone: number; recentActivity: any[] } | null>(null);

  useEffect(() => {
    getStudyStats().then(setStats);
  }, []);

  const cbtSessions = stats?.recentActivity.filter((a: any) =>
    a.icon === 'document-text-outline'
  ) ?? [];

  const parseScore = (text: string): number => {
    const m = text.match(/\((\d+)%\)/);
    return m ? parseInt(m[1]) : 0;
  };

  const scoreColor = (n: number) =>
    n >= 80 ? colors.accent : n >= 60 ? colors.warning : colors.danger;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <SH title="Your CBT Performance" />

      {!stats ? (
        <View style={s.statsGrid}><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></View>
      ) : (
        <View style={s.statsGrid}>
          <StatCard icon="clipboard-outline" value={cbtSessions.length}     label="Sessions"    color={colors.accent} />
          <StatCard icon="trending-up"       value={`${stats.avgScore}%`}   label="Avg Score"   color={colors.blue} />
          <StatCard icon="checkmark-done"    value={stats.topicsDone}       label="Topics Done" color={colors.warning} />
          <StatCard icon="trophy-outline"    value={stats.avgScore >= 70 ? '🏆' : stats.avgScore >= 50 ? '🥈' : '🥉'} label="Rank" color={colors.orange} />
        </View>
      )}

      <SH title="Exam Sessions Log" />
      {!stats ? (
        <ListRowSkeleton rows={5} />
      ) : cbtSessions.length === 0 ? (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={s.emptyState}>
            <Ionicons name="clipboard-outline" size={32} color={colors.textSecondary} />
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>No CBT sessions yet — take a practice exam!</Text>
          </View>
        </View>
      ) : (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {cbtSessions.map((session: any, i: number) => {
            const pct = parseScore(session.text);
            return (
              <View key={i} style={[s.rowItem, i < cbtSessions.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
                <View style={[s.activityIcon, { backgroundColor: `${scoreColor(pct)}22` }]}>
                  <Ionicons name="document-text-outline" size={16} color={scoreColor(pct)} />
                </View>
                <Text style={[s.rowLabel, { color: colors.text }]}>{session.text}</Text>
                <Text style={[s.rowValue, { color: scoreColor(pct) }]}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      )}

      <SH title="Study Coverage by Exam" />
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {(['JAMB', 'WAEC', 'NECO'] as const).map((exam, i, arr) => {
          const subjects = getSubjectsByExam(exam);
          const ready    = subjects.reduce((a, sub) => a + getTopicSlugs(sub.id).length, 0);
          const total    = subjects.reduce((a, sub) => a + sub.topics.length, 0);
          const pct      = total > 0 ? Math.round((ready / total) * 100) : 0;
          const col      = exam === 'JAMB' ? colors.accent : exam === 'WAEC' ? colors.blue : colors.orange;
          return (
            <View key={exam} style={[s.rowItem, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
              <View style={[s.examBadge, { backgroundColor: `${col}22` }]}>
                <Text style={[s.examBadgeText, { color: col }]}>{exam}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[s.progressBg, { backgroundColor: colors.surfaceBorder }]}>
                  <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: col }]} />
                </View>
              </View>
              <Text style={[s.rowValue, { color: colors.text }]}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Announcements Tab ─────────────────────────────────────────────────────────

function AnnouncementsTab() {
  const { colors } = useTheme();
  const [items, setItems]       = useState<Announcement[] | null>(null);
  const [title, setTitle]       = useState('');
  const [body, setBody]         = useState('');
  const [pinned, setPinned]     = useState(false);
  const [composing, setComposing] = useState(false);
  const [posting, setPosting]   = useState(false);

  useEffect(() => {
    getAnnouncements().then(setItems);
  }, []);

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    const updated = await addAnnouncement(title, body, pinned);
    setItems(updated);
    setTitle(''); setBody(''); setPinned(false); setComposing(false);
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    const updated = await deleteAnnouncement(id);
    setItems(updated);
  };

  const handleTogglePin = async (id: string) => {
    const updated = await togglePin(id);
    setItems(updated);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <View style={s.sectionHeaderRow}>
        <Text style={[s.sectionTitle, { color: colors.text, marginTop: 0 }]}>
          Announcements {items ? `(${items.length})` : ''}
        </Text>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.accent }]} onPress={() => setComposing(!composing)}>
          <Ionicons name={composing ? 'close' : 'add'} size={18} color="#fff" />
          <Text style={s.addBtnText}>{composing ? 'Cancel' : 'New'}</Text>
        </TouchableOpacity>
      </View>

      {composing && (
        <View style={[s.composeCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
          <Text style={[s.composeLabel, { color: colors.textSecondary }]}>Title *</Text>
          <TextInput
            style={[s.composeInput, { color: colors.text, borderColor: colors.surfaceBorder }]}
            placeholder="Announcement title…"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <Text style={[s.composeLabel, { color: colors.textSecondary }]}>Message *</Text>
          <TextInput
            style={[s.composeTextarea, { color: colors.text, borderColor: colors.surfaceBorder }]}
            placeholder="Write your message here…"
            placeholderTextColor={colors.textSecondary}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={4}
          />
          <View style={s.pinnedRow}>
            <Text style={[s.composeLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Pin to top</Text>
            <Switch value={pinned} onValueChange={setPinned} trackColor={{ false: colors.surfaceBorder, true: colors.accent }} thumbColor="#fff" />
          </View>
          <TouchableOpacity
            style={[s.postBtn, { backgroundColor: !title.trim() || !body.trim() || posting ? colors.surfaceBorder : colors.accent }]}
            onPress={handlePost}
            disabled={!title.trim() || !body.trim() || posting}
          >
            <Ionicons name="send" size={16} color="#fff" />
            <Text style={s.postBtnText}>{posting ? 'Posting…' : 'Post Announcement'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {items === null ? (
        <ListRowSkeleton rows={3} />
      ) : items.length === 0 ? (
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={s.emptyState}>
            <Ionicons name="megaphone-outline" size={32} color={colors.textSecondary} />
            <Text style={[s.emptyText, { color: colors.textSecondary }]}>No announcements yet</Text>
          </View>
        </View>
      ) : (
        items.map(ann => (
          <View key={ann.id} style={[s.annCard, { backgroundColor: colors.surface, borderColor: ann.pinned ? colors.accent : colors.surfaceBorder }]}>
            <View style={s.annHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {ann.pinned && <Ionicons name="pin" size={12} color={colors.accent} />}
                  <Text style={[s.annTitle, { color: colors.text }]}>{ann.title}</Text>
                </View>
                <Text style={[s.annDate, { color: colors.textSecondary }]}>{ann.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity onPress={() => handleTogglePin(ann.id)} style={s.iconBtn}>
                  <Ionicons name="pin" size={15} color={ann.pinned ? colors.accent : colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(ann.id)} style={s.iconBtn}>
                  <Ionicons name="trash-outline" size={15} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[s.annBody, { color: colors.textSecondary }]}>{ann.body}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({ onSignOut }: { onSignOut: () => void }) {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const toggle = async <K extends keyof AppSettings>(key: K) => {
    if (!settings) return;
    const updated = await updateSetting(key, !settings[key] as any);
    setSettings(updated);
  };

  const totalLessons = SUBJECTS.reduce((a, s) => a + getTopicSlugs(s.id).length, 0);

  if (!settings) {
    return (
      <ScrollView contentContainerStyle={s.tabContent}>
        <SH title="App Configuration" />
        <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[s.settingRow, { borderBottomWidth: i < 5 ? 1 : 0, borderBottomColor: colors.surfaceBorder }]}>
              <SkeletonBox width="50%" height={14} radius={4} />
              <SkeletonBox width={48} height={28} radius={14} />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  const toggleRow = (label: string, key: keyof AppSettings, danger?: boolean) => (
    <View style={[s.settingRow, { borderBottomColor: colors.surfaceBorder }]}>
      <Text style={[s.settingLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      <Switch
        value={settings[key] as boolean}
        onValueChange={() => toggle(key)}
        trackColor={{ false: colors.surfaceBorder, true: danger ? colors.danger : colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabContent}>
      <SH title="App Configuration" />
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {toggleRow('Maintenance Mode',       'maintenanceMode',  true)}
        {toggleRow('Email Notifications',    'emailNotifs')}
        {toggleRow('Guest Access',           'guestAccess')}
        {toggleRow('Auto-Approve Questions', 'autoApprove')}
        {toggleRow('Leaderboard Visible',    'leaderboard')}
        <View style={[s.settingRow, { borderBottomWidth: 0 }]}>
          <Text style={[s.settingLabel, { color: colors.text }]}>Analytics Collection</Text>
          <Switch value={settings.analyticsEnabled} onValueChange={() => toggle('analyticsEnabled')} trackColor={{ false: colors.surfaceBorder, true: colors.accent }} thumbColor="#fff" />
        </View>
      </View>

      <SH title="System Info" />
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {[
          { label: 'Admin Email',    value: ADMIN_EMAIL },
          { label: 'Platform',       value: Platform.OS },
          { label: 'App Version',    value: '1.0.0' },
          { label: 'Total Subjects', value: String(SUBJECTS.length) },
          { label: 'Lesson Notes',   value: String(totalLessons) },
          { label: 'Supabase',       value: 'sloeeapbspnxoedkgnah' },
          { label: 'DB Status',      value: 'Connected ✓' },
        ].map((item, i, arr) => (
          <View key={item.label} style={[s.infoRow, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
            <Text style={[s.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            <Text style={[s.infoValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
          </View>
        ))}
      </View>

      <SH title="Actions" />
      <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {[
          { icon: 'sync-outline',             label: 'Refresh Content Cache', color: colors.blue },
          { icon: 'cloud-download-outline',   label: 'Export App Data',        color: colors.blue },
          { icon: 'cloud-upload-outline', label: 'Sync Lesson Content', color: colors.warning },
        ].map((item, i) => (
          <TouchableOpacity key={item.label} style={[s.actionRow, { borderBottomColor: colors.surfaceBorder }]}>
            <Ionicons name={item.icon as any} size={18} color={item.color} />
            <Text style={[s.actionLabel, { color: item.color }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      <SH title="Danger Zone" />
      <View style={[s.card, { backgroundColor: `${colors.danger}12`, borderColor: `${colors.danger}44` }]}>
        <TouchableOpacity style={[s.actionRow, { borderBottomWidth: 0 }]} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[s.actionLabel, { color: colors.danger }]}>Sign Out of Admin Panel</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Root Screen ───────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const insets     = useSafeAreaInsets();
  const router     = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const { clearAdminSession } = useAdmin();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const topPad = Platform.OS === 'web' ? 0 : insets.top;

  async function handleSignOut() {
    clearAdminSession();
    if (user) await signOut();
    router.replace('/auth');
  }

  function handleExitAdmin() {
    clearAdminSession();
    router.replace('/(tabs)');
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewTab />;
      case 'content':       return <ContentTab />;
      case 'cbt':           return <CBTTab />;
      case 'announcements': return <AnnouncementsTab />;
      case 'settings':      return <SettingsTab onSignOut={handleSignOut} />;
    }
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={handleExitAdmin} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={[s.headerTitle, { color: colors.text }]}>Admin Panel</Text>
          <Text style={[s.headerSub, { color: colors.textSecondary }]}>{ADMIN_EMAIL}</Text>
        </View>
        <View style={[s.adminBadge, { backgroundColor: colors.accentDim }]}>
          <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
          <Text style={[s.adminBadgeText, { color: colors.accent }]}>Admin</Text>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.tabBar, { borderBottomColor: colors.surfaceBorder }]}
        contentContainerStyle={s.tabBarContent}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tabBtn, active && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon as any} size={16} color={active ? colors.accent : colors.textSecondary} />
              <Text style={[s.tabLabel, { color: active ? colors.accent : colors.textSecondary }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ flex: 1 }}>{renderTab()}</View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:        { flex: 1 },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  backBtn:          { padding: 4 },
  headerTitle:      { fontSize: 18, fontFamily: Fonts.bold },
  headerSub:        { fontSize: 11, fontFamily: Fonts.regular },
  adminBadge:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  adminBadgeText:   { fontSize: 12, fontFamily: Fonts.semiBold },
  tabBar:           { borderBottomWidth: 1, flexGrow: 0 },
  tabBarContent:    { paddingHorizontal: Spacing.md },
  tabBtn:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 12, marginRight: 4 },
  tabLabel:         { fontSize: 13, fontFamily: Fonts.medium },
  tabContent:       { padding: Spacing.md, paddingBottom: 60 },
  sectionTitle:     { fontSize: 15, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm, marginTop: Spacing.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm, marginTop: Spacing.md },
  statsGrid:        { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  card:             { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.sm, overflow: 'hidden' },
  rowItem:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  rowLabel:         { fontSize: 13, fontFamily: Fonts.regular },
  rowValue:         { fontSize: 13, fontFamily: Fonts.semiBold, minWidth: 45, textAlign: 'right' },
  examBadge:        { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full, minWidth: 54, alignItems: 'center' },
  examBadgeText:    { fontSize: 12, fontFamily: Fonts.semiBold },
  progressBg:       { height: 6, borderRadius: Radius.full, marginTop: 4 },
  progressFill:     { height: 6, borderRadius: Radius.full },
  activityRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  activityIcon:     { width: 32, height: 32, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  activityMsg:      { flex: 1, fontSize: 12, fontFamily: Fonts.regular },
  subjectRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  subjectIcon:      { width: 34, height: 34, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  subjectMeta:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'flex-start' },
  subjectName:      { fontSize: 13, fontFamily: Fonts.medium },
  subjectExam:      { fontSize: 10, fontFamily: Fonts.regular },
  subjectPct:       { fontSize: 12, fontFamily: Fonts.semiBold },
  addBtn:           { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  addBtnText:       { color: '#fff', fontSize: 13, fontFamily: Fonts.semiBold },
  composeCard:      { borderRadius: Radius.lg, borderWidth: 1.5, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  composeLabel:     { fontSize: 12, fontFamily: Fonts.medium, marginBottom: 2 },
  composeInput:     { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 44, fontSize: 14, fontFamily: Fonts.regular },
  composeTextarea:  { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, fontSize: 14, fontFamily: Fonts.regular, minHeight: 90, textAlignVertical: 'top' },
  pinnedRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, height: 46, borderRadius: Radius.full },
  postBtnText:      { color: '#fff', fontSize: 14, fontFamily: Fonts.semiBold },
  annCard:          { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  annHeader:        { flexDirection: 'row', alignItems: 'flex-start' },
  annTitle:         { fontSize: 14, fontFamily: Fonts.semiBold },
  annDate:          { fontSize: 11, fontFamily: Fonts.regular, marginTop: 2 },
  annBody:          { fontSize: 13, fontFamily: Fonts.regular, lineHeight: 20 },
  iconBtn:          { padding: 6 },
  settingRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1 },
  settingLabel:     { fontSize: 14, fontFamily: Fonts.medium },
  infoRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  infoLabel:        { fontSize: 13, fontFamily: Fonts.regular },
  infoValue:        { fontSize: 13, fontFamily: Fonts.medium, maxWidth: '60%' },
  actionRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1 },
  actionLabel:      { flex: 1, fontSize: 14, fontFamily: Fonts.medium },
  emptyState:       { alignItems: 'center', paddingVertical: 32, gap: Spacing.sm },
  emptyText:        { fontSize: 13, fontFamily: Fonts.regular, textAlign: 'center' },
});
