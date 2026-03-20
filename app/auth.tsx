import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Platform, TextInput, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(null);
  };

  const switchMode = (next: Mode) => {
    resetForm();
    setMode(next);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!email.trim()) return setError('Please enter your email.');
    if (!password.trim()) return setError('Please enter your password.');
    if (mode === 'signup' && !username.trim()) return setError('Please enter a username.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      let err: string | null = null;
      if (mode === 'signin') {
        err = await signIn(email.trim(), password);
      } else {
        err = await signUp(email.trim(), password, username.trim());
        if (!err) {
          setSuccess('Account created! Check your email to confirm your account, then sign in.');
          setLoading(false);
          return;
        }
      }
      if (err) setError(err);
    } finally {
      setLoading(false);
    }
  };

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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.root,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.topSection}>
          <View style={[styles.logoRing, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
            <View style={[styles.logoInner, { backgroundColor: colors.accent }]}>
              <Ionicons name="school" size={40} color="#fff" />
            </View>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>NaijaAcademy</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Ace JAMB · WAEC · NECO</Text>
        </View>

        {/* Mode toggle */}
        <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.toggleBtn,
                mode === m && { backgroundColor: colors.accent },
              ]}
              onPress={() => switchMode(m)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.toggleText,
                { color: mode === m ? '#fff' : colors.textSecondary },
              ]}>
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Feedback */}
          {error && (
            <View style={[styles.feedbackBox, { backgroundColor: colors.dangerDim, borderColor: colors.danger }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={[styles.feedbackText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}
          {success && (
            <View style={[styles.feedbackBox, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
              <Ionicons name="checkmark-circle-outline" size={16} color={colors.accent} />
              <Text style={[styles.feedbackText, { color: colors.accent }]}>{success}</Text>
            </View>
          )}

          {/* Username (sign up only) */}
          {mode === 'signup' && (
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {/* Email */}
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email address"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.accent, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.surfaceBorder }]} />
          </View>

          {/* GitHub */}
          <TouchableOpacity
            style={[styles.githubBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder, opacity: loading ? 0.7 : 1 }]}
            onPress={handleGitHubSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-github" size={20} color={colors.text} />
            <Text style={[styles.githubBtnText, { color: colors.text }]}>Continue with GitHub</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  topSection: { alignItems: 'center', gap: Spacing.sm },
  logoRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  logoInner: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  appName: { fontSize: 28, fontFamily: Fonts.bold },
  tagline: { fontSize: 13, fontFamily: Fonts.regular },
  toggleRow: {
    flexDirection: 'row', borderRadius: Radius.full,
    borderWidth: 1, padding: 4,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.full,
    alignItems: 'center',
  },
  toggleText: { fontSize: 14, fontFamily: Fonts.semiBold },
  form: { gap: Spacing.md },
  feedbackBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1,
  },
  feedbackText: { fontSize: 13, fontFamily: Fonts.regular, flex: 1, lineHeight: 18 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: 15, fontFamily: Fonts.regular },
  eyeBtn: { padding: 4 },
  submitBtn: {
    height: 52, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { fontSize: 16, fontFamily: Fonts.semiBold, color: '#fff' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontFamily: Fonts.regular },
  githubBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, height: 52, borderRadius: Radius.full, borderWidth: 1,
  },
  githubBtnText: { fontSize: 15, fontFamily: Fonts.semiBold },
  disclaimer: { fontSize: 11, fontFamily: Fonts.regular, textAlign: 'center', lineHeight: 16 },
});
