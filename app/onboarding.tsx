import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { markOnboardingDone, saveAppMode } from '@/lib/onboarding';

const slides = [
  {
    icon: 'school',
    iconLib: 'Ionicons',
    title: 'Welcome to\nNaijaAcademy',
    subtitle: 'Your all-in-one study companion for JAMB UTME, WAEC, and NECO. Ace your exams with confidence.',
    accentKey: 'accent' as const,
    dimKey: 'accentDim' as const,
    type: 'info',
  },
  {
    icon: 'trophy',
    iconLib: 'Ionicons',
    title: 'Study Smarter,\nNot Harder',
    subtitle: 'Track your progress, identify weak areas, and follow a personalised study path built just for you.',
    accentKey: 'blue' as const,
    dimKey: 'blueDim' as const,
    type: 'info',
  },
  {
    icon: 'rocket',
    iconLib: 'MaterialCommunityIcons',
    title: 'Simulate Real\nExam Conditions',
    subtitle: 'Choose your subject, number of questions, time limit, and year — then test yourself under real conditions.',
    accentKey: 'orange' as const,
    dimKey: 'orangeDim' as const,
    type: 'info',
  },
  {
    icon: 'options',
    iconLib: 'Ionicons',
    title: 'How Do You Want\nTo Use The App?',
    subtitle: 'Choose your primary focus so we can tailor your experience.',
    accentKey: 'accent' as const,
    dimKey: 'accentDim' as const,
    type: 'mode',
  },
];

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<'study' | 'practice' | null>(null);
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const accent = colors[slide.accentKey];
  const dim = colors[slide.dimKey];

  const handleNext = () => {
    if (isLast) {
      const mode = selectedMode ?? 'study';
      saveAppMode(mode);
      markOnboardingDone();
      router.replace('/(tabs)');
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    saveAppMode('study');
    markOnboardingDone();
    router.replace('/(tabs)');
  };

  const canContinue = !isLast || selectedMode !== null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }]}>
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      {slide.type === 'mode' ? (
        <View style={styles.modeContainer}>
          <View style={[styles.iconRing, { backgroundColor: dim, borderColor: accent }]}>
            <View style={[styles.iconInner, { backgroundColor: accent }]}>
              <Ionicons name="options" size={52} color="#fff" />
            </View>
          </View>

          <View style={styles.textArea}>
            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{slide.subtitle}</Text>
          </View>

          <View style={styles.modeCards}>
            <TouchableOpacity
              style={[
                styles.modeCard,
                {
                  backgroundColor: selectedMode === 'study' ? colors.accentDim : colors.surface,
                  borderColor: selectedMode === 'study' ? colors.accent : colors.surfaceBorder,
                },
              ]}
              onPress={() => setSelectedMode('study')}
              activeOpacity={0.8}
            >
              <View style={[styles.modeIcon, { backgroundColor: selectedMode === 'study' ? colors.accentDim : colors.surfaceBorder }]}>
                <Ionicons name="book-outline" size={32} color={selectedMode === 'study' ? colors.accent : colors.textSecondary} />
              </View>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Study & Learn</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Read lesson notes, follow study paths, and build your knowledge topic by topic.
              </Text>
              {selectedMode === 'study' && (
                <View style={[styles.modeBadge, { backgroundColor: colors.accent }]}>
                  <Ionicons name="checkmark" size={12} color="#000" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                {
                  backgroundColor: selectedMode === 'practice' ? colors.orangeDim : colors.surface,
                  borderColor: selectedMode === 'practice' ? colors.orange : colors.surfaceBorder,
                },
              ]}
              onPress={() => setSelectedMode('practice')}
              activeOpacity={0.8}
            >
              <View style={[styles.modeIcon, { backgroundColor: selectedMode === 'practice' ? colors.orangeDim : colors.surfaceBorder }]}>
                <MaterialCommunityIcons name="pencil-box-outline" size={32} color={selectedMode === 'practice' ? colors.orange : colors.textSecondary} />
              </View>
              <Text style={[styles.modeTitle, { color: colors.text }]}>Past Questions</Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary }]}>
                Practise with JAMB, WAEC, NECO, and Common Entrance past questions under timed conditions.
              </Text>
              {selectedMode === 'practice' && (
                <View style={[styles.modeBadge, { backgroundColor: colors.orange }]}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.illustrationArea}>
            <View style={[styles.iconRing, { backgroundColor: dim, borderColor: accent }]}>
              <View style={[styles.iconInner, { backgroundColor: accent }]}>
                {slide.iconLib === 'Ionicons'
                  ? <Ionicons name={slide.icon as any} size={52} color="#fff" />
                  : <MaterialCommunityIcons name={slide.icon as any} size={52} color="#fff" />
                }
              </View>
            </View>
          </View>

          <View style={styles.textArea}>
            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{slide.subtitle}</Text>
          </View>
        </>
      )}

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === step ? accent : colors.surfaceBorder, width: i === step ? 24 : 8 },
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: canContinue ? accent : colors.surfaceBorder }]}
        onPress={handleNext}
        activeOpacity={0.85}
        disabled={!canContinue}
      >
        <Text style={[styles.nextBtnText, { color: canContinue ? '#fff' : colors.textSecondary }]}>
          {isLast ? "Let's Go!" : 'Next'}
        </Text>
        <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={18} color={canContinue ? '#fff' : colors.textSecondary} />
      </TouchableOpacity>

      <Text style={[styles.stepCount, { color: colors.textSecondary }]}>{step + 1} of {slides.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg },
  skipBtn: { alignSelf: 'flex-end', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  skipText: { fontSize: 14, fontFamily: Fonts.medium },
  illustrationArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modeContainer: { flex: 1, width: '100%', alignItems: 'center', gap: Spacing.md },
  iconRing: {
    width: 160, height: 160, borderRadius: 80, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md,
  },
  iconInner: {
    width: 112, height: 112, borderRadius: 56,
    justifyContent: 'center', alignItems: 'center',
  },
  textArea: { alignItems: 'center', paddingHorizontal: Spacing.sm },
  title: { fontSize: 28, fontFamily: Fonts.bold, textAlign: 'center', lineHeight: 36, marginBottom: Spacing.sm },
  subtitle: { fontSize: 14, fontFamily: Fonts.regular, textAlign: 'center', lineHeight: 21 },
  modeCards: { flexDirection: 'row', gap: Spacing.sm, width: '100%' },
  modeCard: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1.5,
    alignItems: 'center', gap: Spacing.sm, position: 'relative',
  },
  modeIcon: { width: 60, height: 60, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  modeTitle: { fontSize: 14, fontFamily: Fonts.bold, textAlign: 'center' },
  modeDesc: { fontSize: 11, fontFamily: Fonts.regular, textAlign: 'center', lineHeight: 16 },
  modeBadge: {
    position: 'absolute', top: -8, right: -8,
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: Spacing.md },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 16, paddingHorizontal: 40, borderRadius: Radius.full,
    width: '100%', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  nextBtnText: { fontSize: 16, fontFamily: Fonts.semiBold },
  stepCount: { fontSize: 12, fontFamily: Fonts.regular, marginBottom: Spacing.sm },
});
