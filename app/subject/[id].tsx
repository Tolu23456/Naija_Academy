import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';

type Topic = { name: string; progress: number; desc: string };

const subjectData: Record<string, { name: string; color: string; icon: string; desc: string; topics: Topic[] }> = {
  maths: {
    name: 'Mathematics',
    color: Colors.accent,
    icon: 'calculator',
    desc: 'From basic arithmetic to advanced calculus.',
    topics: [
      { name: 'Algebra', progress: 80, desc: 'Equations, expressions, functions' },
      { name: 'Geometry', progress: 30, desc: 'Shapes, angles, theorems' },
      { name: 'Statistics', progress: 0, desc: 'Data, probability, distributions' },
      { name: 'Trigonometry', progress: 0, desc: 'Sin, cos, tan and identities' },
      { name: 'Calculus', progress: 0, desc: 'Differentiation and integration' },
      { name: 'Matrices', progress: 0, desc: 'Matrix operations and determinants' },
    ],
  },
  physics: {
    name: 'Physics',
    color: Colors.orange,
    icon: 'magnet',
    desc: 'Understanding the mechanics of the universe.',
    topics: [
      { name: 'Kinematics', progress: 90, desc: 'Motion, velocity, acceleration' },
      { name: 'Dynamics', progress: 30, desc: "Newton's laws, forces, momentum" },
      { name: 'Projectile Motion', progress: 0, desc: '2D motion under gravity' },
      { name: 'Waves & Optics', progress: 0, desc: 'Wave properties, reflection, refraction' },
      { name: 'Electricity', progress: 0, desc: 'Current, voltage, resistance' },
      { name: 'Magnetism', progress: 0, desc: 'Magnetic fields and induction' },
      { name: 'Thermodynamics', progress: 0, desc: 'Heat, temperature, gas laws' },
    ],
  },
  chemistry: {
    name: 'Chemistry',
    color: Colors.warning,
    icon: 'flask',
    desc: 'Exploring matter and its transformations.',
    topics: [
      { name: 'Acids & Bases', progress: 0, desc: 'pH, neutralisation, salts' },
      { name: 'Organic Chemistry', progress: 0, desc: 'Hydrocarbons, functional groups' },
      { name: 'Stoichiometry', progress: 0, desc: 'Moles, ratios, equations' },
      { name: 'Electrochemistry', progress: 0, desc: 'Electrolysis, redox' },
      { name: 'Periodic Table', progress: 0, desc: 'Elements, groups, trends' },
    ],
  },
  biology: {
    name: 'Biology',
    color: '#50C878',
    icon: 'leaf',
    desc: 'The science of life and living organisms.',
    topics: [
      { name: 'Cell Biology', progress: 0, desc: 'Cell structure, mitosis, meiosis' },
      { name: 'Genetics', progress: 0, desc: 'Heredity, DNA, mutations' },
      { name: 'Ecology', progress: 0, desc: 'Ecosystems, food webs, conservation' },
      { name: 'Human Physiology', progress: 0, desc: 'Body systems and their functions' },
      { name: 'Plant Anatomy', progress: 0, desc: 'Photosynthesis, transpiration' },
    ],
  },
  english: {
    name: 'English Language',
    color: Colors.blue,
    icon: 'book',
    desc: 'Master comprehension, grammar, and oral skills.',
    topics: [
      { name: 'Comprehension', progress: 0, desc: 'Reading and inference skills' },
      { name: 'Essay Writing', progress: 0, desc: 'Formal and informal writing' },
      { name: 'Lexis & Structure', progress: 0, desc: 'Vocabulary and grammar rules' },
      { name: 'Oral English', progress: 0, desc: 'Phonetics and spoken English' },
    ],
  },
};

function TopicCard({ topic, color }: { topic: Topic; color: string }) {
  return (
    <TouchableOpacity
      style={[styles.topicCard, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder }]}
      activeOpacity={0.8}
    >
      <View style={styles.topicInfo}>
        <Text style={styles.topicName}>{topic.name}</Text>
        <Text style={styles.topicDesc}>{topic.desc}</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${topic.progress}%` as any, backgroundColor: color }]} />
        </View>
        <Text style={[styles.progressText, { color: Colors.textSecondary }]}>{topic.progress}% complete</Text>
      </View>
      <Ionicons name="arrow-forward-circle-outline" size={24} color={topic.progress > 0 ? color : Colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const subject = subjectData[id as string] ?? subjectData['maths'];
  const overallProgress = Math.round(
    subject.topics.reduce((acc, t) => acc + t.progress, 0) / subject.topics.length
  );

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subject.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: bottomPad + Spacing.xl }}
      >
        {/* Subject summary */}
        <View style={[styles.summaryCard, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder }]}>
          <View style={[styles.subjectIconBig, { backgroundColor: `${subject.color}22` }]}>
            <Ionicons name={subject.icon as any} size={32} color={subject.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subjectDesc}>{subject.desc}</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${overallProgress}%` as any, backgroundColor: subject.color }]} />
            </View>
            <Text style={[styles.progressText, { color: Colors.textSecondary }]}>
              {overallProgress}% overall · {subject.topics.length} topics
            </Text>
          </View>
        </View>

        <Text style={styles.topicsHeading}>Topics</Text>
        {subject.topics.map((t, i) => (
          <TopicCard key={i} topic={t} color={subject.color} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  headerTitle: { fontSize: 18, fontFamily: Fonts.semiBold, color: Colors.text },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.lg },
  subjectIconBig: { width: 64, height: 64, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center' },
  subjectDesc: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, marginBottom: Spacing.sm },
  topicsHeading: { fontSize: 18, fontFamily: Fonts.semiBold, color: Colors.text, marginBottom: Spacing.sm },
  topicCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  topicInfo: { flex: 1, gap: 4 },
  topicName: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text },
  topicDesc: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary },
  progressBg: { height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: Radius.full, marginVertical: 4 },
  progressFill: { height: 4, borderRadius: Radius.full },
  progressText: { fontSize: 11, fontFamily: Fonts.regular },
});
