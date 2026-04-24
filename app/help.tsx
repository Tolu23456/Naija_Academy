import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const SUPPORT = [
  { icon: 'mail-outline', label: 'Email Us', value: 'support@naijaacademy.app', action: 'mailto:support@naijaacademy.app' },
  { icon: 'chatbubble-ellipses-outline', label: 'WhatsApp Community', value: 'Join our study group', action: 'https://wa.me/2348000000000' },
  { icon: 'logo-twitter', label: 'Twitter / X', value: '@naijaacademy', action: 'https://twitter.com/naijaacademy' },
  { icon: 'logo-instagram', label: 'Instagram', value: '@naijaacademy', action: 'https://instagram.com/naijaacademy' },
];

const RESOURCES = [
  { icon: 'book-outline', label: 'Study Tips', value: 'Read our exam prep guide' },
  { icon: 'play-circle-outline', label: 'How-To Videos', value: 'Watch tutorials on YouTube' },
  { icon: 'help-buoy-outline', label: 'FAQ', value: 'Frequently asked questions' },
  { icon: 'bug-outline', label: 'Report a Bug', value: 'Help us improve the app' },
];

const FAQS = [
  { q: 'Are the lessons aligned with the official syllabus?', a: 'Yes. Every lesson is curated to match the latest JAMB, WAEC, and NECO syllabi.' },
  { q: 'Can I use the app without internet?', a: 'Lessons are cached for 24 hours after first open, so you can keep studying with patchy or no data.' },
  { q: 'How do I reset my study streak?', a: 'Streaks are based on lessons or mock tests completed each day. Just keep showing up.' },
  { q: 'Is my progress synced across devices?', a: 'If you sign in, your progress is securely stored and follows you to any device.' },
];

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const topPad = Platform.OS === 'web' ? 24 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const open = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Could not open link', url);
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + Spacing.xl }]}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
          <Ionicons name="help-buoy" size={28} color={colors.accent} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={[styles.heroTitle, { color: colors.accent }]}>We're here to help</Text>
            <Text style={[styles.heroSub, { color: colors.accent }]}>Reach out any time — we usually reply within 24 hours.</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Contact us</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {SUPPORT.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.row, i < SUPPORT.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}
              onPress={() => open(item.action)}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: colors.accentDim }]}>
                <Ionicons name={item.icon as any} size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{item.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Resources</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {RESOURCES.map((item, i) => (
            <View
              key={item.label}
              style={[styles.row, i < RESOURCES.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}
            >
              <View style={[styles.rowIcon, { backgroundColor: colors.accentDim }]}>
                <Ionicons name={item.icon as any} size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Frequently asked</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {FAQS.map((f, i) => (
            <View
              key={f.q}
              style={[styles.faqRow, i < FAQS.length - 1 && { borderBottomColor: colors.surfaceBorder, borderBottomWidth: 1 }]}
            >
              <Text style={[styles.faqQ, { color: colors.text }]}>{f.q}</Text>
              <Text style={[styles.faqA, { color: colors.textSecondary }]}>{f.a}</Text>
            </View>
          ))}
        </View>
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
  heroCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md,
  },
  heroTitle: { fontSize: 16, fontFamily: Fonts.semiBold },
  heroSub: { fontSize: 13, fontFamily: Fonts.regular, marginTop: 2, opacity: 0.85 },
  sectionTitle: { fontSize: 14, fontFamily: Fonts.semiBold, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  card: { borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  rowIcon: { width: 36, height: 36, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: 15, fontFamily: Fonts.medium },
  rowSub: { fontSize: 12, fontFamily: Fonts.regular, marginTop: 2 },
  faqRow: { padding: Spacing.md },
  faqQ: { fontSize: 14, fontFamily: Fonts.semiBold, marginBottom: 4 },
  faqA: { fontSize: 13, fontFamily: Fonts.regular, lineHeight: 19 },
});
