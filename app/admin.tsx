import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, TextInput, Animated, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { SUBJECTS, getSubjectsByExam } from '@/lib/subjectsData';
import { getTopicSlugs } from '@/lib/lessonsData';

const ADMIN_EMAIL = 'naijacdm@gmail.com';

type Tab = 'overview' | 'users' | 'content' | 'cbt' | 'announcements' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview',       label: 'Overview',       icon: 'grid-outline' },
  { id: 'users',          label: 'Users',          icon: 'people-outline' },
  { id: 'content',        label: 'Content',        icon: 'book-outline' },
  { id: 'cbt',            label: 'CBT',            icon: 'clipboard-outline' },
  { id: 'announcements',  label: 'Announce',       icon: 'megaphone-outline' },
  { id: 'settings',       label: 'Settings',       icon: 'settings-outline' },
];

const MOCK_USERS = [
  { id: '1', email: 'chidinma.obi@gmail.com',   username: 'ChidiNma',   joined: '2024-01-12', exams: 'JAMB',       status: 'active',   score: 87 },
  { id: '2', email: 'emeka.nwosu@yahoo.com',    username: 'EmekaJr',    joined: '2024-02-03', exams: 'WAEC',       status: 'active',   score: 72 },
  { id: '3', email: 'fatima.bello@gmail.com',   username: 'FatimaB',    joined: '2024-02-18', exams: 'NECO',       status: 'inactive', score: 65 },
  { id: '4', email: 'tunde.adeleke@live.com',   username: 'TundeA',     joined: '2024-03-01', exams: 'JAMB',       status: 'active',   score: 91 },
  { id: '5', email: 'blessing.eze@gmail.com',   username: 'BlessingE',  joined: '2024-03-15', exams: 'WAEC',       status: 'active',   score: 78 },
  { id: '6', email: 'ibrahim.musa@gmail.com',   username: 'IbrahimM',   joined: '2024-04-02', exams: 'JAMB+WAEC', status: 'active',   score: 83 },
  { id: '7', email: 'ngozi.uche@outlook.com',   username: 'NgoziU',     joined: '2024-04-20', exams: 'NECO',       status: 'banned',   score: 45 },
  { id: '8', email: 'samuel.ola@gmail.com',     username: 'SamOla',     joined: '2024-05-08', exams: 'JAMB',       status: 'active',   score: 96 },
];

const MOCK_QUESTIONS = [
  { subject: 'Mathematics', total: 240, approved: 240, pending: 0,  year: '2020-2024' },
  { subject: 'English',     total: 195, approved: 195, pending: 0,  year: '2020-2024' },
  { subject: 'Physics',     total: 178, approved: 165, pending: 13, year: '2020-2024' },
  { subject: 'Chemistry',   total: 160, approved: 148, pending: 12, year: '2020-2024' },
  { subject: 'Biology',     total: 155, approved: 155, pending: 0,  year: '2020-2024' },
  { subject: 'Government',  total: 120, approved: 110, pending: 10, year: '2021-2024' },
  { subject: 'Economics',   total: 115, approved: 105, pending: 10, year: '2021-2024' },
];

const MOCK_CBT_SESSIONS = [
  { date: 'Mar 20', subject: 'Mathematics', user: 'TundeA',    score: 92, duration: '24m' },
  { date: 'Mar 20', subject: 'English',     user: 'SamOla',    score: 88, duration: '31m' },
  { date: 'Mar 19', subject: 'Physics',     user: 'ChidiNma',  score: 75, duration: '28m' },
  { date: 'Mar 19', subject: 'Chemistry',   user: 'BlessingE', score: 68, duration: '35m' },
  { date: 'Mar 18', subject: 'Biology',     user: 'EmekaJr',   score: 80, duration: '27m' },
  { date: 'Mar 18', subject: 'Government',  user: 'IbrahimM',  score: 71, duration: '22m' },
  { date: 'Mar 17', subject: 'Economics',   user: 'FatimaB',   score: 65, duration: '30m' },
];

const MOCK_ANNOUNCEMENTS = [
  { id: '1', title: '2024 JAMB Results Out!', body: 'JAMB 2024 results have been released. Students can check via JAMB portal.', date: 'Mar 15, 2024', pinned: true },
  { id: '2', title: 'New WAEC Questions Added', body: '120 new WAEC practice questions added for Biology and Chemistry.', date: 'Mar 10, 2024', pinned: false },
  { id: '3', title: 'App Maintenance Notice', body: 'The app will be briefly offline on Mar 25 from 2AM–4AM for scheduled maintenance.', date: 'Mar 8, 2024', pinned: false },
];

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

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>;
}

function OverviewTab() {
  const { colors } = useTheme();
  const totalLessons  = SUBJECTS.reduce((a, s) => a + getTopicSlugs(s.id).length, 0);
  const totalTopics   = SUBJECTS.reduce((a, s) => a + s.topics.length, 0);
  const totalQ        = MOCK_QUESTIONS.reduce((a, q) => a + q.total, 0);
  const activeUsers   = MOCK_USERS.filter(u => u.status === 'active').length;
  const avgScore      = Math.round(MOCK_USERS.reduce((a, u) => a + u.score, 0) / MOCK_USERS.length);
  const pendingQ      = MOCK_QUESTIONS.reduce((a, q) => a + q.pending, 0);

  const activityLog = [
    { icon: 'person-add-outline',    color: colors.accent,   msg: 'SamOla joined the platform',                    time: '2h ago' },
    { icon: 'checkmark-circle',      color: colors.accent,   msg: 'TundeA scored 92% in Mathematics CBT',           time: '3h ago' },
    { icon: 'warning-outline',       color: colors.warning,  msg: '13 Physics questions pending approval',           time: '5h ago' },
    { icon: 'megaphone-outline',     color: colors.blue,     msg: 'Announcement: 2024 JAMB Results Out!',           time: '1d ago' },
    { icon: 'ban-outline',           color: colors.danger,   msg: 'NgoziU account suspended',                       time: '2d ago' },
    { icon: 'cloud-upload-outline',  color: colors.blue,     msg: '120 new questions uploaded (Biology, Chemistry)', time: '3d ago' },
    { icon: 'settings-outline',      color: colors.textSecondary, msg: 'App settings updated by admin',             time: '4d ago' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <SectionHeader title="Key Metrics" />
      <View style={styles.statsGrid}>
        <StatCard icon="people-outline"     value={MOCK_USERS.length} label="Total Users"    color={colors.accent} />
        <StatCard icon="checkmark-circle"   value={activeUsers}       label="Active"          color={colors.blue} />
        <StatCard icon="help-circle-outline" value={totalQ}           label="Questions"       color={colors.warning} />
        <StatCard icon="book-outline"       value={totalLessons}      label="Lesson Notes"    color={colors.orange} />
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="trending-up"        value={`${avgScore}%`}    label="Avg Score"       color={colors.accent} />
        <StatCard icon="layers-outline"     value={totalTopics}       label="Topics"          color={colors.blue} />
        <StatCard icon="alert-circle"       value={pendingQ}          label="Pending Q's"     color={colors.warning} />
        <StatCard icon="pie-chart-outline"  value={`${Math.round(totalLessons/totalTopics*100)}%`} label="Coverage" color={colors.orange} />
      </View>

      <SectionHeader title="Exam Distribution" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {(['JAMB','WAEC','NECO'] as const).map((exam, i, arr) => {
          const count = getSubjectsByExam(exam).length;
          const pct   = Math.round((count / SUBJECTS.length) * 100);
          const examColors: Record<string, string> = { JAMB: colors.accent, WAEC: colors.blue, NECO: colors.orange };
          return (
            <View key={exam} style={[styles.rowItem, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
              <View style={[styles.examBadge, { backgroundColor: `${examColors[exam]}22` }]}>
                <Text style={[styles.examBadgeText, { color: examColors[exam] }]}>{exam}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder, marginTop: 0 }]}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: examColors[exam] }]} />
                </View>
              </View>
              <Text style={[styles.rowValue, { color: colors.text }]}>{count} subjects</Text>
            </View>
          );
        })}
      </View>

      <SectionHeader title="Recent Activity" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {activityLog.map((item, i) => (
          <View key={i} style={[styles.activityRow, i < activityLog.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
            <View style={[styles.activityIcon, { backgroundColor: `${item.color}22` }]}>
              <Ionicons name={item.icon as any} size={16} color={item.color} />
            </View>
            <Text style={[styles.activityMsg, { color: colors.text }]}>{item.msg}</Text>
            <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{item.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function UsersTab() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusColor = (s: string) => {
    if (s === 'active')   return colors.accent;
    if (s === 'inactive') return colors.warning;
    return colors.danger;
  };

  const scoreColor = (n: number) =>
    n >= 80 ? colors.accent : n >= 60 ? colors.warning : colors.danger;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <SectionHeader title={`Users (${MOCK_USERS.length})`} />

      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name or email…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {(['all','active','inactive','banned'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filterStatus === f && { backgroundColor: colors.accent }]}
            onPress={() => setFilterStatus(f)}
          >
            <Text style={[styles.filterChipText, { color: filterStatus === f ? '#fff' : colors.textSecondary }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="people-outline"      value={MOCK_USERS.filter(u => u.status === 'active').length}   label="Active"   color={colors.accent} />
        <StatCard icon="time-outline"        value={MOCK_USERS.filter(u => u.status === 'inactive').length} label="Inactive" color={colors.warning} />
        <StatCard icon="ban-outline"         value={MOCK_USERS.filter(u => u.status === 'banned').length}   label="Banned"  color={colors.danger} />
        <StatCard icon="trending-up-outline" value={`${Math.round(MOCK_USERS.reduce((a,u)=>a+u.score,0)/MOCK_USERS.length)}%`} label="Avg Score" color={colors.blue} />
      </View>

      {filtered.map((user, i) => (
        <View key={user.id} style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.avatar, { backgroundColor: colors.accentDim }]}>
            <Text style={[styles.avatarText, { color: colors.accent }]}>{user.username[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.userRow}>
              <Text style={[styles.userName, { color: colors.text }]}>{user.username}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColor(user.status)}22` }]}>
                <Text style={[styles.statusText, { color: statusColor(user.status) }]}>{user.status}</Text>
              </View>
            </View>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
            <View style={styles.userMeta}>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{user.exams}</Text>
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>Joined {user.joined}</Text>
              <Text style={[styles.metaScore, { color: scoreColor(user.score) }]}>{user.score}%</Text>
            </View>
          </View>
        </View>
      ))}

      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No users found</Text>
        </View>
      )}
    </ScrollView>
  );
}

function ContentTab() {
  const { colors } = useTheme();
  const totalLessons = SUBJECTS.reduce((a, s) => a + getTopicSlugs(s.id).length, 0);
  const totalTopics  = SUBJECTS.reduce((a, s) => a + s.topics.length, 0);

  const subjectStats = SUBJECTS.map(s => ({
    name:     s.name,
    icon:     s.icon,
    colorKey: s.colorKey,
    notes:    getTopicSlugs(s.id).length,
    total:    s.topics.length,
    exams:    s.examTypes.join(' · '),
  }));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <SectionHeader title="Lesson Content" />
      <View style={styles.statsGrid}>
        <StatCard icon="book-outline"      value={totalLessons}  label="Ready"    color={colors.accent} />
        <StatCard icon="layers-outline"    value={totalTopics}   label="Topics"   color={colors.blue} />
        <StatCard icon="pie-chart-outline" value={`${Math.round(totalLessons/totalTopics*100)}%`} label="Coverage" color={colors.orange} />
        <StatCard icon="library-outline"   value={SUBJECTS.length} label="Subjects" color={colors.warning} />
      </View>

      <SectionHeader title="Questions Bank" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <View style={[styles.tableHeader, { borderBottomColor: colors.surfaceBorder }]}>
          <Text style={[styles.th, { color: colors.textSecondary, flex: 2 }]}>Subject</Text>
          <Text style={[styles.th, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.th, { color: colors.textSecondary }]}>OK</Text>
          <Text style={[styles.th, { color: colors.textSecondary }]}>Pending</Text>
        </View>
        {MOCK_QUESTIONS.map((q, i) => (
          <View key={q.subject} style={[styles.tableRow, i < MOCK_QUESTIONS.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
            <Text style={[styles.td, { color: colors.text, flex: 2 }]}>{q.subject}</Text>
            <Text style={[styles.td, { color: colors.text }]}>{q.total}</Text>
            <Text style={[styles.td, { color: colors.accent }]}>{q.approved}</Text>
            <Text style={[styles.td, { color: q.pending > 0 ? colors.warning : colors.textSecondary }]}>{q.pending}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Subject Coverage" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {subjectStats.map((s, i) => {
          const subjectColor = (colors as any)[s.colorKey] as string ?? colors.accent;
          const pct = Math.round((s.notes / s.total) * 100);
          return (
            <View key={s.name} style={[styles.subjectRow, i < subjectStats.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
              <View style={[styles.subjectIcon, { backgroundColor: `${subjectColor}22` }]}>
                <Ionicons name={s.icon as any} size={16} color={subjectColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.subjectMeta}>
                  <View>
                    <Text style={[styles.subjectName, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[styles.subjectExam, { color: colors.textSecondary }]}>{s.exams}</Text>
                  </View>
                  <Text style={[styles.subjectPct, { color: pct === 100 ? colors.accent : pct > 0 ? colors.warning : colors.danger }]}>
                    {s.notes}/{s.total}
                  </Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder }]}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: subjectColor }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function CBTTab() {
  const { colors } = useTheme();
  const totalSessions  = MOCK_CBT_SESSIONS.length;
  const avgScore       = Math.round(MOCK_CBT_SESSIONS.reduce((a, s) => a + s.score, 0) / totalSessions);
  const topScore       = Math.max(...MOCK_CBT_SESSIONS.map(s => s.score));
  const passRate       = MOCK_CBT_SESSIONS.filter(s => s.score >= 50).length;

  const scoreColor = (n: number) =>
    n >= 80 ? colors.accent : n >= 60 ? colors.warning : colors.danger;

  const subjectBreakdown = Array.from(
    MOCK_CBT_SESSIONS.reduce((map, s) => {
      const entry = map.get(s.subject) ?? { count: 0, totalScore: 0 };
      map.set(s.subject, { count: entry.count + 1, totalScore: entry.totalScore + s.score });
      return map;
    }, new Map<string, { count: number; totalScore: number }>())
  ).map(([subject, data]) => ({ subject, ...data, avg: Math.round(data.totalScore / data.count) }));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <SectionHeader title="CBT Analytics" />
      <View style={styles.statsGrid}>
        <StatCard icon="clipboard-outline"  value={totalSessions}    label="Sessions"   color={colors.accent} />
        <StatCard icon="trending-up"        value={`${avgScore}%`}   label="Avg Score"  color={colors.blue} />
        <StatCard icon="trophy-outline"     value={`${topScore}%`}   label="Top Score"  color={colors.warning} />
        <StatCard icon="checkmark-done"     value={`${passRate}/${totalSessions}`} label="Passed" color={colors.orange} />
      </View>

      <SectionHeader title="By Subject" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {subjectBreakdown.map((row, i) => (
          <View key={row.subject} style={[styles.rowItem, i < subjectBreakdown.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{row.subject}</Text>
            <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{row.count} session{row.count !== 1 ? 's' : ''}</Text>
            <Text style={[styles.rowValue, { color: scoreColor(row.avg) }]}>{row.avg}%</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Recent Sessions" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <View style={[styles.tableHeader, { borderBottomColor: colors.surfaceBorder }]}>
          <Text style={[styles.th, { color: colors.textSecondary, flex: 0, width: 55 }]}>Date</Text>
          <Text style={[styles.th, { color: colors.textSecondary, flex: 2 }]}>Subject</Text>
          <Text style={[styles.th, { color: colors.textSecondary }]}>User</Text>
          <Text style={[styles.th, { color: colors.textSecondary }]}>Score</Text>
          <Text style={[styles.th, { color: colors.textSecondary }]}>Time</Text>
        </View>
        {MOCK_CBT_SESSIONS.map((s, i) => (
          <View key={i} style={[styles.tableRow, i < MOCK_CBT_SESSIONS.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
            <Text style={[styles.td, { color: colors.textSecondary, flex: 0, width: 55 }]}>{s.date}</Text>
            <Text style={[styles.td, { color: colors.text, flex: 2 }]}>{s.subject}</Text>
            <Text style={[styles.td, { color: colors.text }]}>{s.user}</Text>
            <Text style={[styles.td, { color: scoreColor(s.score) }]}>{s.score}%</Text>
            <Text style={[styles.td, { color: colors.textSecondary }]}>{s.duration}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function AnnouncementsTab() {
  const { colors } = useTheme();
  const [announcements, setAnnouncements] = useState(MOCK_ANNOUNCEMENTS);
  const [title, setTitle] = useState('');
  const [body, setBody]   = useState('');
  const [pinned, setPinned] = useState(false);
  const [composing, setComposing] = useState(false);

  const post = () => {
    if (!title.trim() || !body.trim()) return;
    const newItem = {
      id:     Date.now().toString(),
      title:  title.trim(),
      body:   body.trim(),
      date:   'Just now',
      pinned,
    };
    setAnnouncements(prev => [newItem, ...prev]);
    setTitle('');
    setBody('');
    setPinned(false);
    setComposing(false);
  };

  const remove = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0 }]}>Announcements</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
          onPress={() => setComposing(!composing)}
        >
          <Ionicons name={composing ? 'close' : 'add'} size={18} color="#fff" />
          <Text style={styles.addBtnText}>{composing ? 'Cancel' : 'New'}</Text>
        </TouchableOpacity>
      </View>

      {composing && (
        <View style={[styles.composeCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
          <Text style={[styles.composeLabel, { color: colors.textSecondary }]}>Title</Text>
          <TextInput
            style={[styles.composeInput, { color: colors.text, borderColor: colors.surfaceBorder }]}
            placeholder="Announcement title…"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <Text style={[styles.composeLabel, { color: colors.textSecondary }]}>Message</Text>
          <TextInput
            style={[styles.composeTextarea, { color: colors.text, borderColor: colors.surfaceBorder }]}
            placeholder="Write your message here…"
            placeholderTextColor={colors.textSecondary}
            value={body}
            onChangeText={setBody}
            multiline
            numberOfLines={4}
          />
          <View style={styles.pinnedRow}>
            <Text style={[styles.composeLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Pin to top</Text>
            <Switch
              value={pinned}
              onValueChange={setPinned}
              trackColor={{ false: colors.surfaceBorder, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity
            style={[styles.postBtn, { backgroundColor: !title.trim() || !body.trim() ? colors.surfaceBorder : colors.accent }]}
            onPress={post}
            disabled={!title.trim() || !body.trim()}
          >
            <Ionicons name="send" size={16} color="#fff" />
            <Text style={styles.postBtnText}>Post Announcement</Text>
          </TouchableOpacity>
        </View>
      )}

      {announcements.map((a, i) => (
        <View key={a.id} style={[styles.announcementCard, { backgroundColor: colors.surface, borderColor: a.pinned ? colors.accent : colors.surfaceBorder }]}>
          <View style={styles.annHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {a.pinned && <Ionicons name="pin" size={12} color={colors.accent} />}
                <Text style={[styles.annTitle, { color: colors.text }]}>{a.title}</Text>
              </View>
              <Text style={[styles.annDate, { color: colors.textSecondary }]}>{a.date}</Text>
            </View>
            <TouchableOpacity onPress={() => remove(a.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.annBody, { color: colors.textSecondary }]}>{a.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function SettingsTab({ onSignOut }: { onSignOut: () => void }) {
  const { colors } = useTheme();
  const [maintenanceMode,  setMaintenanceMode]  = useState(false);
  const [emailNotifs,      setEmailNotifs]      = useState(true);
  const [guestAccess,      setGuestAccess]      = useState(true);
  const [autoApprove,      setAutoApprove]      = useState(false);
  const [leaderboard,      setLeaderboard]      = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const toggleRow = (label: string, value: boolean, onChange: (v: boolean) => void, danger?: boolean) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.surfaceBorder }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.settingLabel, { color: danger ? colors.danger : colors.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceBorder, true: danger ? colors.danger : colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      <SectionHeader title="App Configuration" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {toggleRow('Maintenance Mode', maintenanceMode, setMaintenanceMode, true)}
        {toggleRow('Email Notifications', emailNotifs, setEmailNotifs)}
        {toggleRow('Guest Access', guestAccess, setGuestAccess)}
        {toggleRow('Auto-Approve Questions', autoApprove, setAutoApprove)}
        {toggleRow('Leaderboard Visible', leaderboard, setLeaderboard)}
        <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Analytics Collection</Text>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
            trackColor={{ false: colors.surfaceBorder, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <SectionHeader title="System Info" />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        {[
          { label: 'Admin Email',   value: ADMIN_EMAIL },
          { label: 'Platform',      value: Platform.OS },
          { label: 'App Version',   value: '1.0.0' },
          { label: 'Total Subjects',value: String(SUBJECTS.length) },
          { label: 'DB Status',     value: 'Connected' },
          { label: 'Supabase',      value: 'sloeeapbspnxoedkgnah' },
        ].map((item, i, arr) => (
          <View key={item.label} style={[styles.infoRow, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Danger Zone" />
      <View style={[styles.card, { backgroundColor: `${colors.danger}12`, borderColor: `${colors.danger}44` }]}>
        {[
          { icon: 'refresh-outline',    label: 'Clear All Cache',          color: colors.orange },
          { icon: 'download-outline',   label: 'Export User Data (CSV)',    color: colors.blue },
          { icon: 'cloud-upload',       label: 'Force Sync Questions',      color: colors.warning },
        ].map(item => (
          <TouchableOpacity key={item.label} style={[styles.dangerRow, { borderBottomColor: `${colors.danger}33` }]}>
            <Ionicons name={item.icon as any} size={18} color={item.color} />
            <Text style={[styles.dangerLabel, { color: item.color }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.dangerRow, { borderBottomWidth: 0 }]} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.dangerLabel, { color: colors.danger }]}>Sign Out of Admin Panel</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
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
      case 'users':         return <UsersTab />;
      case 'content':       return <ContentTab />;
      case 'cbt':           return <CBTTab />;
      case 'announcements': return <AnnouncementsTab />;
      case 'settings':      return <SettingsTab onSignOut={handleSignOut} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
        <TouchableOpacity onPress={handleExitAdmin} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Panel</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{ADMIN_EMAIL}</Text>
        </View>
        <View style={[styles.adminBadge, { backgroundColor: colors.accentDim }]}>
          <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
          <Text style={[styles.adminBadgeText, { color: colors.accent }]}>Admin</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabBar, { borderBottomColor: colors.surfaceBorder }]}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, active && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons name={tab.icon as any} size={16} color={active ? colors.accent : colors.textSecondary} />
              <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.textSecondary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ flex: 1 }}>
        {renderTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1 },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  backBtn:           { padding: 4 },
  headerTitle:       { fontSize: 18, fontFamily: Fonts.bold },
  headerSub:         { fontSize: 11, fontFamily: Fonts.regular },
  adminBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  adminBadgeText:    { fontSize: 12, fontFamily: Fonts.semiBold },
  tabBar:            { borderBottomWidth: 1, flexGrow: 0 },
  tabBarContent:     { paddingHorizontal: Spacing.md },
  tabBtn:            { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: 12, marginRight: 4 },
  tabLabel:          { fontSize: 13, fontFamily: Fonts.medium },
  tabContent:        { padding: Spacing.md, paddingBottom: 60 },
  sectionTitle:      { fontSize: 15, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm, marginTop: Spacing.md },
  sectionHeaderRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm, marginTop: Spacing.md },
  statsGrid:         { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  card:              { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.sm, overflow: 'hidden' },
  rowItem:           { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  rowLabel:          { flex: 1, fontSize: 14, fontFamily: Fonts.medium },
  rowSub:            { fontSize: 12, fontFamily: Fonts.regular },
  rowValue:          { fontSize: 14, fontFamily: Fonts.bold, minWidth: 50, textAlign: 'right' },
  examBadge:         { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full, minWidth: 56, alignItems: 'center' },
  examBadgeText:     { fontSize: 12, fontFamily: Fonts.semiBold },
  progressBg:        { height: 6, borderRadius: Radius.full, marginTop: 4 },
  progressFill:      { height: 6, borderRadius: Radius.full },
  activityRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  activityIcon:      { width: 32, height: 32, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  activityMsg:       { flex: 1, fontSize: 12, fontFamily: Fonts.regular },
  activityTime:      { fontSize: 11, fontFamily: Fonts.regular },
  searchBar:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md, height: 44, marginBottom: Spacing.sm },
  searchInput:       { flex: 1, fontSize: 14, fontFamily: Fonts.regular },
  filterRow:         { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  filterChip:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.07)' },
  filterChipText:    { fontSize: 12, fontFamily: Fonts.medium },
  userCard:          { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.sm },
  avatar:            { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText:        { fontSize: 18, fontFamily: Fonts.bold },
  userRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  userName:          { fontSize: 15, fontFamily: Fonts.semiBold },
  userEmail:         { fontSize: 12, fontFamily: Fonts.regular, marginTop: 1 },
  userMeta:          { flexDirection: 'row', gap: Spacing.md, marginTop: 4 },
  metaText:          { fontSize: 11, fontFamily: Fonts.regular },
  metaScore:         { fontSize: 12, fontFamily: Fonts.bold },
  statusBadge:       { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  statusText:        { fontSize: 10, fontFamily: Fonts.semiBold },
  emptyState:        { alignItems: 'center', paddingVertical: 40, gap: Spacing.sm },
  emptyText:         { fontSize: 14, fontFamily: Fonts.regular },
  tableHeader:       { flexDirection: 'row', padding: Spacing.sm, borderBottomWidth: 1 },
  tableRow:          { flexDirection: 'row', padding: Spacing.sm },
  th:                { flex: 1, fontSize: 11, fontFamily: Fonts.semiBold, textAlign: 'center' },
  td:                { flex: 1, fontSize: 12, fontFamily: Fonts.regular, textAlign: 'center' },
  subjectRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md },
  subjectIcon:       { width: 34, height: 34, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  subjectMeta:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'flex-start' },
  subjectName:       { fontSize: 13, fontFamily: Fonts.medium },
  subjectExam:       { fontSize: 10, fontFamily: Fonts.regular },
  subjectPct:        { fontSize: 12, fontFamily: Fonts.semiBold },
  addBtn:            { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  addBtnText:        { color: '#fff', fontSize: 13, fontFamily: Fonts.semiBold },
  composeCard:       { borderRadius: Radius.lg, borderWidth: 1.5, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  composeLabel:      { fontSize: 12, fontFamily: Fonts.medium, marginBottom: 2 },
  composeInput:      { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, height: 44, fontSize: 14, fontFamily: Fonts.regular },
  composeTextarea:   { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, fontSize: 14, fontFamily: Fonts.regular, minHeight: 100, textAlignVertical: 'top' },
  pinnedRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, height: 46, borderRadius: Radius.full },
  postBtnText:       { color: '#fff', fontSize: 14, fontFamily: Fonts.semiBold },
  announcementCard:  { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
  annHeader:         { flexDirection: 'row', alignItems: 'flex-start' },
  annTitle:          { fontSize: 14, fontFamily: Fonts.semiBold },
  annDate:           { fontSize: 11, fontFamily: Fonts.regular, marginTop: 2 },
  annBody:           { fontSize: 13, fontFamily: Fonts.regular, lineHeight: 20 },
  deleteBtn:         { padding: 4 },
  settingRow:        { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  settingLabel:      { fontSize: 14, fontFamily: Fonts.medium },
  infoRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  infoLabel:         { fontSize: 13, fontFamily: Fonts.regular },
  infoValue:         { fontSize: 13, fontFamily: Fonts.medium, maxWidth: '60%' },
  dangerRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderBottomWidth: 1 },
  dangerLabel:       { flex: 1, fontSize: 14, fontFamily: Fonts.medium },
});
