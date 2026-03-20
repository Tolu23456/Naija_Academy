import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const examTypes = [
  {
    id: 'JAMB',
    label: 'JAMB',
    title: 'JAMB CBT Simulator',
    desc: 'Simulate the real JAMB UTME computer-based test experience with timed conditions.',
    colorKey: 'accent' as const,
    dimKey: 'accentDim' as const,
    icon: 'monitor-dashboard',
    primary: true,
  },
  {
    id: 'WAEC',
    label: 'WAEC',
    title: 'WAEC Obj & Theory',
    desc: 'Practice past questions sorted by year and topic. Objectives and essay format.',
    colorKey: 'orange' as const,
    dimKey: 'orangeDim' as const,
    icon: 'file-document-outline',
    primary: false,
  },
  {
    id: 'NECO',
    label: 'NECO',
    title: 'NECO Simulator',
    desc: 'Specialized past questions for the NECO curriculum and exam format.',
    colorKey: 'blue' as const,
    dimKey: 'blueDim' as const,
    icon: 'school-outline',
    primary: false,
  },
  {
    id: 'ALL',
    label: 'Mixed',
    title: 'Mixed Practice',
    desc: 'Practice questions from all exam types combined for comprehensive revision.',
    colorKey: 'warning' as const,
    dimKey: 'warningDim' as const,
    icon: 'layers-outline',
    primary: false,
  },
];

const tips = [
  { icon: 'timer-outline', text: 'JAMB: 100 questions in 120 minutes (72s each)' },
  { icon: 'checkmark-circle-outline', text: 'Read all options carefully before selecting' },
  { icon: 'flag-outline', text: 'Answer easy questions first, then revisit hard ones' },
  { icon: 'calculator-outline', text: 'Use the review feature after each session' },
];

export default function ExamsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + Spacing.md, paddingBottom: bottomPad + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Mock Exams</Text>
      <Text style={[styles.subheading, { color: colors.textSecondary }]}>
        Simulate real exam conditions with customisable settings
      </Text>

      {examTypes.map((exam) => {
        const color = colors[exam.colorKey];
        const dim = colors[exam.dimKey];
        return (
          <TouchableOpacity
            key={exam.id}
            style={[
              styles.examCard,
              { backgroundColor: colors.surface, borderColor: exam.primary ? color : colors.surfaceBorder },
            ]}
            onPress={() => router.push({ pathname: '/exam-setup', params: { examType: exam.id } })}
            activeOpacity={0.8}
          >
            <View style={[styles.examBadge, { backgroundColor: dim }]}>
              <MaterialCommunityIcons name={exam.icon as any} size={28} color={color} />
            </View>
            <View style={styles.examInfo}>
              <View style={[styles.examLabel, { backgroundColor: dim }]}>
                <Text style={[styles.examLabelText, { color }]}>{exam.label}</Text>
              </View>
              <Text style={[styles.examTitle, { color: colors.text }]}>{exam.title}</Text>
              <Text style={[styles.examDesc, { color: colors.textSecondary }]}>{exam.desc}</Text>
            </View>
            <View style={[styles.startBtn, exam.primary ? { backgroundColor: color } : { borderColor: color, borderWidth: 1 }]}>
              <Text style={[styles.startBtnText, { color: exam.primary ? '#000' : color }]}>
                {exam.primary ? 'Start' : 'Go'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={[styles.tipsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>Exam Tips</Text>
        {tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Ionicons name={tip.icon as any} size={16} color={colors.warning} />
            <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.md },
  heading: { fontSize: 28, fontFamily: Fonts.bold },
  subheading: { fontSize: 14, fontFamily: Fonts.regular, marginTop: 4, marginBottom: Spacing.lg },
  examCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md,
  },
  examBadge: { width: 56, height: 56, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  examInfo: { flex: 1, gap: 4 },
  examLabel: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  examLabelText: { fontSize: 10, fontFamily: Fonts.bold, letterSpacing: 0.5 },
  examTitle: { fontSize: 15, fontFamily: Fonts.semiBold },
  examDesc: { fontSize: 12, fontFamily: Fonts.regular, lineHeight: 17 },
  startBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  startBtnText: { fontSize: 13, fontFamily: Fonts.semiBold },
  tipsCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md },
  tipsTitle: { fontSize: 16, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: 6 },
  tipText: { fontSize: 13, fontFamily: Fonts.regular, flex: 1, lineHeight: 19 },
});
