import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const STATS = [
  { label: 'Subjects', value: '17+' },
  { label: 'Lessons', value: '200+' },
  { label: 'Questions', value: '2000+' },
];

const LINKS = [
  { icon: 'globe-outline', label: 'Website', value: 'naijaacademy.app', url: 'https://naijaacademy.app' },
  { icon: 'logo-github', label: 'Source', value: 'GitHub', url: 'https://github.com' },
  { icon: 'shield-checkmark-outline', label: 'Privacy Policy', value: 'How we handle your data', url: 'https://naijaacademy.app/privacy' },
  { icon: 'document-text-outline', label: 'Terms of Service', value: 'Read the fine print', url: 'https://naijaacademy.app/terms' },
];

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const topPad = Platform.OS === 'web' ? 24 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const open = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + Spacing.xl }]}
      >
        <View style={styles.hero}>
          <View style={[styles.logo, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
            <Ionicons name="school" size={42} color={colors.accent} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>NaijaAcademy</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          <View style={[styles.tagBadge, { backgroundColor: colors.accentDim }]}>
            <Text style={[styles.tagText, { color: colors.accent }]}>Built in Nigeria 🇳🇬</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          NaijaAcademy is a comprehensive study platform built to help Nigerian secondary school students excel in JAMB UTME, WAEC, and NECO examinations — and beyond. Our mission is to make world-class learning accessible to every student, anywhere.
        </Text>

        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {STATS.map((s, i) => (
            <View
              key={s.label}
              style={[
                styles.statItem,
                i < STATS.length - 1 && { borderRightWidth: 1, borderRightColor: colors.surfaceBorder },
              ]}
            >
              <Text style={[styles.statValue, { color: colors.accent }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>What we offer</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {[
            { icon: 'book-outline', title: 'Structured lesson notes', sub: 'Curated for the latest JAMB, WAEC and NECO syllabi' },
            { icon: 'timer-outline', title: 'Real CBT mock exams', sub: 'Timed practice that mirrors the real exam' },
            { icon: 'analytics-outline', title: 'Personal progress tracking', sub: 'Streaks, weak topics, readiness scores' },
            { icon: 'cloud-offline-outline', title: 'Works on slow networks', sub: 'Cached lessons keep you studying offline' },
          ].map((f, i, arr) => (
            <View key={f.title} style={[styles.featureRow, i < arr.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentDim }]}>
                <Ionicons name={f.icon as any} size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
                <Text style={[styles.featureSub, { color: colors.textSecondary }]}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Links</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {LINKS.map((l, i) => (
            <TouchableOpacity
              key={l.label}
              style={[styles.featureRow, i < LINKS.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}
              onPress={() => open(l.url)}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.accentDim }]}>
                <Ionicons name={l.icon as any} size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{l.label}</Text>
                <Text style={[styles.featureSub, { color: colors.textSecondary }]}>{l.value}</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          Made with care for Nigerian students.{'\n'}© {new Date().getFullYear()} NaijaAcademy. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  headerTitle: { fontSize: 17, fontFamily: Fonts.semiBold },
  content: { paddingHorizontal: Spacing.md },
  hero: { alignItems: 'center', paddingVertical: Spacing.lg },
  logo: {
    width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', borderWidth: 2,
    marginBottom: Spacing.sm,
  },
  appName: { fontSize: 26, fontFamily: Fonts.bold },
  version: { fontSize: 13, fontFamily: Fonts.regular, marginTop: 4, marginBottom: Spacing.sm },
  tagBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  tagText: { fontSize: 12, fontFamily: Fonts.semiBold },
  description: {
    fontSize: 14, fontFamily: Fonts.regular, lineHeight: 22,
    textAlign: 'center', marginBottom: Spacing.md,
  },
  statsCard: {
    flexDirection: 'row', borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statValue: { fontSize: 22, fontFamily: Fonts.bold },
  statLabel: { fontSize: 11, fontFamily: Fonts.regular, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  card: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  featureIcon: { width: 36, height: 36, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 15, fontFamily: Fonts.medium },
  featureSub: { fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  footer: { fontSize: 12, fontFamily: Fonts.regular, textAlign: 'center', lineHeight: 18, marginTop: Spacing.md },
});
