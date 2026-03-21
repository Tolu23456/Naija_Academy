import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getSubject, SUBJECTS } from '@/lib/subjectsData';
import { getTopicSlugs } from '@/lib/lessonsData';

function topicSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function SubjectScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { colors } = useTheme();
  const insets  = useSafeAreaInsets();
  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const subjectId = (id as string) ?? SUBJECTS[0].id;
  const subject   = getSubject(subjectId) ?? SUBJECTS[0];
  const color     = colors[subject.colorKey];

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
        {/* Subject summary card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.subjectIconBig, { backgroundColor: `${color}22` }]}>
            <Ionicons name={subject.icon as any} size={32} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subjectDesc, { color: colors.textSecondary }]}>{subject.desc}</Text>
            <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder }]}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: color }]} />
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {subject.topics.length} topics
              </Text>
              {subject.examTypes.map(e => (
                <View key={e} style={[styles.examBadge, { backgroundColor: `${color}22` }]}>
                  <Text style={[styles.examBadgeText, { color }]}>{e}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={[styles.topicsHeading, { color: colors.text }]}>Topics</Text>

        {subject.topics.map((t, i) => {
          const slug     = topicSlug(t.name);
          const hasNotes = availableSlugs.has(slug);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.topicCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/lesson', params: { subject: subjectId, topic: slug } })}
            >
              <View style={styles.topicInfo}>
                <View style={styles.topicNameRow}>
                  <Text style={[styles.topicName, { color: colors.text }]}>{t.name}</Text>
                  {hasNotes && (
                    <View style={[styles.notesBadge, { backgroundColor: `${color}22` }]}>
                      <Text style={[styles.notesBadgeText, { color }]}>Notes</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.topicDesc, { color: colors.textSecondary }]}>{t.desc}</Text>
                <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder }]}>
                  <View style={[styles.progressFill, { width: '0%', backgroundColor: color }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>0% complete</Text>
              </View>
              <Ionicons
                name={hasNotes ? 'book-outline' : 'arrow-forward-circle-outline'}
                size={24}
                color={hasNotes ? color : colors.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  headerTitle:    { fontSize: 18, fontFamily: Fonts.semiBold },
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.lg,
  },
  subjectIconBig: { width: 64, height: 64, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center' },
  subjectDesc:    { fontSize: 13, fontFamily: Fonts.regular, marginBottom: Spacing.sm },
  metaRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  examBadge:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  examBadgeText:  { fontSize: 9, fontFamily: Fonts.bold, letterSpacing: 0.3 },
  topicsHeading:  { fontSize: 18, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  topicInfo:      { flex: 1, gap: 4 },
  topicNameRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topicName:      { fontSize: 16, fontFamily: Fonts.semiBold },
  notesBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  notesBadgeText: { fontSize: 11, fontFamily: Fonts.semiBold },
  topicDesc:      { fontSize: 12, fontFamily: Fonts.regular },
  progressBg:     { height: 4, borderRadius: Radius.full, marginVertical: 4 },
  progressFill:   { height: 4, borderRadius: Radius.full },
  progressText:   { fontSize: 11, fontFamily: Fonts.regular },
});
