import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { getSubject, SUBJECTS } from '@/lib/subjectsData';
import { getTopicSlugs } from '@/lib/lessonsData';
import { getSubjectProgress, SubjectProgress } from '@/lib/studyTracker';

function topicSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function SubjectScreen() {
  const { id }     = useLocalSearchParams<{ id: string }>();
  const router     = useRouter();
  const { colors } = useTheme();
  const insets     = useSafeAreaInsets();
  const topPad     = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad  = Platform.OS === 'web' ? 34 : 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [progress, setProgress] = useState<SubjectProgress | null>(null);

  const subjectId = (id as string) ?? SUBJECTS[0].id;
  const subject   = getSubject(subjectId) ?? SUBJECTS[0];
  const color     = colors[subject.colorKey];

  const availableSlugs = new Set(getTopicSlugs(subjectId));

  useEffect(() => {
    getSubjectProgress(subjectId, subject.topics.length).then(setProgress);
  }, [subjectId, subject.topics.length]);

  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subject.topics;
    return subject.topics.filter(t =>
      t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    );
  }, [searchQuery, subject.topics]);

  const notesCount    = subject.topics.filter(t => availableSlugs.has(topicSlug(t.name))).length;
  const userCompleted = progress?.completed ?? 0;
  const userPct       = progress?.pct ?? 0;

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
        keyboardShouldPersistTaps="handled"
      >
        {/* Subject summary card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.subjectIconBig, { backgroundColor: `${color}22` }]}>
            <Ionicons name={subject.icon as any} size={32} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.subjectDesc, { color: colors.textSecondary }]}>{subject.desc}</Text>

            {/* User progress bar */}
            <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder }]}>
              <View style={[styles.progressFill, {
                width: userPct > 0 ? `${userPct}%` as any : '0%',
                backgroundColor: color,
              }]} />
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {userCompleted > 0
                  ? `${userCompleted}/${subject.topics.length} studied (${userPct}%)`
                  : `${notesCount}/${subject.topics.length} notes available`}
              </Text>
              {subject.examTypes.map(e => (
                <View key={e} style={[styles.examBadge, { backgroundColor: `${color}22` }]}>
                  <Text style={[styles.examBadgeText, { color }]}>{e}</Text>
                </View>
              ))}
            </View>

            {/* Show both available and studied when we have user progress */}
            {userCompleted > 0 && (
              <Text style={[styles.availableText, { color: colors.textSecondary }]}>
                {notesCount} notes available
              </Text>
            )}
          </View>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={`Search ${subject.topics.length} topics...`}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.topicsHeading, { color: colors.text }]}>
          {searchQuery ? `${filteredTopics.length} result${filteredTopics.length !== 1 ? 's' : ''}` : 'Topics'}
        </Text>

        {filteredTopics.length === 0 ? (
          <View style={styles.emptySearch}>
            <Ionicons name="search-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No topics match "{searchQuery}"</Text>
          </View>
        ) : (
          filteredTopics.map((t, i) => {
            const slug      = topicSlug(t.name);
            const hasNotes  = availableSlugs.has(slug);
            const done      = progress?.completedSlugs.has(slug) ?? false;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.topicCard,
                  { backgroundColor: colors.surface, borderColor: done ? color : colors.surfaceBorder },
                  done && { borderLeftWidth: 3 },
                ]}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/lesson', params: { subject: subjectId, topic: slug } })}
              >
                <View style={styles.topicInfo}>
                  <View style={styles.topicNameRow}>
                    <Text style={[styles.topicName, { color: colors.text }]}>{t.name}</Text>
                    {hasNotes && !done && (
                      <View style={[styles.notesBadge, { backgroundColor: `${color}22` }]}>
                        <Text style={[styles.notesBadgeText, { color }]}>Notes</Text>
                      </View>
                    )}
                    {done && (
                      <View style={[styles.notesBadge, { backgroundColor: colors.accentDim }]}>
                        <Text style={[styles.notesBadgeText, { color: colors.accent }]}>Done</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.topicDesc, { color: colors.textSecondary }]}>{t.desc}</Text>
                </View>
                <Ionicons
                  name={done ? 'checkmark-circle' : (hasNotes ? 'book-outline' : 'arrow-forward-circle-outline')}
                  size={24}
                  color={done ? colors.accent : (hasNotes ? color : colors.textSecondary)}
                />
              </TouchableOpacity>
            );
          })
        )}
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
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md,
  },
  subjectIconBig: { width: 64, height: 64, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center' },
  subjectDesc:    { fontSize: 13, fontFamily: Fonts.regular, marginBottom: Spacing.sm },
  metaRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  examBadge:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full },
  examBadgeText:  { fontSize: 9, fontFamily: Fonts.bold, letterSpacing: 0.3 },
  availableText:  { fontSize: 11, fontFamily: Fonts.regular, marginTop: 3 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md,
    paddingVertical: 10, marginBottom: Spacing.md,
  },
  searchInput:    { flex: 1, fontSize: 15, fontFamily: Fonts.regular, padding: 0 },
  topicsHeading:  { fontSize: 16, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm,
  },
  topicInfo:      { flex: 1, gap: 4 },
  topicNameRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topicName:      { fontSize: 15, fontFamily: Fonts.semiBold, flex: 1 },
  notesBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  notesBadgeText: { fontSize: 11, fontFamily: Fonts.semiBold },
  topicDesc:      { fontSize: 12, fontFamily: Fonts.regular },
  progressBg:     { height: 4, borderRadius: Radius.full, marginVertical: 4 },
  progressFill:   { height: 4, borderRadius: Radius.full },
  progressText:   { fontSize: 11, fontFamily: Fonts.regular },
  emptySearch:    { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText:      { fontSize: 14, fontFamily: Fonts.regular, textAlign: 'center' },
});
