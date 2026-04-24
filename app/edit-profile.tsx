import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Platform, Alert, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Fonts, Spacing, Radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { username, email } = useUserStats();
  const topPad = Platform.OS === 'web' ? 24 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const [newUsername, setNewUsername] = useState(username);
  const [saving, setSaving] = useState(false);

  const dirty = newUsername.trim().length > 0 && newUsername.trim() !== username;

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          data: { username: newUsername.trim() },
        });
        if (error) {
          Alert.alert('Could not save', error.message);
          return;
        }
      }
      Alert.alert('Saved', 'Your display name has been updated.');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + Spacing.xl }]}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.accentDim, borderColor: colors.accent }]}>
            <Text style={[styles.avatarInitial, { color: colors.accent }]}>
              {(newUsername || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
            Your avatar uses the first letter of your display name.
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Display Name</Text>
        <View style={[styles.inputWrap, { borderColor: colors.surfaceBorder, backgroundColor: colors.surface }]}>
          <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={{ marginRight: Spacing.sm }} />
          <TextInput
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Enter your display name"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text }]}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            maxLength={40}
          />
        </View>

        <Text style={[styles.label, { color: colors.textSecondary, marginTop: Spacing.md }]}>Email</Text>
        <View style={[styles.inputWrap, { borderColor: colors.surfaceBorder, backgroundColor: colors.surface, opacity: 0.7 }]}>
          <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={{ marginRight: Spacing.sm }} />
          <Text style={[styles.input, { color: colors.text }]} numberOfLines={1}>
            {email || '—'}
          </Text>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textSecondary} />
        </View>
        <Text style={[styles.helper, { color: colors.textSecondary }]}>
          Email is tied to your account and can't be changed here.
        </Text>

        {!isSupabaseConfigured && (
          <View style={[styles.notice, { backgroundColor: colors.warningDim, borderColor: colors.warning }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
            <Text style={[styles.noticeText, { color: colors.warning }]}>
              You're in guest mode. Sign in to keep changes across devices.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: dirty ? colors.accent : colors.surface, borderColor: dirty ? colors.accent : colors.surfaceBorder },
          ]}
          onPress={handleSave}
          disabled={!dirty || saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={dirty ? '#fff' : colors.textSecondary} />
          ) : (
            <Text style={[styles.saveText, { color: dirty ? '#fff' : colors.textSecondary }]}>
              Save changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: Fonts.semiBold },
  content: { paddingHorizontal: Spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  avatarInitial: { fontSize: 38, fontFamily: Fonts.bold },
  avatarHint: { fontSize: 12, fontFamily: Fonts.regular, textAlign: 'center', maxWidth: 260 },
  label: { fontSize: 12, fontFamily: Fonts.semiBold, marginBottom: 6, marginTop: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'web' ? Spacing.sm : 4,
  },
  input: { flex: 1, fontSize: 15, fontFamily: Fonts.regular, paddingVertical: Spacing.sm },
  helper: { fontSize: 12, fontFamily: Fonts.regular, marginTop: 6 },
  notice: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.md,
  },
  noticeText: { flex: 1, fontSize: 13, fontFamily: Fonts.medium },
  saveBtn: {
    marginTop: Spacing.lg, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, alignItems: 'center',
  },
  saveText: { fontSize: 15, fontFamily: Fonts.semiBold },
});
