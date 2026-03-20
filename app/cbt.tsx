import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme';
import cbtData from '@/cbt_questions.json';

type Question = { q: string; options: string[]; correct: number };

function loadQuestions(): Question[] {
  const all: Question[] = [];
  const data = cbtData as Record<string, { question: string; options: string[]; answerIndex: number }[]>;
  for (const subject in data) {
    data[subject].forEach((item) => {
      all.push({ q: item.question, options: item.options, correct: item.answerIndex });
    });
  }
  const shuffled = all.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
}

export default function CBTScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [questions] = useState<Question[]>(() => loadQuestions());
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(() => new Array(10).fill(null));
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    const updated = [...selectedAnswers];
    updated[currentQ] = idx;
    setSelectedAnswers(updated);
  };

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    let correct = 0;
    selectedAnswers.forEach((ans, i) => {
      if (ans === questions[i]?.correct) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const pct = Math.round((score / questions.length) * 100);
  const scoreColor = pct >= 80 ? Colors.accent : pct >= 50 ? Colors.warning : Colors.danger;
  const timerColor = timeLeft < 300 ? Colors.danger : timeLeft < 600 ? Colors.warning : Colors.text;

  if (submitted) {
    return (
      <View style={[styles.container, { paddingTop: topPad + Spacing.md, paddingBottom: bottomPad }]}>
        <View style={styles.resultsCard}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{pct}%</Text>
          </View>
          <Text style={styles.resultsTitle}>Exam Completed!</Text>
          <Text style={styles.resultsDesc}>
            You scored {score} out of {questions.length} questions correctly.
          </Text>
          <Text style={[styles.resultsFeedback, { color: scoreColor }]}>
            {pct >= 80 ? 'Excellent work! Keep it up.' : pct >= 50 ? 'Good effort. Review weak topics.' : 'Keep practising — you can do it!'}
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: Colors.accent }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backBtnText, { color: '#000' }]}>Back to Exams</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const q = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>JAMB CBT Mock</Text>
          <Text style={styles.headerSub}>Q {currentQ + 1} of {questions.length}</Text>
        </View>
        <View style={[styles.timer, { backgroundColor: timeLeft < 300 ? Colors.dangerDim : Colors.surface }]}>
          <Ionicons name="timer-outline" size={14} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` as any }]} />
      </View>

      {/* Question */}
      <ScrollView style={styles.questionArea} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{q?.q}</Text>

        {q?.options.map((opt, idx) => {
          const isSelected = selectedAnswers[currentQ] === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? Colors.accentDim : Colors.surface,
                  borderColor: isSelected ? Colors.accent : Colors.surfaceBorder,
                },
              ]}
              onPress={() => handleSelect(idx)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionLetter, { backgroundColor: isSelected ? Colors.accent : Colors.surface, borderColor: isSelected ? Colors.accent : Colors.surfaceBorder }]}>
                <Text style={[styles.optionLetterText, { color: isSelected ? '#000' : Colors.textSecondary }]}>
                  {String.fromCharCode(65 + idx)}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: isSelected ? Colors.text : Colors.textSecondary }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: Colors.surface, borderColor: Colors.surfaceBorder, opacity: currentQ === 0 ? 0.4 : 1 }]}
          onPress={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
        >
          <Ionicons name="arrow-back" size={18} color={Colors.text} />
          <Text style={styles.navBtnText}>Prev</Text>
        </TouchableOpacity>

        {isLast ? (
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: Colors.danger, flex: 1, justifyContent: 'center' }]} onPress={handleSubmit}>
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Submit Exam</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: Colors.accent, flex: 1, justifyContent: 'center' }]}
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
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text },
  headerSub: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full },
  timerText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  progressBg: { height: 4, backgroundColor: Colors.surfaceBorder, borderRadius: Radius.full, marginBottom: Spacing.lg },
  progressFill: { height: 4, backgroundColor: Colors.accent, borderRadius: Radius.full },
  questionArea: { flex: 1 },
  questionText: { fontSize: 17, fontFamily: Fonts.semiBold, color: Colors.text, lineHeight: 26, marginBottom: Spacing.lg },
  optionCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.sm },
  optionLetter: { width: 32, height: 32, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  optionLetterText: { fontSize: 13, fontFamily: Fonts.bold },
  optionText: { flex: 1, fontSize: 15, fontFamily: Fonts.regular, lineHeight: 21 },
  navRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.md },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1 },
  navBtnText: { fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.text },
  resultsCard: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xl },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  scoreText: { fontSize: 40, fontFamily: Fonts.bold },
  resultsTitle: { fontSize: 24, fontFamily: Fonts.bold, color: Colors.text },
  resultsDesc: { fontSize: 15, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' },
  resultsFeedback: { fontSize: 16, fontFamily: Fonts.semiBold, textAlign: 'center' },
  backBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radius.full, marginTop: Spacing.md },
  backBtnText: { fontSize: 16, fontFamily: Fonts.semiBold },
});
