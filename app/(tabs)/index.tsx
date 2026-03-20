import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const activity = [
  { icon: 'checkmark-circle', colorKey: 'accent' as const, text: 'Completed Kinematics Quiz (90%)' },
  { icon: 'book', colorKey: 'blue' as const, text: 'Read Organic Chemistry Intro' },
  { icon: 'close-circle', colorKey: 'danger' as const, text: 'Failed Calculus Mock Test 1' },
  { icon: 'checkmark-circle', colorKey: 'accent' as const, text: 'Completed Algebraic Fractions' },
];

const studyPath = [
  'Calculus — Differentiation',
  'Physics — Waves & Optics',
  'Chemistry — Electrolysis',
  'English — Lexis & Structure',
  'Mathematics — Matrices',
  'Physics — Electricity',
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const stats = [
    { icon: 'flame', iconLib: 'Ionicons', color: colors.orange, bg: colors.orangeDim, value: '14 Days', label: 'Study Streak' },
    { icon: 'shield-checkmark', iconLib: 'Ionicons', color: colors.accent, bg: colors.accentDim, value: '85%', label: 'JAMB Ready' },
    { icon: 'book-open-variant', iconLib: 'MaterialCommunityIcons', color: colors.blue, bg: colors.blueDim, value: '24', label: 'Topics Done' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + Spacing.md, paddingBottom: bottomPad + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Welcome back!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your exam readiness</Text>
        </View>
        <View style={[styles.avatarBg, { backgroundColor: colors.accentDim }]}>
          <Ionicons name="person" size={22} color={colors.accent} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
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
      </View>

      {/* Countdown */}
      <View style={[styles.countdownCard, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.countdownLabel, { color: colors.accent }]}>JAMB UTME 2026</Text>
          <Text style={[styles.countdownDays, { color: colors.text }]}>45 Days</Text>
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

      {/* Recent Activity */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        {activity.map((a, i) => (
          <View key={i} style={[styles.activityRow, { borderBottomColor: colors.surfaceBorder }]}>
            <Ionicons name={a.icon as any} size={18} color={colors[a.colorKey]} />
            <Text style={[styles.activityText, { color: colors.textSecondary }]}>{a.text}</Text>
          </View>
        ))}
      </View>

      {/* Study Path */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended Study Path</Text>
        <Text style={[styles.statLabel, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
          Based on your recent performance
        </Text>
        {studyPath.map((topic, i) => (
          <View key={i} style={styles.topicRow}>
            <View style={[styles.topicNum, { backgroundColor: colors.accentDim }]}>
              <Text style={[styles.topicNumText, { color: colors.accent }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.topicText, { color: colors.text }]}>{topic}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: 24, fontFamily: Fonts.bold },
  subtitle: { fontSize: 14, fontFamily: Fonts.regular, marginTop: 2 },
  avatarBg: { width: 44, height: 44, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: { flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, gap: Spacing.xs },
  statIcon: { width: 42, height: 42, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 16, fontFamily: Fonts.bold },
  statLabel: { fontSize: 11, fontFamily: Fonts.regular, textAlign: 'center' },
  countdownCard: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  countdownLabel: { fontSize: 12, fontFamily: Fonts.medium, marginBottom: 2 },
  countdownDays: { fontSize: 32, fontFamily: Fonts.bold },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full },
  ctaBtnText: { fontSize: 13, fontFamily: Fonts.semiBold, color: '#000' },
  card: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.semiBold, marginBottom: Spacing.md },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  activityText: { fontSize: 14, fontFamily: Fonts.regular, flex: 1 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  topicNum: { width: 28, height: 28, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
  topicNumText: { fontSize: 12, fontFamily: Fonts.bold },
  topicText: { fontSize: 14, fontFamily: Fonts.medium, flex: 1 },
});
