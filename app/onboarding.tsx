import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const ONBOARDING_KEY = 'naija_academy_onboarding_done';

export function markOnboardingDone() {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, '1');
    }
  } catch {}
}

export function isOnboardingDone(): boolean {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(ONBOARDING_KEY) === '1';
    }
  } catch {}
  return false;
}

const slides = [
  {
    icon: 'school',
    iconLib: 'Ionicons',
    title: 'Welcome to\nNaijaAcademy',
    subtitle: 'Your all-in-one study companion for JAMB UTME, WAEC, and NECO. Ace your exams with confidence.',
    accentKey: 'accent' as const,
    dimKey: 'accentDim' as const,
  },
  {
    icon: 'trophy',
    iconLib: 'Ionicons',
    title: 'Study Smarter,\nNot Harder',
    subtitle: 'Track your progress, identify weak areas, and follow a personalised study path built just for you.',
    accentKey: 'blue' as const,
    dimKey: 'blueDim' as const,
  },
  {
    icon: 'rocket',
    iconLib: 'MaterialCommunityIcons',
    title: 'Simulate Real\nExam Conditions',
    subtitle: 'Practice with thousands of past questions in a timed CBT environment. Get ready before exam day.',
    accentKey: 'orange' as const,
    dimKey: 'orangeDim' as const,
  },
];

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const isLast = step === slides.length - 1;

  const accent = colors[slide.accentKey];
  const dim = colors[slide.dimKey];

  const handleNext = () => {
    if (isLast) {
      markOnboardingDone();
      router.replace('/(tabs)');
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    markOnboardingDone();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }]}>
      {/* Skip */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Illustration area */}
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

      {/* Text content */}
      <View style={styles.textArea}>
        <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{slide.subtitle}</Text>
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === step ? accent : colors.surfaceBorder,
                width: i === step ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: accent }]}
        onPress={handleNext}
        activeOpacity={0.85}
      >
        <Text style={styles.nextBtnText}>{isLast ? "Let's Go!" : 'Next'}</Text>
        <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={18} color="#fff" />
      </TouchableOpacity>

      {/* Step count */}
      <Text style={[styles.stepCount, { color: colors.textSecondary }]}>{step + 1} of {slides.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg },
  skipBtn: { alignSelf: 'flex-end', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  skipText: { fontSize: 14, fontFamily: Fonts.medium },
  illustrationArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconRing: {
    width: 200, height: 200, borderRadius: 100, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  iconInner: {
    width: 140, height: 140, borderRadius: 70,
    justifyContent: 'center', alignItems: 'center',
  },
  textArea: { alignItems: 'center', paddingHorizontal: Spacing.sm, marginBottom: Spacing.lg },
  title: { fontSize: 32, fontFamily: Fonts.bold, textAlign: 'center', lineHeight: 40, marginBottom: Spacing.md },
  subtitle: { fontSize: 15, fontFamily: Fonts.regular, textAlign: 'center', lineHeight: 23 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: Spacing.lg },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 16, paddingHorizontal: 40, borderRadius: Radius.full,
    width: '100%', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  nextBtnText: { fontSize: 16, fontFamily: Fonts.semiBold, color: '#fff' },
  stepCount: { fontSize: 12, fontFamily: Fonts.regular, marginBottom: Spacing.sm },
});
