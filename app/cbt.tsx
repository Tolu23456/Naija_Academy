import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import MathText from '@/components/MathText';
import cbtData from '@/cbt_questions.json';
import { saveUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/context/AuthContext';

type Question = { q: string; options: string[]; correct: number; year?: number; subject?: string };

type RawQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  exam_type?: string;
  year?: number;
  subject?: string;
};

function loadQuestions(params: {
  examType: string;
  subject: string;
  numQuestions: number;
  year: string;
}): Question[] {
  const { examType, subject, numQuestions, year } = params;
  const data = cbtData as Record<string, RawQuestion[]>;

  let all: Question[] = [];

  const subjectKeys = subject === 'all' ? Object.keys(data) : [subject];

  for (const key of subjectKeys) {
    const arr = data[key] ?? [];
    for (const item of arr) {
      if (examType !== 'ALL' && item.exam_type && item.exam_type !== examType) continue;
      if (year !== 'All' && item.year && String(item.year) !== year) continue;
      all.push({
        q: item.question,
        options: item.options,
        correct: item.answerIndex,
        year: item.year,
        subject: item.subject,
      });
    }
  }

  if (all.length === 0) {
    for (const key of Object.keys(data)) {
      const arr = data[key] ?? [];
      for (const item of arr) {
        all.push({
          q: item.question,
          options: item.options,
          correct: item.answerIndex,
          year: item.year,
          subject: item.subject,
        });
      }
    }
  }

  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(numQuestions, shuffled.length));
}

export default function CBTScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const params = useLocalSearchParams<{
    examType?: string;
    subject?: string;
    numQuestions?: string;
    timeMins?: string;
    year?: string;
  }>();

  const examType = params.examType ?? 'JAMB';
  const subject = params.subject ?? 'all';
  const numQuestions = parseInt(params.numQuestions ?? '40', 10);
  const timeMins = parseInt(params.timeMins ?? '60', 10);
  const year = params.year ?? 'All';

  const [questions] = useState<Question[]>(() =>
    loadQuestions({ examType, subject, numQuestions, year })
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(() =>
    new Array(questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(timeMins * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statsSaved = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    const updated = [...selectedAnswers];
    updated[currentQ] = idx;
    setSelectedAnswers(updated);
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let correct = 0;
    selectedAnswers.forEach((ans, i) => {
      if (ans === questions[i]?.correct) correct++;
    });
    const finalScore = correct;
    setScore(finalScore);
    setSubmitted(true);

    if (!statsSaved.current && user) {
      statsSaved.current = true;
      const pct = Math.round((finalScore / questions.length) * 100);
      try {
        await saveUserStats({
          avg_score: pct,
          recent_activity: [
            {
              icon: 'document-text-outline',
              colorKey: pct >= 70 ? 'accent' : pct >= 50 ? 'blue' : 'danger',
              text: `${examType} Mock: ${finalScore}/${questions.length} (${pct}%)`,
            },
          ] as any,
        });
      } catch {}
    }
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const scoreColor = pct >= 80 ? colors.accent : pct >= 50 ? colors.warning : colors.danger;
  const timerColor = timeLeft < 300 ? colors.danger : timeLeft < 600 ? colors.warning : colors.text;
  const timerBg = timeLeft < 300 ? colors.dangerDim : colors.surface;

  const subjectLabel =
    subject === 'all' ? 'Mixed' :
    subject === 'mathematics' ? 'Maths' :
    subject === 'english-language' ? 'English' :
    subject.charAt(0).toUpperCase() + subject.slice(1);

  if (submitted && !showReview) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.resultsCard}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{pct}%</Text>
          </View>
          <Text style={[styles.resultsTitle, { color: colors.text }]}>Exam Completed!</Text>
          <Text style={[styles.resultsDesc, { color: colors.textSecondary }]}>
            You scored {score} out of {questions.length} questions correctly.
          </Text>
          <Text style={[styles.resultsFeedback, { color: scoreColor }]}>
            {pct >= 80
              ? 'Excellent work! Keep it up.'
              : pct >= 50
              ? 'Good effort. Review weak topics.'
              : 'Keep practising — you can do it!'}
          </Text>

          <View style={[styles.statRow, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            {[
              { label: 'Correct', value: String(score), color: colors.accent },
              { label: 'Wrong', value: String(questions.length - score), color: colors.danger },
              { label: 'Score', value: `${pct}%`, color: scoreColor },
            ].map((s, i) => (
              <View key={i} style={[styles.statItem, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.surfaceBorder }]}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.reviewBtn, { borderColor: colors.surfaceBorder }]}
            onPress={() => setShowReview(true)}
          >
            <Ionicons name="eye-outline" size={18} color={colors.text} />
            <Text style={[styles.reviewBtnText, { color: colors.text }]}>Review Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: '#000' }]}>Back to Exams</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (submitted && showReview) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowReview(false)}>
            <Ionicons name="arrow-back" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Review Answers</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{score}/{questions.length}</Text>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 40 }}>
          {questions.map((q, qi) => {
            const selected = selectedAnswers[qi];
            const isCorrect = selected === q.correct;
            return (
              <View key={qi} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: isCorrect ? colors.accent : colors.danger }]}>
                <View style={styles.reviewHeader}>
                  <Ionicons name={isCorrect ? 'checkmark-circle' : 'close-circle'} size={20} color={isCorrect ? colors.accent : colors.danger} />
                  <Text style={[styles.reviewQNum, { color: colors.textSecondary }]}>Q{qi + 1}</Text>
                </View>
                <View style={{ marginBottom: 10 }}>
                  <MathText text={q.q} color={colors.text} fontSize={14} />
                </View>
                {q.options.map((opt, oi) => {
                  const isSelected = selected === oi;
                  const isAns = q.correct === oi;
                  const bg = isAns ? colors.accentDim : isSelected && !isAns ? colors.dangerDim : 'transparent';
                  const bc = isAns ? colors.accent : isSelected && !isAns ? colors.danger : colors.surfaceBorder;
                  return (
                    <View key={oi} style={[styles.reviewOption, { backgroundColor: bg, borderColor: bc }]}>
                      <Text style={[styles.reviewOptionLetter, { color: isAns ? colors.accent : isSelected ? colors.danger : colors.textSecondary }]}>
                        {String.fromCharCode(65 + oi)}.
                      </Text>
                      <View style={{ flex: 1 }}>
                        <MathText text={opt} color={isAns ? colors.accent : isSelected && !isAns ? colors.danger : colors.text} fontSize={13} />
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  const q = questions[currentQ];
  const isLast = currentQ === questions.length - 1;
  const answeredCount = selectedAnswers.filter((a) => a !== null).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{examType} · {subjectLabel}</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Q {currentQ + 1} of {questions.length} · {answeredCount} answered
          </Text>
        </View>
        <View style={[styles.timer, { backgroundColor: timerBg }]}>
          <Ionicons name="timer-outline" size={14} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <View style={[styles.progressBg, { backgroundColor: colors.surfaceBorder }]}>
        <View style={[styles.progressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` as any, backgroundColor: colors.accent }]} />
      </View>

      <ScrollView style={styles.questionArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {q?.year && (
          <View style={[styles.yearBadge, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.yearBadgeText, { color: colors.textSecondary }]}>{examType} {q.year}</Text>
          </View>
        )}

        <View style={{ marginBottom: Spacing.lg }}>
          <MathText text={q?.q ?? ''} color={colors.text} fontSize={17} />
        </View>

        {q?.options.map((opt, idx) => {
          const isSelected = selectedAnswers[currentQ] === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? colors.accentDim : colors.surface,
                  borderColor: isSelected ? colors.accent : colors.surfaceBorder,
                },
              ]}
              onPress={() => handleSelect(idx)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionLetter, {
                backgroundColor: isSelected ? colors.accent : colors.surface,
                borderColor: isSelected ? colors.accent : colors.surfaceBorder,
              }]}>
                <Text style={[styles.optionLetterText, { color: isSelected ? '#000' : colors.textSecondary }]}>
                  {String.fromCharCode(65 + idx)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <MathText text={opt} color={isSelected ? colors.text : colors.textSecondary} fontSize={15} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, opacity: currentQ === 0 ? 0.4 : 1 }]}
          onPress={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
        >
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={[styles.navBtnText, { color: colors.text }]}>Prev</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.danger, flex: 1, justifyContent: 'center', borderColor: colors.danger }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Submit Exam</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: colors.accent, flex: 1, justifyContent: 'center', borderColor: colors.accent }]}
            onPress={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))}
          >
            <Text style={[styles.navBtnText, { color: '#000' }]}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 14, fontFamily: Fonts.semiBold },
  headerSub: { fontSize: 11, fontFamily: Fonts.regular },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full },
  timerText: { fontSize: 14, fontFamily: Fonts.bold },
  progressBg: { height: 4, borderRadius: Radius.full, marginBottom: Spacing.md },
  progressFill: { height: 4, borderRadius: Radius.full },
  questionArea: { flex: 1 },
  yearBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, marginBottom: Spacing.md,
  },
  yearBadgeText: { fontSize: 11, fontFamily: Fonts.semiBold },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
  optionLetter: { width: 32, height: 32, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  optionLetterText: { fontSize: 13, fontFamily: Fonts.bold },
  navRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.md },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1 },
  navBtnText: { fontSize: 15, fontFamily: Fonts.semiBold },
  resultsCard: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  scoreText: { fontSize: 40, fontFamily: Fonts.bold },
  resultsTitle: { fontSize: 24, fontFamily: Fonts.bold },
  resultsDesc: { fontSize: 15, fontFamily: Fonts.regular, textAlign: 'center' },
  resultsFeedback: { fontSize: 16, fontFamily: Fonts.semiBold, textAlign: 'center' },
  statRow: { flexDirection: 'row', borderRadius: Radius.lg, borderWidth: 1, marginVertical: Spacing.sm, overflow: 'hidden', width: '100%' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statValue: { fontSize: 20, fontFamily: Fonts.bold },
  statLabel: { fontSize: 11, fontFamily: Fonts.regular },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full, borderWidth: 1, width: '100%', justifyContent: 'center' },
  reviewBtnText: { fontSize: 15, fontFamily: Fonts.semiBold },
  backBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full, width: '100%', alignItems: 'center' },
  backBtnText: { fontSize: 16, fontFamily: Fonts.semiBold },
  reviewCard: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reviewQNum: { fontSize: 12, fontFamily: Fonts.bold },
  reviewOption: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: Radius.sm, borderWidth: 1, marginBottom: 6 },
  reviewOptionLetter: { fontSize: 13, fontFamily: Fonts.bold, width: 20 },
});
