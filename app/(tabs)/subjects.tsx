import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';

const subjects = [
  {
    id: 'maths',
    name: 'Mathematics',
    desc: 'Algebra, Calculus, Geometry & more',
    icon: 'calculator',
    iconLib: 'Ionicons',
    color: Colors.accent,
    bg: Colors.accentDim,
    topics: 6,
    progress: 13,
  },
  {
    id: 'physics',
    name: 'Physics',
    desc: 'Kinematics, Waves, Electricity & more',
    icon: 'magnet',
    iconLib: 'Ionicons',
    color: Colors.orange,
    bg: Colors.orangeDim,
    topics: 7,
    progress: 17,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    desc: 'Organic, Acids, Periodic Table & more',
    icon: 'flask',
    iconLib: 'Ionicons',
    color: Colors.warning,
    bg: Colors.warningDim,
    topics: 5,
    progress: 0,
  },
  {
    id: 'biology',
    name: 'Biology',
    desc: 'Cell Biology, Genetics, Ecology & more',
    icon: 'leaf',
    iconLib: 'Ionicons',
    color: '#50C878',
    bg: 'rgba(80,200,120,0.15)',
    topics: 5,
    progress: 0,
  },
  {
    id: 'english',
    name: 'English Language',
    desc: 'Comprehension, Grammar, Oral & more',
    icon: 'book',
    iconLib: 'Ionicons',
    color: Colors.blue,
    bg: Colors.blueDim,
    topics: 4,
    progress: 0,
  },
];

const examFocus = [
  { id: 'waec', name: 'WAEC WASSCE', color: Colors.warning, bg: Colors.warningDim },
  { id: 'neco', name: 'NECO Focus', color: Colors.blue, bg: Colors.blueDim },
  { id: 'jamb', name: 'JAMB UTME', color: Colors.accent, bg: Colors.accentDim },
];

function SubjectCard({ subject }: { subject: typeof subjects[0] }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[styles.subjectCard, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder }]}
      onPress={() => router.push({ pathname: '/subject/[id]', params: { id: subject.id } })}
      activeOpacity={0.8}
    >
      <View style={[styles.subjectIcon, { backgroundColor: subject.bg }]}>
        <Ionicons name={subject.icon as any} size={24} color={subject.color} />
      </View>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{subject.name}</Text>
        <Text style={styles.subjectDesc}>{subject.desc}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${subject.progress}%` as any, backgroundColor: subject.color }]} />
        </View>
        <Text style={[styles.subjectMeta, { color: Colors.textSecondary }]}>{subject.topics} topics · {subject.progress}% complete</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function SubjectsScreen() {
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
      <Text style={styles.heading}>Subjects</Text>
      <Text style={styles.subheading}>Choose a subject to study</Text>

      {subjects.map((s) => <SubjectCard key={s.id} subject={s} />)}

      <Text style={[styles.heading, { fontSize: 20, marginTop: Spacing.md }]}>Exam Prep</Text>
      <View style={styles.examRow}>
        {examFocus.map((e) => (
          <View key={e.id} style={[styles.examChip, { backgroundColor: e.bg, borderColor: e.color }]}>
            <Text style={[styles.examChipText, { color: e.color }]}>{e.name}</Text>
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
  subjectCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  subjectIcon: { width: 52, height: 52, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  subjectInfo: { flex: 1, gap: 4 },
  subjectName: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text },
  subjectDesc: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary },
  progressBarBg: { height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: Radius.full, marginVertical: 4 },
  progressBarFill: { height: 4, borderRadius: Radius.full },
  subjectMeta: { fontSize: 11, fontFamily: Fonts.regular },
  examRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  examChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  examChipText: { fontSize: 13, fontFamily: Fonts.semiBold },
});
