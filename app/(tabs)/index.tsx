import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useUserStats } from '@/hooks/useUserStats';
import { JAMB_STUDY_PATH, getSubject } from '@/lib/subjectsData';
import { getTopicSlugs } from '@/lib/lessonsData';
import { FadeInView } from '@/components/FadeInView';

function daysUntilJamb(): number {
  const today = new Date();
  // JAMB UTME typically held in April each year
  const jamb  = new Date(today.getFullYear(), 3, 15);
  if (jamb < today) jamb.setFullYear(today.getFullYear() + 1);
  return Math.ceil((jamb.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors }                                              = useTheme();
  const { username, streak, topicsDone, avgScore, recentActivity } = useUserStats();
  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const readinessPct = avgScore > 0 ? `${Math.round(avgScore)}%` : '0%';
  const streakLabel  = streak === 1 ? '1 Day' : `${streak} Days`;
  const jambDays     = daysUntilJamb();
  const greeting     = streak > 0 ? `Welcome back, ${username}!` : `Welcome, ${username}!`;

  const stats = [
    { icon: 'flame',             iconLib: 'Ionicons',                color: colors.orange, bg: colors.orangeDim,  value: streakLabel,    label: 'Study Streak' },
    { icon: 'shield-checkmark',  iconLib: 'Ionicons',                color: colors.accent, bg: colors.accentDim,  value: readinessPct,   label: 'JAMB Ready'   },
    { icon: 'book-open-variant', iconLib: 'MaterialCommunityIcons',  color: colors.blue,   bg: colors.blueDim,    value: String(topicsDone), label: 'Topics Done' },
  ];

  // Build study path: use JAMB_STUDY_PATH if user just started, otherwise real subjects with notes
  const studyPath = JAMB_STUDY_PATH.map(item => {
    const subject = getSubject(item.subject);
    const slugs   = getTopicSlugs(item.subject);
    return {
      label:   `${subject?.name ?? item.subject} — ${item.topic}`,
      subject: item.subject,
      topic:   item.topic,
      hasNote: slugs.includes(item.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    };
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + Spacing.md, paddingBottom: bottomPad + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <FadeInView style={styles.header} duration={400} delay={0} slideFrom="top" distance={16}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.text }]} numberOfLines={1}>{greeting}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your exam readiness</Text>
        </View>
        <View style={[styles.avatarBg, { backgroundColor: colors.accentDim }]}>
          <Text style={[styles.avatarInitial, { color: colors.accent }]}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
      </FadeInView>

      {/* Stats Row */}
      <FadeInView style={styles.statsRow} duration={400} delay={80} slideFrom="bottom" distance={20}>
        {stats.map((s, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              {s.iconLib === 'Ionicons'
                ? <Ionicons name={s.icon as any} size={22} color={s.color} />
                : <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
              }
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </FadeInView>

      {/* JAMB Countdown */}
      <FadeInView duration={400} delay={160} slideFrom="bottom" distance={20}>
        <View style={[styles.countdownCard, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.countdownLabel, { color: colors.accent }]}>JAMB UTME 2026</Text>
            <Text style={[styles.countdownDays, { color: colors.text }]}>{jambDays} Days</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, marginTop: 2 }]}>until your exam</Text>
          </View>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/exams' as any)}
          >
            <Ionicons name="play" size={14} color="#000" />
            <Text style={styles.ctaBtnText}>Daily Mock</Text>
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* Recent Activity */}
      <FadeInView duration={400} delay={240} slideFrom="bottom" distance={20}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          {recentActivity.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No activity yet. Start a mock test or study a topic!
              </Text>
            </View>
          ) : (
            recentActivity.map((a, i) => (
              <View key={i} style={[styles.activityRow, { borderBottomColor: colors.surfaceBorder }]}>
                <Ionicons name={a.icon as any} size={18} color={colors[a.colorKey]} />
                <Text style={[styles.activityText, { color: colors.textSecondary }]}>{a.text}</Text>
              </View>
            ))
          )}
        </View>
      </FadeInView>

      {/* Recommended Study Path */}
      <FadeInView duration={400} delay={320} slideFrom="bottom" distance={20}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Study Path</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
            {topicsDone === 0
              ? 'Start here — great topics to kick off your JAMB prep'
              : 'Based on JAMB syllabus priorities'}
          </Text>
          {studyPath.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.topicRow}
              onPress={() =>
                router.push({
                  pathname: '/lesson',
                  params: {
                    subject: item.subject,
                    topic: item.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  },
                })
              }
            >
              <View style={[
                styles.topicNum,
                {
                  backgroundColor: i < topicsDone ? colors.accentDim : colors.surface,
                  borderColor: colors.surfaceBorder,
                  borderWidth: 1,
                },
              ]}>
                {i < topicsDone
                  ? <Ionicons name="checkmark" size={14} color={colors.accent} />
                  : <Text style={[styles.topicNumText, { color: colors.textSecondary }]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.topicText, { color: i < topicsDone ? colors.textSecondary : colors.text }]}>
                {item.label}
              </Text>
              {item.hasNote && (
                <Ionicons name="book-outline" size={14} color={colors.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  content:        { paddingHorizontal: Spacing.md },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting:       { fontSize: 22, fontFamily: Fonts.bold },
  subtitle:       { fontSize: 14, fontFamily: Fonts.regular, marginTop: 2 },
  avatarBg:       { width: 44, height: 44, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.sm },
  avatarInitial:  { fontSize: 20, fontFamily: Fonts.bold },
  statsRow:       { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard:       { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, gap: Spacing.xs },
  statIcon:       { width: 42, height: 42, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  statValue:      { fontSize: 16, fontFamily: Fonts.bold },
  statLabel:      { fontSize: 11, fontFamily: Fonts.regular, textAlign: 'center' },
  countdownCard:  { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  countdownLabel: { fontSize: 12, fontFamily: Fonts.medium, marginBottom: 2 },
  countdownDays:  { fontSize: 32, fontFamily: Fonts.bold },
  ctaBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full },
  ctaBtnText:     { fontSize: 13, fontFamily: Fonts.semiBold, color: '#000' },
  card:           { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  sectionTitle:   { fontSize: 18, fontFamily: Fonts.semiBold, marginBottom: Spacing.md },
  emptyState:     { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  emptyText:      { fontSize: 13, fontFamily: Fonts.regular, textAlign: 'center', lineHeight: 18 },
  activityRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  activityText:   { fontSize: 14, fontFamily: Fonts.regular, flex: 1 },
  topicRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  topicNum:       { width: 28, height: 28, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
  topicNumText:   { fontSize: 12, fontFamily: Fonts.bold },
  topicText:      { fontSize: 14, fontFamily: Fonts.medium, flex: 1 },
});
