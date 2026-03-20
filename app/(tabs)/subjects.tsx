import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const subjects = [
  {
    id: 'maths',
    name: 'Mathematics',
    desc: 'Algebra, Calculus, Geometry & more',
    icon: 'calculator-outline',
    color: 'accent' as const,
    bg: 'accentDim' as const,
    topics: 6,
    topicNames: ['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics', 'Matrices'],
  },
  {
    id: 'physics',
    name: 'Physics',
    desc: 'Kinematics, Waves, Electricity & more',
    icon: 'flash-outline',
    color: 'orange' as const,
    bg: 'orangeDim' as const,
    topics: 7,
    topicNames: ['Kinematics', 'Dynamics', 'Waves & Optics', 'Electricity', 'Magnetism', 'Heat & Temperature', 'Quantum'],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    desc: 'Organic, Acids, Periodic Table & more',
    icon: 'flask-outline',
    color: 'warning' as const,
    bg: 'warningDim' as const,
    topics: 5,
    topicNames: ['Organic Chemistry', 'Acids & Bases', 'Periodic Table', 'Electrolysis', 'Redox Reactions'],
  },
  {
    id: 'biology',
    name: 'Biology',
    desc: 'Cell Biology, Genetics, Ecology & more',
    icon: 'leaf-outline',
    color: 'accent' as const,
    bg: 'accentDim' as const,
    topics: 5,
    topicNames: ['Cell Biology', 'Genetics', 'Ecology', 'Human Biology', 'Plant Biology'],
  },
  {
    id: 'english',
    name: 'English Language',
    desc: 'Comprehension, Grammar, Oral & more',
    icon: 'book-outline',
    color: 'blue' as const,
    bg: 'blueDim' as const,
    topics: 4,
    topicNames: ['Comprehension', 'Grammar', 'Lexis & Structure', 'Oral English'],
  },
];

const examFocus = [
  { id: 'waec', name: 'WAEC WASSCE', colorKey: 'warning' as const, bgKey: 'warningDim' as const },
  { id: 'neco', name: 'NECO Focus', colorKey: 'blue' as const, bgKey: 'blueDim' as const },
  { id: 'jamb', name: 'JAMB UTME', colorKey: 'accent' as const, bgKey: 'accentDim' as const },
];

export default function SubjectsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.topicNames.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  const matchedTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return {};
    const result: Record<string, string[]> = {};
    subjects.forEach((s) => {
      const hits = s.topicNames.filter((t) => t.toLowerCase().includes(q));
      if (hits.length > 0) result[s.id] = hits;
    });
    return result;
  }, [query]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + Spacing.md, paddingBottom: bottomPad + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.heading, { color: colors.text }]}>Subjects</Text>
      <Text style={[styles.subheading, { color: colors.textSecondary }]}>Choose a subject to study</Text>

      <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: colors.surfaceBorder }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search subjects or topics..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {query.length > 0 && (
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {filtered.length} {filtered.length === 1 ? 'subject' : 'subjects'} found
        </Text>
      )}

      {filtered.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Ionicons name="search" size={36} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No results</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Try a different topic or subject name</Text>
        </View>
      ) : (
        filtered.map((subject) => (
          <TouchableOpacity
            key={subject.id}
            style={[styles.subjectCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
            onPress={() => router.push({ pathname: '/subject/[id]', params: { id: subject.id } })}
            activeOpacity={0.8}
          >
            <View style={[styles.subjectIcon, { backgroundColor: colors[subject.bg] }]}>
              <Ionicons name={subject.icon as any} size={24} color={colors[subject.color]} />
            </View>
            <View style={styles.subjectInfo}>
              <Text style={[styles.subjectName, { color: colors.text }]}>{subject.name}</Text>
              <Text style={[styles.subjectDesc, { color: colors.textSecondary }]}>{subject.desc}</Text>
              <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceBorder }]}>
                <View style={[styles.progressBarFill, { width: '0%', backgroundColor: colors[subject.color] }]} />
              </View>
              <Text style={[styles.subjectMeta, { color: colors.textSecondary }]}>
                {subject.topics} topics · 0% complete
              </Text>
              {matchedTopics[subject.id] && (
                <View style={styles.matchedTopics}>
                  {matchedTopics[subject.id].map((t) => (
                    <View key={t} style={[styles.topicChip, { backgroundColor: colors[subject.bg] }]}>
                      <Text style={[styles.topicChipText, { color: colors[subject.color] }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ))
      )}

      {query.length === 0 && (
        <>
          <Text style={[styles.heading, { fontSize: 20, marginTop: Spacing.md, color: colors.text }]}>Exam Prep</Text>
          <View style={styles.examRow}>
            {examFocus.map((e) => (
              <View key={e.id} style={[styles.examChip, { backgroundColor: colors[e.bgKey], borderColor: colors[e.colorKey] }]}>
                <Text style={[styles.examChipText, { color: colors[e.colorKey] }]}>{e.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.md },
  heading: { fontSize: 28, fontFamily: Fonts.bold },
  subheading: { fontSize: 14, fontFamily: Fonts.regular, marginTop: 4, marginBottom: Spacing.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'web' ? 12 : 10, marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: Fonts.regular, outlineStyle: 'none' } as any,
  resultCount: { fontSize: 12, fontFamily: Fonts.regular, marginBottom: Spacing.sm },
  subjectCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  subjectIcon: { width: 52, height: 52, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  subjectInfo: { flex: 1, gap: 4 },
  subjectName: { fontSize: 16, fontFamily: Fonts.semiBold },
  subjectDesc: { fontSize: 12, fontFamily: Fonts.regular },
  progressBarBg: { height: 4, borderRadius: Radius.full, marginVertical: 4 },
  progressBarFill: { height: 4, borderRadius: Radius.full },
  subjectMeta: { fontSize: 11, fontFamily: Fonts.regular },
  matchedTopics: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  topicChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  topicChipText: { fontSize: 10, fontFamily: Fonts.semiBold },
  emptyState: {
    alignItems: 'center', padding: Spacing.xl, borderRadius: Radius.lg,
    borderWidth: 1, gap: Spacing.sm, marginTop: Spacing.md,
  },
  emptyTitle: { fontSize: 16, fontFamily: Fonts.semiBold },
  emptyDesc: { fontSize: 13, fontFamily: Fonts.regular, textAlign: 'center' },
  examRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  examChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  examChipText: { fontSize: 13, fontFamily: Fonts.semiBold },
});
