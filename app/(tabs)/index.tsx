import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';

const stats = [
  { icon: 'flame', iconLib: 'Ionicons', color: Colors.orange, bg: Colors.orangeDim, value: '14 Days', label: 'Study Streak' },
  { icon: 'shield-checkmark', iconLib: 'Ionicons', color: Colors.accent, bg: Colors.accentDim, value: '85%', label: 'JAMB Ready' },
  { icon: 'book-open-variant', iconLib: 'MaterialCommunityIcons', color: Colors.blue, bg: Colors.blueDim, value: '24', label: 'Topics Done' },
];

const activity = [
  { icon: 'checkmark-circle', color: Colors.accent, text: 'Completed Kinematics Quiz (90%)' },
  { icon: 'book', color: Colors.blue, text: 'Read Organic Chemistry Intro' },
  { icon: 'close-circle', color: Colors.danger, text: 'Failed Calculus Mock Test 1' },
  { icon: 'checkmark-circle', color: Colors.accent, text: 'Completed Algebraic Fractions' },
];

const studyPath = [
  'Calculus — Differentiation',
  'Physics — Waves & Optics',
  'Chemistry — Electrolysis',
  'English — Lexis & Structure',
  'Mathematics — Matrices',
  'Physics — Electricity',
];

function StatCard({ icon, iconLib, color, bg, value, label }: typeof stats[0]) {
  return (
    <View style={[styles.statCard, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        {iconLib === 'Ionicons'
          ? <Ionicons name={icon as any} size={22} color={color} />
          : <MaterialCommunityIcons name={icon as any} size={22} color={color} />
        }
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad + Spacing.md, paddingBottom: bottomPad + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.subtitle}>Track your exam readiness</Text>
        </View>
        <View style={[styles.avatarBg, { backgroundColor: Colors.accentDim }]}>
          <Ionicons name="person" size={22} color={Colors.accent} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </View>

      {/* Countdown + CTA */}
      <View style={[styles.countdownCard, { backgroundColor: Colors.accentDim, borderColor: Colors.accent }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.countdownLabel}>JAMB UTME 2026</Text>
          <Text style={styles.countdownDays}>45 Days</Text>
          <Text style={[styles.statLabel, { marginTop: 2 }]}>until your exam</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: Colors.accent }]}
          onPress={() => router.push('/exams')}
        >
          <Ionicons name="play" size={14} color="#000" />
          <Text style={styles.ctaBtnText}>Daily Mock</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={[styles.card, { borderColor: Colors.surfaceBorder }]}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {activity.map((a, i) => (
          <View key={i} style={styles.activityRow}>
            <Ionicons name={a.icon as any} size={18} color={a.color} />
            <Text style={styles.activityText}>{a.text}</Text>
          </View>
        ))}
      </View>

      {/* Study Path */}
      <View style={[styles.card, { borderColor: Colors.surfaceBorder }]}>
        <Text style={styles.sectionTitle}>Recommended Study Path</Text>
        <Text style={[styles.statLabel, { marginBottom: Spacing.md }]}>
          Based on your recent performance
        </Text>
        {studyPath.map((topic, i) => (
          <View key={i} style={styles.topicRow}>
            <View style={[styles.topicNum, { backgroundColor: Colors.accentDim }]}>
              <Text style={[styles.topicNumText, { color: Colors.accent }]}>{i + 1}</Text>
            </View>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  greeting: { fontSize: 24, fontFamily: Fonts.bold, color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, marginTop: 2 },
  avatarBg: { width: 44, height: 44, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1, alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, gap: Spacing.xs,
  },
  statIcon: { width: 42, height: 42, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 16, fontFamily: Fonts.bold, color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' },
  countdownCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, borderWidth: 1,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  countdownLabel: { fontSize: 12, fontFamily: Fonts.medium, color: Colors.accent, marginBottom: 2 },
  countdownDays: { fontSize: 32, fontFamily: Fonts.bold, color: Colors.text },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.full },
  ctaBtnText: { fontSize: 13, fontFamily: Fonts.semiBold, color: '#000' },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.semiBold, color: Colors.text, marginBottom: Spacing.md },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
  activityText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, flex: 1 },
  topicRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  topicNum: { width: 28, height: 28, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
  topicNumText: { fontSize: 12, fontFamily: Fonts.bold },
  topicText: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.text, flex: 1 },
});
