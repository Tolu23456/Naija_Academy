import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';

const examTypes = [
  {
    id: 'jamb',
    label: 'JAMB',
    title: 'JAMB CBT Simulator',
    desc: 'Simulate the real JAMB UTME computer-based test experience with timed conditions.',
    color: Colors.accent,
    dimColor: Colors.accentDim,
    icon: 'monitor-dashboard',
    primary: true,
  },
  {
    id: 'waec',
    label: 'WAEC',
    title: 'WAEC Obj & Theory',
    desc: 'Practice past questions sorted by year and topic. Objectives and essay format.',
    color: Colors.orange,
    dimColor: Colors.orangeDim,
    icon: 'file-document-outline',
    primary: false,
  },
  {
    id: 'neco',
    label: 'NECO',
    title: 'NECO Simulator',
    desc: 'Specialized past questions for the NECO curriculum and exam format.',
    color: Colors.blue,
    dimColor: Colors.blueDim,
    icon: 'school-outline',
    primary: false,
  },
];

const tips = [
  { icon: 'timer-outline', text: 'JAMB: 100 questions in 120 minutes' },
  { icon: 'check-circle-outline', text: 'Read all options before selecting' },
  { icon: 'flag-outline', text: 'Flag difficult questions and revisit' },
];

export default function ExamsScreen() {
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
      <Text style={styles.heading}>Mock Exams</Text>
      <Text style={styles.subheading}>Simulate real exam conditions</Text>

      {examTypes.map((exam) => (
        <TouchableOpacity
          key={exam.id}
          style={[styles.examCard, { backgroundColor: Colors.surface, borderColor: exam.primary ? exam.color : Colors.surfaceBorder }]}
          onPress={() => router.push('/cbt')}
          activeOpacity={0.8}
        >
          <View style={[styles.examBadge, { backgroundColor: exam.dimColor }]}>
            <MaterialCommunityIcons name={exam.icon as any} size={28} color={exam.color} />
          </View>
          <View style={styles.examInfo}>
            <View style={[styles.examLabel, { backgroundColor: exam.dimColor }]}>
              <Text style={[styles.examLabelText, { color: exam.color }]}>{exam.label}</Text>
            </View>
            <Text style={styles.examTitle}>{exam.title}</Text>
            <Text style={styles.examDesc}>{exam.desc}</Text>
          </View>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: exam.primary ? exam.color : 'transparent', borderColor: exam.color, borderWidth: exam.primary ? 0 : 1 }]}
            onPress={() => router.push('/cbt')}
          >
            <Text style={[styles.startBtnText, { color: exam.primary ? '#000' : exam.color }]}>
              {exam.primary ? 'Start' : 'Practice'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {/* Tips */}
      <View style={[styles.tipsCard, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder }]}>
        <Text style={styles.tipsTitle}>Exam Tips</Text>
        {tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Ionicons name={tip.icon as any} size={16} color={Colors.warning} />
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.md },
  heading: { fontSize: 28, fontFamily: Fonts.bold, color: Colors.text },
  subheading: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.lg },
  examCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md,
  },
  examBadge: { width: 56, height: 56, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  examInfo: { flex: 1, gap: 4 },
  examLabel: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  examLabelText: { fontSize: 10, fontFamily: Fonts.bold, letterSpacing: 0.5 },
  examTitle: { fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.text },
  examDesc: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 17 },
  startBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  startBtnText: { fontSize: 13, fontFamily: Fonts.semiBold },
  tipsCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md },
  tipsTitle: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text, marginBottom: Spacing.sm },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  tipText: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, flex: 1 },
});
