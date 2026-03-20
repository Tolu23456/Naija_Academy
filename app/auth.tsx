import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = Platform.OS === 'web'
        ? window.location.origin
        : 'naija-academy://auth/callback';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (e: any) {
      setError(e.message ?? 'Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }]}>
      {/* Logo area */}
      <View style={styles.topSection}>
        <View style={[styles.logoRing, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
          <View style={[styles.logoInner, { backgroundColor: colors.accent }]}>
            <Ionicons name="school" size={48} color="#fff" />
          </View>
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>NaijaAcademy</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Ace JAMB · WAEC · NECO
        </Text>
      </View>

      {/* Middle content */}
      <View style={styles.middleSection}>
        <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {[
            { icon: 'trophy-outline', text: 'Personalised study path' },
            { icon: 'timer-outline', text: 'Real CBT exam simulator' },
            { icon: 'trending-up-outline', text: 'Track your readiness score' },
          ].map((item) => (
            <View key={item.icon} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: colors.accentDim }]}>
                <Ionicons name={item.icon as any} size={18} color={colors.accent} />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Auth section */}
      <View style={styles.authSection}>
        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.dangerDim, borderColor: colors.danger }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.githubBtn, { backgroundColor: colors.text, opacity: loading ? 0.7 : 1 }]}
          onPress={handleGitHubSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Ionicons name="logo-github" size={22} color={colors.background} />
          )}
          <Text style={[styles.githubBtnText, { color: colors.background }]}>
            {loading ? 'Signing in…' : 'Continue with GitHub'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'space-between', paddingHorizontal: Spacing.lg },
  topSection: { alignItems: 'center', gap: Spacing.md },
  logoRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  logoInner: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: 32, fontFamily: Fonts.bold },
  tagline: { fontSize: 14, fontFamily: Fonts.regular },
  middleSection: { flex: 1, justifyContent: 'center', paddingVertical: Spacing.xl },
  featureCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureIcon: { width: 36, height: 36, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  featureText: { fontSize: 15, fontFamily: Fonts.medium, flex: 1 },
  authSection: { gap: Spacing.md },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  errorText: { fontSize: 13, fontFamily: Fonts.regular, flex: 1 },
  githubBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: 16, borderRadius: Radius.full,
  },
  githubBtnText: { fontSize: 16, fontFamily: Fonts.semiBold },
  disclaimer: { fontSize: 11, fontFamily: Fonts.regular, textAlign: 'center', lineHeight: 16 },
});
