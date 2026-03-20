import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getTopicSlugs } from '@/lib/lessonsData';

type Topic = { name: string; desc: string };

const subjectData: Record<string, { name: string; color: string; icon: string; desc: string; topics: Topic[] }> = {
  maths: {
    name: 'Mathematics',
    color: Colors.accent,
    icon: 'calculator',
    desc: 'From basic arithmetic to advanced calculus.',
    topics: [
      { name: 'Algebra', desc: 'Equations, expressions, functions' },
      { name: 'Geometry', desc: 'Shapes, angles, theorems' },
      { name: 'Statistics', desc: 'Data, probability, distributions' },
      { name: 'Trigonometry', desc: 'Sin, cos, tan and identities' },
      { name: 'Calculus', desc: 'Differentiation and integration' },
      { name: 'Matrices', desc: 'Matrix operations and determinants' },
    ],
  },
  physics: {
    name: 'Physics',
    color: Colors.orange,
    icon: 'magnet',
    desc: 'Understanding the mechanics of the universe.',
    topics: [
      { name: 'Kinematics', desc: 'Motion, velocity, acceleration' },
      { name: 'Dynamics', desc: "Newton's laws, forces, momentum" },
      { name: 'Projectile Motion', desc: '2D motion under gravity' },
      { name: 'Waves & Optics', desc: 'Wave properties, reflection, refraction' },
      { name: 'Electricity', desc: 'Current, voltage, resistance' },
      { name: 'Magnetism', desc: 'Magnetic fields and induction' },
      { name: 'Thermodynamics', desc: 'Heat, temperature, gas laws' },
    ],
  },
  chemistry: {
    name: 'Chemistry',
    color: Colors.warning,
    icon: 'flask',
    desc: 'Exploring matter and its transformations.',
    topics: [
      { name: 'Acids & Bases', desc: 'pH, neutralisation, salts' },
      { name: 'Organic Chemistry', desc: 'Hydrocarbons, functional groups' },
      { name: 'Stoichiometry', desc: 'Moles, ratios, equations' },
      { name: 'Electrochemistry', desc: 'Electrolysis, redox' },
      { name: 'Periodic Table', desc: 'Elements, groups, trends' },
    ],
  },
  biology: {
    name: 'Biology',
    color: '#50C878',
    icon: 'leaf',
    desc: 'The science of life and living organisms.',
    topics: [
      { name: 'Cell Biology', desc: 'Cell structure, mitosis, meiosis' },
      { name: 'Genetics', desc: 'Heredity, DNA, mutations' },
      { name: 'Ecology', desc: 'Ecosystems, food webs, conservation' },
      { name: 'Human Physiology', desc: 'Body systems and their functions' },
      { name: 'Plant Anatomy', desc: 'Photosynthesis, transpiration' },
    ],
  },
  english: {
    name: 'English Language',
    color: Colors.blue,
    icon: 'book',
    desc: 'Master comprehension, grammar, and oral skills.',
    topics: [
      { name: 'Comprehension', desc: 'Reading and inference skills' },
      { name: 'Essay Writing', desc: 'Formal and informal writing' },
      { name: 'Lexis & Structure', desc: 'Vocabulary and grammar rules' },
      { name: 'Oral English', desc: 'Phonetics and spoken English' },
    ],
  },
};

function topicSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function TopicCard({
  topic,
  color,
  subjectId,
  hasLesson,
  onPress,
}: {
  topic: Topic;
  color: string;
  subjectId: string;
  hasLesson: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.topicCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.topicInfo}>
        <View style={styles.topicNameRow}>
          <Text style={[styles.topicName, { color: colors.text }]}>{topic.name}</Text>
          {hasLesson && (
            <View style={[styles.lessonBadge, { backgroundColor: `${color}22` }]}>
              <Text style={[styles.lessonBadgeText, { color }]}>Notes</Text>
            </View>
          )}
        </View>
        <Text style={[styles.topicDesc, { color: colors.textSecondary }]}>{topic.desc}</Text>
        <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder }]}>
          <View style={[styles.progressFill, { width: '0%', backgroundColor: color }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>0% complete</Text>
      </View>
      <Ionicons
        name={hasLesson ? 'book-outline' : 'arrow-forward-circle-outline'}
        size={24}
        color={hasLesson ? color : colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const subject = subjectData[id as string] ?? subjectData['maths'];
  const subjectId = (id as string) ?? 'maths';

  const availableSlugs = new Set(getTopicSlugs(subjectId));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{subject.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: bottomPad + Spacing.xl }}
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.subjectIconBig, { backgroundColor: `${subject.color}22` }]}>
            <Ionicons name={subject.icon as any} size={32} color={subject.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subjectDesc, { color: colors.textSecondary }]}>{subject.desc}</Text>
            <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder }]}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: subject.color }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              0% overall · {subject.topics.length} topics
            </Text>
          </View>
        </View>

        <Text style={[styles.topicsHeading, { color: colors.text }]}>Topics</Text>
        {subject.topics.map((t, i) => {
          const slug = topicSlug(t.name);
          const hasLesson = availableSlugs.has(slug);
          return (
            <TopicCard
              key={i}
              topic={t}
              color={subject.color}
              subjectId={subjectId}
              hasLesson={hasLesson}
              onPress={() =>
                router.push({ pathname: '/lesson', params: { subject: subjectId, topic: slug } })
              }
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: 18, fontFamily: Fonts.semiBold },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.lg,
  },
  subjectIconBig: { width: 64, height: 64, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center' },
  subjectDesc: { fontSize: 13, fontFamily: Fonts.regular, marginBottom: Spacing.sm },
  topicsHeading: { fontSize: 18, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  topicInfo: { flex: 1, gap: 4 },
  topicNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topicName: { fontSize: 16, fontFamily: Fonts.semiBold },
  lessonBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  lessonBadgeText: { fontSize: 11, fontFamily: Fonts.semiBold },
  topicDesc: { fontSize: 12, fontFamily: Fonts.regular },
  progressBg: { height: 4, borderRadius: Radius.full, marginVertical: 4 },
  progressFill: { height: 4, borderRadius: Radius.full },
  progressText: { fontSize: 11, fontFamily: Fonts.regular },
});
