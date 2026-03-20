import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const EXAM_TYPES = [
  { id: 'JAMB', label: 'JAMB UTME', icon: 'monitor-dashboard', colorKey: 'accent' as const },
  { id: 'WAEC', label: 'WAEC WASSCE', icon: 'file-document-outline', colorKey: 'orange' as const },
  { id: 'NECO', label: 'NECO', icon: 'school-outline', colorKey: 'blue' as const },
  { id: 'ALL', label: 'All Exams', icon: 'layers-outline', colorKey: 'warning' as const },
];

const SUBJECTS = [
  { id: 'all', label: 'All Subjects', icon: 'apps-outline' },
  { id: 'mathematics', label: 'Mathematics', icon: 'calculator-outline' },
  { id: 'physics', label: 'Physics', icon: 'flash-outline' },
  { id: 'chemistry', label: 'Chemistry', icon: 'flask-outline' },
  { id: 'biology', label: 'Biology', icon: 'leaf-outline' },
  { id: 'english-language', label: 'English Language', icon: 'book-outline' },
];

const QUESTION_COUNTS = [10, 20, 40, 60, 100];

const TIME_OPTIONS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hrs', value: 90 },
  { label: '2 hours', value: 120 },
];

const YEARS = ['All', '1999', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

type SectionProps = { title: string; children: React.ReactNode };

function Section({ title, children }: SectionProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function ExamSetupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [examType, setExamType] = useState('JAMB');
  const [subject, setSubject] = useState('all');
  const [numQuestions, setNumQuestions] = useState(40);
  const [timeMins, setTimeMins] = useState(60);
  const [year, setYear] = useState('All');

  const handleStart = () => {
    router.push({
      pathname: '/cbt',
      params: {
        examType,
        subject,
        numQuestions: String(numQuestions),
        timeMins: String(timeMins),
        year,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Exam Setup</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Section title="EXAM TYPE">
          <View style={styles.grid2}>
            {EXAM_TYPES.map((e) => {
              const isSelected = examType === e.id;
              const color = colors[e.colorKey];
              return (
                <TouchableOpacity
                  key={e.id}
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: isSelected ? `${color}22` : colors.surface,
                      borderColor: isSelected ? color : colors.surfaceBorder,
                    },
                  ]}
                  onPress={() => setExamType(e.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name={e.icon as any} size={22} color={isSelected ? color : colors.textSecondary} />
                  <Text style={[styles.gridLabel, { color: isSelected ? color : colors.text }]}>{e.label}</Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: color }]}>
                      <Ionicons name="checkmark" size={10} color="#000" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <Section title="SUBJECT">
          <View style={styles.grid2}>
            {SUBJECTS.map((s) => {
              const isSelected = subject === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: isSelected ? colors.accentDim : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.surfaceBorder,
                    },
                  ]}
                  onPress={() => setSubject(s.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={s.icon as any} size={22} color={isSelected ? colors.accent : colors.textSecondary} />
                  <Text style={[styles.gridLabel, { color: isSelected ? colors.accent : colors.text }]}>{s.label}</Text>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                      <Ionicons name="checkmark" size={10} color="#000" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <Section title="NUMBER OF QUESTIONS">
          <View style={styles.rowChips}>
            {QUESTION_COUNTS.map((n) => {
              const isSelected = numQuestions === n;
              return (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surface,
                      borderColor: isSelected ? colors.accent : colors.surfaceBorder,
                    },
                  ]}
                  onPress={() => setNumQuestions(n)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#000' : colors.text }]}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <Section title="TIME LIMIT">
          <View style={styles.rowChips}>
            {TIME_OPTIONS.map((t) => {
              const isSelected = timeMins === t.value;
              return (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.orange : colors.surface,
                      borderColor: isSelected ? colors.orange : colors.surfaceBorder,
                    },
                  ]}
                  onPress={() => setTimeMins(t.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#fff' : colors.text }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        <Section title="YEAR">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.sm, paddingVertical: 4 }}
          >
            {YEARS.map((y) => {
              const isSelected = year === y;
              return (
                <TouchableOpacity
                  key={y}
                  style={[
                    styles.yearChip,
                    {
                      backgroundColor: isSelected ? colors.blue : colors.surface,
                      borderColor: isSelected ? colors.blue : colors.surfaceBorder,
                    },
                  ]}
                  onPress={() => setYear(y)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#fff' : colors.text }]}>{y}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Section>

        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Session Summary</Text>
          <View style={styles.summaryRow}>
            <Ionicons name="document-text-outline" size={16} color={colors.accent} />
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              {numQuestions} {subject === 'all' ? 'mixed-subject' : subject} questions
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="timer-outline" size={16} color={colors.orange} />
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              {timeMins} minutes · ~{Math.round(timeMins * 60 / numQuestions)}s per question
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.blue} />
            <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
              {year === 'All' ? 'All years' : year} · {examType}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.startContainer, { backgroundColor: colors.background, borderTopColor: colors.surfaceBorder, paddingBottom: bottomPad + Spacing.md }]}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: colors.accent }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Ionicons name="play-circle" size={22} color="#000" />
          <Text style={styles.startBtnText}>Start Exam</Text>
        </TouchableOpacity>
      </View>
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
  content: { paddingHorizontal: Spacing.md },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 11, fontFamily: Fonts.bold, letterSpacing: 1, marginBottom: Spacing.sm },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gridCard: {
    width: '47.5%', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1,
    alignItems: 'flex-start', gap: 6, position: 'relative',
  },
  gridLabel: { fontSize: 13, fontFamily: Fonts.semiBold },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
  rowChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full, borderWidth: 1,
  },
  yearChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1,
  },
  chipText: { fontSize: 14, fontFamily: Fonts.semiBold },
  summaryCard: {
    borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md,
    gap: Spacing.sm, marginBottom: Spacing.md,
  },
  summaryTitle: { fontSize: 15, fontFamily: Fonts.semiBold, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  summaryText: { fontSize: 13, fontFamily: Fonts.regular },
  startContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 16, borderRadius: Radius.full,
  },
  startBtnText: { fontSize: 17, fontFamily: Fonts.bold, color: '#000' },
});
